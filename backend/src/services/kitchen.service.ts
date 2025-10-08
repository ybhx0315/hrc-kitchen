import { OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export interface KitchenOrderFilters {
  date?: string; // ISO date string
  fulfillmentStatus?: OrderStatus;
  menuItemId?: string;
}

export class KitchenService {
  /**
   * Get all orders for kitchen staff with optional filters
   */
  async getOrders(filters: KitchenOrderFilters = {}) {
    const { date, fulfillmentStatus, menuItemId } = filters;

    // Build where clause
    const where: any = {};

    // Filter by date (default to today)
    if (date) {
      // Parse date as local timezone by appending time
      const orderDate = new Date(date + 'T00:00:00');
      where.orderDate = orderDate;
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.orderDate = today;
    }

    // Filter by fulfillment status
    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus;
    }

    // Filter by menu item (requires join)
    if (menuItemId) {
      where.orderItems = {
        some: {
          menuItemId
        }
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return orders;
  }

  /**
   * Get order summary grouped by menu item for batch preparation
   */
  async getOrderSummary(date?: string) {
    // Build where clause for date
    let orderDate: Date;
    if (date) {
      // Parse date as local timezone by appending time
      orderDate = new Date(date + 'T00:00:00');
    } else {
      orderDate = new Date();
      orderDate.setHours(0, 0, 0, 0);
    }

    const orders = await prisma.order.findMany({
      where: {
        orderDate
        // Don't filter by payment status - show all orders for batch preparation
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Group by menu item
    const summary: Record<string, {
      menuItem: any;
      totalQuantity: number;
      orders: Array<{
        orderId: string;
        orderNumber: string;
        quantity: number;
        customizations: any;
        customerName: string;
        fulfillmentStatus: OrderStatus;
      }>;
    }> = {};

    for (const order of orders) {
      for (const item of order.orderItems) {
        const key = item.menuItemId;

        if (!summary[key]) {
          summary[key] = {
            menuItem: item.menuItem,
            totalQuantity: 0,
            orders: []
          };
        }

        summary[key].totalQuantity += item.quantity;
        summary[key].orders.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          quantity: item.quantity,
          customizations: item.customizations,
          selectedVariations: item.selectedVariations,
          customerName: order.user.fullName,
          fulfillmentStatus: order.fulfillmentStatus
        });
      }
    }

    // Convert to array and sort by total quantity (most popular first)
    const summaryArray = Object.values(summary).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    return summaryArray;
  }

  /**
   * Update order item fulfillment status
   */
  async updateOrderItemStatus(orderItemId: string, status: OrderStatus) {
    // Validate status transition (PARTIALLY_FULFILLED is set automatically)
    const validStatuses: OrderStatus[] = ['PLACED', 'FULFILLED'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid fulfillment status: ${status}. Use PLACED or FULFILLED for items.`);
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId }
    });

    if (!orderItem) {
      throw new Error('Order item not found');
    }

    // Prevent un-fulfilling fulfilled items
    if (orderItem.fulfillmentStatus === 'FULFILLED' && status !== 'FULFILLED') {
      throw new Error('Cannot change status of fulfilled items');
    }

    // Update the order item status
    const updatedItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        fulfillmentStatus: status
      },
      include: {
        menuItem: {
          select: {
            name: true,
            description: true,
            imageUrl: true
          }
        }
      }
    });

    // Update the parent order status based on all items
    await this.updateOrderStatusFromItems(orderItem.orderId);

    return updatedItem;
  }

  /**
   * Update order status based on its items' statuses
   */
  private async updateOrderStatusFromItems(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate order status based on item statuses
    const allItemsFulfilled = order.orderItems.every(
      item => item.fulfillmentStatus === 'FULFILLED'
    );
    const anyItemFulfilled = order.orderItems.some(
      item => item.fulfillmentStatus === 'FULFILLED'
    );

    let newOrderStatus: OrderStatus;
    if (allItemsFulfilled) {
      newOrderStatus = 'FULFILLED';
    } else if (anyItemFulfilled) {
      newOrderStatus = 'PARTIALLY_FULFILLED';
    } else {
      newOrderStatus = 'PLACED';
    }

    // Update order status if it changed
    if (order.fulfillmentStatus !== newOrderStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          fulfillmentStatus: newOrderStatus,
          updatedAt: new Date()
        }
      });
    }
  }

  /**
   * Update order fulfillment status (updates all items)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    // Validate status transition
    const validStatuses: OrderStatus[] = ['PLACED', 'FULFILLED'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid fulfillment status: ${status}`);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update all order items to the same status
    await prisma.orderItem.updateMany({
      where: { orderId },
      data: {
        fulfillmentStatus: status
      }
    });

    // Update the order itself
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
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

    return updatedOrder;
  }

  /**
   * Get daily statistics for kitchen dashboard
   */
  async getDailyStats(date?: string) {
    let orderDate: Date;
    if (date) {
      // Parse date as local timezone by appending time
      orderDate = new Date(date + 'T00:00:00');
    } else {
      orderDate = new Date();
      orderDate.setHours(0, 0, 0, 0);
    }

    const orders = await prisma.order.findMany({
      where: {
        orderDate
      }
    });

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => {
        const amount = Number(order.totalAmount);
        return sum + amount;
      }, 0),
      ordersByStatus: {
        PLACED: 0,
        PARTIALLY_FULFILLED: 0,
        FULFILLED: 0
      },
      ordersByPayment: {
        PENDING: 0,
        COMPLETED: 0,
        FAILED: 0,
        REFUNDED: 0
      }
    };

    orders.forEach(order => {
      stats.ordersByStatus[order.fulfillmentStatus as OrderStatus]++;
      stats.ordersByPayment[order.paymentStatus as keyof typeof stats.ordersByPayment]++;
    });

    return stats;
  }
}
