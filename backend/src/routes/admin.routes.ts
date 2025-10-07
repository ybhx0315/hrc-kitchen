import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * Menu Management Routes
 */

/**
 * @route   POST /api/v1/admin/menu/items
 * @desc    Create a new menu item
 * @access  Admin only
 */
router.post('/menu/items', adminController.createMenuItem);

/**
 * @route   PUT /api/v1/admin/menu/items/:id
 * @desc    Update a menu item
 * @access  Admin only
 */
router.put('/menu/items/:id', adminController.updateMenuItem);

/**
 * @route   DELETE /api/v1/admin/menu/items/:id
 * @desc    Delete/deactivate a menu item
 * @access  Admin only
 */
router.delete('/menu/items/:id', adminController.deleteMenuItem);

/**
 * @route   POST /api/v1/admin/menu/items/:id/customizations
 * @desc    Add a customization option to a menu item
 * @access  Admin only
 */
router.post('/menu/items/:id/customizations', adminController.addCustomization);

/**
 * @route   DELETE /api/v1/admin/menu/customizations/:id
 * @desc    Remove a customization option
 * @access  Admin only
 */
router.delete('/menu/customizations/:id', adminController.deleteCustomization);

/**
 * User Management Routes
 */

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin only
 */
router.get('/users', adminController.getUsers);

/**
 * @route   PATCH /api/v1/admin/users/:id/role
 * @desc    Update user role
 * @access  Admin only
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @desc    Activate/deactivate user
 * @access  Admin only
 */
router.patch('/users/:id/status', adminController.updateUserStatus);

/**
 * System Configuration Routes
 */

/**
 * @route   GET /api/v1/admin/config
 * @desc    Get all system configuration
 * @access  Admin only
 */
router.get('/config', adminController.getConfig);

/**
 * @route   PUT /api/v1/admin/config
 * @desc    Update system configuration
 * @access  Admin only
 */
router.put('/config', adminController.updateConfig);

/**
 * Upload Routes
 */

/**
 * @route   POST /api/v1/admin/upload/signature
 * @desc    Generate signed upload signature for Cloudinary
 * @access  Admin only
 */
router.post('/upload/signature', adminController.getUploadSignature);

/**
 * @route   POST /api/v1/admin/upload/image
 * @desc    Upload image to Cloudinary (server-side)
 * @access  Admin only
 */
router.post('/upload/image', adminController.uploadImage);

export default router;
