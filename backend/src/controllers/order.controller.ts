import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../types/order.types';
import prisma from '../lib/prisma';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const orderData: CreateOrderDto = req.body;

      const result = await this.orderService.createOrder(userId, orderData);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order'
      });
    }
  };

  getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const orderId = req.params.id;

      const order = await this.orderService.getOrderById(orderId, userId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  };

  getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Extract query parameters
      const { startDate, endDate, page, limit } = req.query;

      const options = {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const result = await this.orderService.getUserOrders(userId, options);

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: options.limit || 20
        }
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch orders'
      });
    }
  };

  createGuestOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { guestInfo, ...orderData } = req.body;

      if (!guestInfo?.email || !guestInfo?.firstName || !guestInfo?.lastName) {
        res.status(400).json({
          success: false,
          message: 'Guest information (email, firstName, lastName) is required'
        });
        return;
      }

      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: guestInfo.email },
        select: { email: true }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in to continue.',
          code: 'EMAIL_EXISTS'
        });
        return;
      }

      const result = await this.orderService.createGuestOrder(orderData, guestInfo);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error creating guest order:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order'
      });
    }
  };

  getGuestOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;

      const order = await this.orderService.getGuestOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching guest order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  };
}
