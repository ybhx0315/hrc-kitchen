import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import adminService from '../services/admin.service';
import UploadService from '../services/upload.service';
import { Weekday, Category, UserRole } from '@prisma/client';

export class AdminController {
  /**
   * POST /api/v1/admin/menu/items
   * Create a new menu item
   */
  async createMenuItem(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        description,
        price,
        category,
        weekday,
        imageUrl,
        dietaryTags,
        isActive = true,
      } = req.body;

      // Validation
      if (!name || !price || !category || !weekday) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, price, category, weekday',
        });
      }

      const item = await adminService.createMenuItem({
        name,
        description: description || '',
        price: parseFloat(price),
        category: category as Category,
        weekday: weekday as Weekday,
        imageUrl,
        dietaryTags: dietaryTags || [],
        isActive,
      });

      res.status(201).json({
        success: true,
        data: item,
        message: 'Menu item created successfully',
      });
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create menu item',
      });
    }
  }

  /**
   * PUT /api/v1/admin/menu/items/:id
   * Update a menu item
   */
  async updateMenuItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convert price to float if provided
      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      const item = await adminService.updateMenuItem(id, updateData);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found',
        });
      }

      res.json({
        success: true,
        data: item,
        message: 'Menu item updated successfully',
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu item',
      });
    }
  }

  /**
   * DELETE /api/v1/admin/menu/items/:id
   * Delete/deactivate a menu item
   */
  async deleteMenuItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;

      if (permanent === 'true') {
        // Permanently delete
        await adminService.deleteMenuItem(id);
      } else {
        // Soft delete (deactivate)
        await adminService.updateMenuItem(id, { isActive: false });
      }

      res.json({
        success: true,
        message: permanent === 'true'
          ? 'Menu item deleted permanently'
          : 'Menu item deactivated',
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu item',
      });
    }
  }

  /**
   * POST /api/v1/admin/menu/items/:id/customizations
   * Add a customization option to a menu item
   */
  async addCustomization(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Customization name is required',
        });
      }

      const customization = await adminService.addCustomization(id, name);

      res.status(201).json({
        success: true,
        data: customization,
        message: 'Customization added successfully',
      });
    } catch (error) {
      console.error('Error adding customization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add customization',
      });
    }
  }

  /**
   * DELETE /api/v1/admin/menu/customizations/:id
   * Remove a customization option
   */
  async deleteCustomization(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await adminService.deleteCustomization(id);

      res.json({
        success: true,
        message: 'Customization deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting customization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete customization',
      });
    }
  }

  /**
   * GET /api/v1/admin/users
   * Get all users with pagination and filtering
   */
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        role,
        search,
        isActive,
      } = req.query;

      const filters = {
        role: role as UserRole | undefined,
        search: search as string | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      };

      const result = await adminService.getUsers(
        parseInt(page as string),
        parseInt(limit as string),
        filters
      );

      res.json({
        success: true,
        data: result.users,
        pagination: {
          total: result.total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(result.total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/role
   * Update user role
   */
  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['STAFF', 'KITCHEN', 'ADMIN'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be STAFF, KITCHEN, or ADMIN',
        });
      }

      // Prevent self-demotion
      if (id === req.user?.id && role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Cannot demote yourself',
        });
      }

      const user = await adminService.updateUserRole(id, role as UserRole);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'User role updated successfully',
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user role',
      });
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   * Activate/deactivate user
   */
  async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean',
        });
      }

      // Prevent self-deactivation
      if (id === req.user?.id && !isActive) {
        return res.status(403).json({
          success: false,
          message: 'Cannot deactivate yourself',
        });
      }

      const user = await adminService.updateUserStatus(id, isActive);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
      });
    }
  }

  /**
   * GET /api/v1/admin/config
   * Get all system configuration
   */
  async getConfig(req: AuthRequest, res: Response) {
    try {
      const config = await adminService.getConfig();

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system configuration',
      });
    }
  }

  /**
   * PUT /api/v1/admin/config
   * Update system configuration
   */
  async updateConfig(req: AuthRequest, res: Response) {
    try {
      const { orderingWindowStart, orderingWindowEnd } = req.body;

      // Validation
      if (orderingWindowStart && orderingWindowEnd) {
        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!timeRegex.test(orderingWindowStart) || !timeRegex.test(orderingWindowEnd)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid time format. Use HH:MM (e.g., 08:00)',
          });
        }

        // Validate end time is after start time
        const [startHour, startMin] = orderingWindowStart.split(':').map(Number);
        const [endHour, endMin] = orderingWindowEnd.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
          return res.status(400).json({
            success: false,
            message: 'End time must be after start time',
          });
        }
      }

      const config = await adminService.updateConfig({
        orderingWindowStart,
        orderingWindowEnd,
      });

      res.json({
        success: true,
        data: config,
        message: 'System configuration updated successfully',
      });
    } catch (error) {
      console.error('Error updating config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system configuration',
      });
    }
  }

  /**
   * POST /api/v1/admin/upload/signature
   * Generate signed upload signature for Cloudinary
   */
  async getUploadSignature(req: AuthRequest, res: Response) {
    try {
      const { folder = 'menu-items' } = req.body;

      const signature = await UploadService.generateUploadSignature(folder);

      res.json({
        success: true,
        data: signature,
      });
    } catch (error) {
      console.error('Error generating upload signature:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate upload signature',
      });
    }
  }

  /**
   * POST /api/v1/admin/upload/image
   * Upload image to Cloudinary (server-side)
   */
  async uploadImage(req: AuthRequest, res: Response) {
    try {
      const { imageData, folder = 'menu-items' } = req.body;

      if (!imageData) {
        return res.status(400).json({
          success: false,
          message: 'Image data is required',
        });
      }

      const imageUrl = await UploadService.uploadImage(imageData, folder);

      res.json({
        success: true,
        data: { url: imageUrl },
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
      });
    }
  }
}

export default new AdminController();
