import { Request, Response } from 'express';
import { AdminService, UserFilters, ServiceFilters, BookingFilters } from '../services/admin.service';
import { logger } from '../config/logger';

const adminService = new AdminService();

export class AdminController {
  /**
   * Get all users with filtering and pagination
   * @route GET /admin/users
   * @access Admin only
   */
  public getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: UserFilters = {
        role: req.query.role as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await adminService.getUsers(filters);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: result.users,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_USERS_FAILED',
          message: 'Failed to fetch users'
        }
      });
    }
  };

  /**
   * Get user by ID
   * @route GET /admin/users/:id
   * @access Admin only
   */
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await adminService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error: any) {
      logger.error('Error fetching user by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_USER_FAILED',
          message: 'Failed to fetch user'
        }
      });
    }
  };

  /**
   * Update user
   * @route PUT /admin/users/:id
   * @access Admin only
   */
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userData = req.body;

      const updatedUser = await adminService.updateUser(id, userData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error: any) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_USER_FAILED',
          message: 'Failed to update user'
        }
      });
    }
  };

  /**
   * Delete user
   * @route DELETE /admin/users/:id
   * @access Admin only
   */
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_USER_FAILED',
          message: 'Failed to delete user'
        }
      });
    }
  };

  /**
   * Get all services with filtering and pagination
   * @route GET /admin/services
   * @access Admin only
   */
  public getServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: ServiceFilters = {
        categoryId: req.query.categoryId as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await adminService.getServices(filters);

      res.json({
        success: true,
        message: 'Services retrieved successfully',
        data: result.services,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching services:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SERVICES_FAILED',
          message: 'Failed to fetch services'
        }
      });
    }
  };

  /**
   * Get service by ID
   * @route GET /admin/services/:id
   * @access Admin only
   */
  public getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const service = await adminService.getServiceById(id);

      if (!service) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SERVICE_NOT_FOUND',
            message: 'Service not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Service retrieved successfully',
        data: service
      });
    } catch (error: any) {
      logger.error('Error fetching service by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SERVICE_FAILED',
          message: 'Failed to fetch service'
        }
      });
    }
  };

  /**
   * Update service
   * @route PUT /admin/services/:id
   * @access Admin only
   */
  public updateService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const serviceData = req.body;

      const updatedService = await adminService.updateService(id, serviceData);

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: updatedService
      });
    } catch (error: any) {
      logger.error('Error updating service:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_SERVICE_FAILED',
          message: 'Failed to update service'
        }
      });
    }
  };

  /**
   * Delete service
   * @route DELETE /admin/services/:id
   * @access Admin only
   */
  public deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await adminService.deleteService(id);

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting service:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_SERVICE_FAILED',
          message: 'Failed to delete service'
        }
      });
    }
  };

  /**
   * Get all bookings with filtering and pagination
   * @route GET /admin/bookings
   * @access Admin only
   */
  public getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: BookingFilters = {
        status: req.query.status as string,
        serviceId: req.query.serviceId as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await adminService.getBookings(filters);

      res.json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: result.bookings,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKINGS_FAILED',
          message: 'Failed to fetch bookings'
        }
      });
    }
  };

  /**
   * Get booking by ID
   * @route GET /admin/bookings/:id
   * @access Admin only
   */
  public getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await adminService.getBookingById(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Booking retrieved successfully',
        data: booking
      });
    } catch (error: any) {
      logger.error('Error fetching booking by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKING_FAILED',
          message: 'Failed to fetch booking'
        }
      });
    }
  };

  /**
   * Update booking status
   * @route PUT /admin/bookings/:id/status
   * @access Admin only
   */
  public updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_STATUS',
            message: 'Status is required'
          }
        });
        return;
      }

      const updatedBooking = await adminService.updateBookingStatus(id, status);

      res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: updatedBooking
      });
    } catch (error: any) {
      logger.error('Error updating booking status:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_BOOKING_STATUS_FAILED',
          message: 'Failed to update booking status'
        }
      });
    }
  };

  /**
   * Get platform statistics
   * @route GET /admin/statistics
   * @access Admin only
   */
  public getStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = '30d' } = req.query;
      const statistics = await adminService.getStatistics(period as string);

      res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics
      });
    } catch (error: any) {
      logger.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_STATISTICS_FAILED',
          message: 'Failed to fetch statistics'
        }
      });
    }
  };

  /**
   * Get content management data
   * @route GET /admin/content
   * @access Admin only
   */
  public getContentManagement = async (_req: Request, res: Response): Promise<void> => {
    try {
      const content = await adminService.getContentManagement();

      res.json({
        success: true,
        message: 'Content management data retrieved successfully',
        data: content
      });
    } catch (error: any) {
      logger.error('Error fetching content management:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CONTENT_FAILED',
          message: 'Failed to fetch content management data'
        }
      });
    }
  };

  /**
   * Get system health
   * @route GET /admin/health
   * @access Admin only
   */
  public getSystemHealth = async (_req: Request, res: Response): Promise<void> => {
    try {
      const health = await adminService.getSystemHealth();

      res.json({
        success: true,
        message: 'System health retrieved successfully',
        data: health
      });
    } catch (error: any) {
      logger.error('Error fetching system health:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_HEALTH_FAILED',
          message: 'Failed to fetch system health'
        }
      });
    }
  };
}