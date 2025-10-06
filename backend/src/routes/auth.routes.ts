import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', AuthController.register);

// POST /api/v1/auth/login
router.post('/login', AuthController.login);

// POST /api/v1/auth/verify-email
router.post('/verify-email', AuthController.verifyEmail);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', AuthController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', AuthController.resetPassword);

export default router;
