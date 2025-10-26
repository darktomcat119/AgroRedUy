import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  /**
   * Get user by ID
   * @route GET /users/:id
   */
  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Users can only access their own profile unless they're admin
      if (id !== userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPERADMIN') {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own profile.'
        });
        return;
      }

      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   * @route PUT /users/:id
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      // Users can only update their own profile unless they're admin
      if (id !== userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPERADMIN') {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile.'
        });
        return;
      }

      // Validate required fields
      if (!updateData.firstName || !updateData.lastName || !updateData.email) {
        res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      // Validate phone format if provided
      if (updateData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(updateData.phone.replace(/\s/g, ''))) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone format'
        });
        return;
      }

      // Validate gender if provided
      if (updateData.gender && !['MALE', 'FEMALE', 'OTHER'].includes(updateData.gender)) {
        res.status(400).json({
          success: false,
          message: 'Invalid gender. Must be MALE, FEMALE, or OTHER'
        });
        return;
      }

      const updatedUser = await userService.updateUser(id, updateData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get user profile (public information)
   * @route GET /users/:id/profile
   */
  async getUserProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const userProfile = await userService.getUserProfile(id);

      if (!userProfile) {
        res.status(404).json({
          success: false,
          message: 'User profile not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: userProfile
      });
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Delete user account
   * @route DELETE /users/:id
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Users can only delete their own account unless they're admin
      if (id !== userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPERADMIN') {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own account.'
        });
        return;
      }

      await userService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}
