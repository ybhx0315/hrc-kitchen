import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/v1/payment/create-intent
router.post('/create-intent', authenticate, PaymentController.createPaymentIntent);

// POST /api/v1/payment/confirm
router.post('/confirm', authenticate, PaymentController.confirmPayment);

// POST /api/v1/payment/webhook
// Note: This endpoint should NOT use authenticate middleware
router.post('/webhook', PaymentController.handleWebhook);

export default router;
