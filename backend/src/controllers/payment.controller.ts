import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  static async createPaymentIntent(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { amount, orderId } = req.body;

      if (!amount || amount <= 0) {
        throw new ApiError(400, 'Valid amount is required');
      }

      if (!req.user) {
        throw new ApiError(401, 'Unauthorized');
      }

      const paymentIntent = await PaymentService.createPaymentIntent({
        amount,
        orderId,
        customerEmail: req.user.email,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        throw new ApiError(400, 'Payment intent ID is required');
      }

      const paymentIntent = await PaymentService.confirmPayment(paymentIntentId);

      res.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        throw new ApiError(400, 'Missing stripe-signature header');
      }

      await PaymentService.handleWebhook(req.body, signature);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}
