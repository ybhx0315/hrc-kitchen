import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../types/order.types';

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

      const orders = await this.orderService.getUserOrders(userId);

      res.json({
        success: true,
        data: orders
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
}
