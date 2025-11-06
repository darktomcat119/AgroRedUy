/**
 * @fileoverview Schedule Request Controller - Handles schedule request API requests
 * @description Controller for managing schedule requests between users and contractors
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { scheduleRequestService, ScheduleRequestStatus } from '../services/schedule-request.service';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

export class ScheduleRequestController {
  /**
   * @description Create a new schedule request
   */
  public createScheduleRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const { serviceId, startDate, endDate, message } = req.body;

      if (!serviceId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'serviceId, startDate, and endDate are required'
          }
        });
        return;
      }

      const request = await scheduleRequestService.createScheduleRequest({
        serviceId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        message: message || undefined
      });

      res.status(201).json({
        success: true,
        data: request,
        message: 'Schedule request created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating schedule request:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SCHEDULE_REQUEST_CREATE_ERROR',
          message: error.message || 'Error creating schedule request'
        }
      });
    }
  };

  /**
   * @description Get all schedule requests for admin (optimized single query)
   */
  public getAllScheduleRequestsForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Check if user is admin
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only admins can access this endpoint'
          }
        });
        return;
      }

      const { status } = req.query;

      // Get all schedule requests with service and user info in one query
      const requests = await prisma.scheduleRequest.findMany({
        where: status ? { status: status as ScheduleRequestStatus } : undefined,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          service: {
            select: {
              id: true,
              title: true,
              userId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      logger.error('Error fetching all schedule requests:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SCHEDULE_REQUESTS_FETCH_ERROR',
          message: 'Error fetching schedule requests'
        }
      });
    }
  };

  /**
   * @description Get schedule requests for a service (contractor view)
   */
  public getServiceScheduleRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const { status } = req.query;

      // Verify user owns the service
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { userId: true }
      });

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

      // Allow service owner or admin to view schedule requests
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';
      if (service.userId !== req.user?.id && !isAdmin) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized to view schedule requests for this service'
          }
        });
        return;
      }

      const requests = await scheduleRequestService.getServiceScheduleRequests(
        serviceId,
        status as ScheduleRequestStatus | undefined
      );

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      logger.error('Error fetching service schedule requests:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SCHEDULE_REQUESTS_FETCH_ERROR',
          message: 'Error fetching schedule requests'
        }
      });
    }
  };

  /**
   * @description Get schedule requests for current user
   */
  public getUserScheduleRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const { status } = req.query;

      const requests = await scheduleRequestService.getUserScheduleRequests(
        userId,
        status as ScheduleRequestStatus | undefined
      );

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      logger.error('Error fetching user schedule requests:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_SCHEDULE_REQUESTS_FETCH_ERROR',
          message: 'Error fetching schedule requests'
        }
      });
    }
  };

  /**
   * @description Accept a schedule request
   */
  public acceptScheduleRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';

      const request = await scheduleRequestService.acceptScheduleRequest(id, userId, isAdmin);

      res.json({
        success: true,
        data: request,
        message: 'Schedule request accepted successfully'
      });
    } catch (error: any) {
      logger.error('Error accepting schedule request:', error);
      const statusCode = error.message.includes('Unauthorized') || error.message.includes('not found') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'SCHEDULE_REQUEST_ACCEPT_ERROR',
          message: error.message || 'Error accepting schedule request'
        }
      });
    }
  };

  /**
   * @description Reject a schedule request
   */
  public rejectScheduleRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;
      const { reason } = req.body;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';

      const request = await scheduleRequestService.rejectScheduleRequest(id, userId, reason, isAdmin);

      res.json({
        success: true,
        data: request,
        message: 'Schedule request rejected successfully'
      });
    } catch (error: any) {
      logger.error('Error rejecting schedule request:', error);
      const statusCode = error.message.includes('Unauthorized') || error.message.includes('not found') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'SCHEDULE_REQUEST_REJECT_ERROR',
          message: error.message || 'Error rejecting schedule request'
        }
      });
    }
  };

  /**
   * @description Check if user has accepted request for a service
   */
  public checkAcceptedRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const userId = req.user?.id as string;

      const hasAccepted = await scheduleRequestService.hasAcceptedRequest(serviceId, userId);

      res.json({
        success: true,
        data: { hasAccepted }
      });
    } catch (error) {
      logger.error('Error checking accepted request:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHECK_ACCEPTED_ERROR',
          message: 'Error checking accepted request'
        }
      });
    }
  };
}

export const scheduleRequestController = new ScheduleRequestController();

