import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../middleware/errorHandler';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName, department, location, phone } = req.body;

      if (!email || !password || !fullName) {
        throw new ApiError(400, 'Email, password, and full name are required');
      }

      const user = await AuthService.register({
        email,
        password,
        fullName,
        department,
        location,
        phone,
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
      }

      const result = await AuthService.login({ email, password });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError(400, 'Verification token is required');
      }

      // TODO: Validate token and extract userId
      // For now, using a placeholder
      const userId = 'placeholder';

      await AuthService.verifyEmail(userId);

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(400, 'Email is required');
      }

      await AuthService.requestPasswordReset(email);

      res.json({ message: 'If an account exists, a password reset link has been sent' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ApiError(400, 'Token and new password are required');
      }

      // TODO: Validate token and extract userId
      const userId = 'placeholder';

      await AuthService.resetPassword(userId, newPassword);

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }
}
