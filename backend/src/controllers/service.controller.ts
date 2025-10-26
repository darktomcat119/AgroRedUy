import { Request, Response } from 'express';
import { ServiceService } from '../services/service.service';
import { logger } from '../config/logger';

/**
 * @fileoverview Service Controller - Handles all service-related HTTP requests
 * @description This controller manages service operations including creating,
 * updating, retrieving, and searching services.
 */

export class ServiceController {
  private serviceService: ServiceService;

  constructor() {
    this.serviceService = new ServiceService();
  }

  /**
   * @description Get all services with filters and pagination
   * @route GET /services
   * @access Public
   */
  public getServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        categoryId,
        city,
        department,
        minPrice,
        maxPrice,
        latitude,
        longitude,
        radius,
        search,
        page = 1,
        limit = 20
      } = req.query;

      const filters: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      if (categoryId) filters.categoryId = categoryId as string;
      if (city) filters.city = city as string;
      if (department) filters.department = department as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (latitude) filters.latitude = parseFloat(latitude as string);
      if (longitude) filters.longitude = parseFloat(longitude as string);
      if (radius) filters.radius = parseFloat(radius as string);
      if (search) filters.search = search as string;

      const result = await this.serviceService.getServices(filters);

      res.json({
        success: true,
        data: result,
        message: 'Services retrieved successfully'
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
   * @description Get service by ID
   * @route GET /services/:id
   * @access Public
   */
  public getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SERVICE_ID',
            message: 'Service ID is required'
          }
        });
        return;
      }

      const service = await this.serviceService.getServiceById(id);

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
        data: service,
        message: 'Service retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error fetching service:', error);
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
   * @description Create a new service
   * @route POST /services
   * @access Private
   */
  public createService = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const serviceData = {
        ...req.body,
        userId
      };

      const service = await this.serviceService.createService(serviceData);

      res.status(201).json({
        success: true,
        data: service,
        message: 'Service created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating service:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_SERVICE_FAILED',
          message: error.message || 'Failed to create service'
        }
      });
    }
  };

  /**
   * @description Update service
   * @route PUT /services/:id
   * @access Private
   */
  public updateService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SERVICE_ID',
            message: 'Service ID is required'
          }
        });
        return;
      }

      const service = await this.serviceService.updateService(id, updateData, userId);

      res.json({
        success: true,
        data: service,
        message: 'Service updated successfully'
      });
    } catch (error: any) {
      logger.error('Error updating service:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_SERVICE_FAILED',
          message: error.message || 'Failed to update service'
        }
      });
    }
  };

  /**
   * @description Delete service
   * @route DELETE /services/:id
   * @access Private
   */
  public deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SERVICE_ID',
            message: 'Service ID is required'
          }
        });
        return;
      }

      await this.serviceService.deleteService(id, userId);

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting service:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_SERVICE_FAILED',
          message: error.message || 'Failed to delete service'
        }
      });
    }
  };

  /**
   * @description Get user's services
   * @route GET /services/my-services
   * @access Private
   */
  public getMyServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;

      const result = await this.serviceService.getUserServices(userId, page, limit);

      res.json({
        success: true,
        data: result,
        message: 'User services retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error fetching user services:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_USER_SERVICES_FAILED',
          message: 'Failed to fetch user services'
        }
      });
    }
  };

  /**
   * @description Get service categories
   * @route GET /services/categories
   * @access Public
   */
  public getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.serviceService.getCategories();

      res.json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CATEGORIES_FAILED',
          message: 'Failed to fetch categories'
        }
      });
    }
  };
}
