import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export interface CreatePaymentIntentDTO {
  amount: number;
  currency?: string;
  orderId?: string;
  customerEmail: string;
}

export class PaymentService {
  static async createPaymentIntent(data: CreatePaymentIntentDTO): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || process.env.STRIPE_CURRENCY || 'aud',
        metadata: {
          orderId: data.orderId || '',
          customerEmail: data.customerEmail,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new ApiError(500, 'Failed to create payment intent');
    }
  }

  static async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new ApiError(400, 'Payment has not been completed');
      }

      return paymentIntent;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Payment confirmation failed:', error);
      throw new ApiError(500, 'Failed to confirm payment');
    }
  }

  static async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return refund;
    } catch (error) {
      console.error('Refund creation failed:', error);
      throw new ApiError(500, 'Failed to create refund');
    }
  }

  static async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return event;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      throw new ApiError(400, 'Invalid webhook signature');
    }
  }

  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          paymentId: paymentIntent.id,
        },
      });

      console.log(`Payment succeeded for order ${orderId}`);
    }
  }

  private static async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });

      console.log(`Payment failed for order ${orderId}`);
    }
  }
}
