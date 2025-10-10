import { Router } from 'express';
import menuController from '../controllers/menu.controller';

const router = Router();

/**
 * @route   GET /api/v1/menu/today
 * @desc    Get today's menu items
 * @access  Public (no authentication required for guest checkout)
 */
router.get('/today', menuController.getTodaysMenu);

/**
 * @route   GET /api/v1/menu/week
 * @desc    Get full weekly menu
 * @access  Public (no authentication required for guest checkout)
 */
router.get('/week', menuController.getWeeklyMenu);

/**
 * @route   GET /api/v1/menu/items/:id
 * @desc    Get single menu item by ID
 * @access  Public (no authentication required for guest checkout)
 */
router.get('/items/:id', menuController.getMenuItem);

export default router;
