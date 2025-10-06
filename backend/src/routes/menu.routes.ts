import { Router } from 'express';
import menuController from '../controllers/menu.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/menu/today
 * @desc    Get today's menu items
 * @access  Private (authenticated users)
 */
router.get('/today', authenticate, menuController.getTodaysMenu);

/**
 * @route   GET /api/v1/menu/week
 * @desc    Get full weekly menu
 * @access  Private (admin only - to be added)
 */
router.get('/week', authenticate, menuController.getWeeklyMenu);

/**
 * @route   GET /api/v1/menu/items/:id
 * @desc    Get single menu item by ID
 * @access  Private (authenticated users)
 */
router.get('/items/:id', authenticate, menuController.getMenuItem);

export default router;
