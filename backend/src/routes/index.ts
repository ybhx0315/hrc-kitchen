import { Router } from 'express';
import authRoutes from './auth.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import kitchenRoutes from './kitchen.routes';

const router = Router();

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    version: process.env.API_VERSION || 'v1',
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/kitchen', kitchenRoutes);

// TODO: Add remaining route modules
// import adminRoutes from './admin.routes';
// import paymentRoutes from './payment.routes';

// router.use('/admin', adminRoutes);
// router.use('/payment', paymentRoutes);

export default router;
