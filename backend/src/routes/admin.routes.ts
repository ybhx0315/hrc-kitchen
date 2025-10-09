import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import reportController from '../controllers/report.controller';
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
 * Variation Group Routes
 */

/**
 * @route   POST /api/v1/admin/menu/items/:id/variation-groups
 * @desc    Create a variation group for a menu item
 * @access  Admin only
 */
router.post('/menu/items/:id/variation-groups', adminController.createVariationGroup);

/**
 * @route   GET /api/v1/admin/menu/items/:id/variation-groups
 * @desc    Get all variation groups for a menu item
 * @access  Admin only
 */
router.get('/menu/items/:id/variation-groups', adminController.getVariationGroups);

/**
 * @route   PUT /api/v1/admin/variation-groups/:id
 * @desc    Update a variation group
 * @access  Admin only
 */
router.put('/variation-groups/:id', adminController.updateVariationGroup);

/**
 * @route   DELETE /api/v1/admin/variation-groups/:id
 * @desc    Delete a variation group
 * @access  Admin only
 */
router.delete('/variation-groups/:id', adminController.deleteVariationGroup);

/**
 * Variation Option Routes
 */

/**
 * @route   POST /api/v1/admin/variation-groups/:id/options
 * @desc    Create a variation option
 * @access  Admin only
 */
router.post('/variation-groups/:id/options', adminController.createVariationOption);

/**
 * @route   GET /api/v1/admin/variation-groups/:id/options
 * @desc    Get all options for a variation group
 * @access  Admin only
 */
router.get('/variation-groups/:id/options', adminController.getVariationOptions);

/**
 * @route   PUT /api/v1/admin/variation-options/:id
 * @desc    Update a variation option
 * @access  Admin only
 */
router.put('/variation-options/:id', adminController.updateVariationOption);

/**
 * @route   DELETE /api/v1/admin/variation-options/:id
 * @desc    Delete a variation option
 * @access  Admin only
 */
router.delete('/variation-options/:id', adminController.deleteVariationOption);

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

/**
 * Report Routes
 */

/**
 * @route   GET /api/v1/admin/reports/revenue-by-user
 * @desc    Get revenue by user report with dynamic date range
 * @access  Admin only
 * @query   startDate, endDate, format (json|csv)
 */
router.get('/reports/revenue-by-user', reportController.getRevenueByUser);

/**
 * @route   GET /api/v1/admin/reports/popular-items
 * @desc    Get popular items report with dynamic date range
 * @access  Admin only
 * @query   startDate, endDate, format (json|csv)
 */
router.get('/reports/popular-items', reportController.getPopularItems);

/**
 * @route   GET /api/v1/admin/reports/summary
 * @desc    Get summary statistics report with dynamic date range
 * @access  Admin only
 * @query   startDate, endDate
 */
router.get('/reports/summary', reportController.getSummary);

/**
 * @route   GET /api/v1/admin/reports/orders
 * @desc    Get detailed orders report with dynamic date range and filters
 * @access  Admin only
 * @query   startDate, endDate, paymentStatus, fulfillmentStatus, format (json|csv)
 */
router.get('/reports/orders', reportController.getOrders);

export default router;
