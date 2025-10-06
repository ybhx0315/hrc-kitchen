import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, OrderWithDetails } from '../types/order.types';
import { PaymentService } from './payment.service';
import { ConfigService } from './config.service';

const prisma = new PrismaClient();

export class OrderService {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  async createOrder(userId: string, orderData: CreateOrderDto): Promise<{ order: any; clientSecret: string }> {
    // Validate ordering window
    const windowStatus = await this.configService.isOrderingWindowActive();
    if (!windowStatus.active) {
      throw new Error(windowStatus.message || 'Ordering is currently not available');
    }

    // Validate items exist and calculate total
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: orderData.items.map(item => item.menuItemId) },
        isActive: true
      }
    });

    if (menuItems.length !== orderData.items.length) {
      throw new Error('One or more menu items are invalid or unavailable');
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = orderData.items.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

      const priceNum = Number(menuItem.price);
      const subtotal = priceNum * item.quantity;
      totalAmount += subtotal;

      // Build customizations object
      const customizationsObj: any = {};
      if (item.customizations) {
        customizationsObj.customizations = item.customizations;
      }
      if (item.specialRequests) {
        customizationsObj.specialRequests = item.specialRequests;
      }

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtPurchase: menuItem.price,
        customizations: Object.keys(customizationsObj).length > 0 ? customizationsObj : null
      };
    });

    // Round to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Get today's date (without time)
    const today = new Date();
    const orderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Build special requests string
    const specialRequests = orderData.deliveryNotes || null;

    // Get user email for payment intent
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create order with payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment intent with Stripe first
      const paymentIntent = await PaymentService.createPaymentIntent({
        amount: totalAmount,
        customerEmail: user.email,
        orderId: undefined // We don't have the orderId yet
      });

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'PLACED',
          specialRequests,
          orderDate,
          paymentId: paymentIntent.id,
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  description: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      });

      return { order, clientSecret: paymentIntent.client_secret };
    });

    return result;
  }

  async getOrderById(orderId: string, userId: string): Promise<any | null> {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                description: true,
                imageUrl: true,
                price: true
              }
            }
          }
        }
      }
    });

    return order;
  }

  async getUserOrders(userId: string): Promise<any[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                description: true,
                imageUrl: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders;
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    // Get count of orders today
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }
}
