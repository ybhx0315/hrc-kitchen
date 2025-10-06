import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticate);

// Create new order
router.post('/', orderController.createOrder);

// Get user's orders
router.get('/', orderController.getUserOrders);

// Get specific order
router.get('/:id', orderController.getOrder);

export default router;
