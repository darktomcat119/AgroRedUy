/**
 * @fileoverview Schedule Request Service - Handles schedule request operations
 * @description Service for managing schedule requests between users and contractors
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { notificationService, NotificationType } from './notification.service';

export enum ScheduleRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface CreateScheduleRequestData {
  serviceId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  message?: string;
}

export class ScheduleRequestService {
  /**
   * @description Create a new schedule request
   */
  async createScheduleRequest(data: CreateScheduleRequestData) {
    try {
      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
        include: { user: true }
      });

      if (!service) {
        throw new Error('Service not found');
      }

      // Create schedule request
      const scheduleRequest = await prisma.scheduleRequest.create({
        data: {
          serviceId: data.serviceId,
          userId: data.userId,
          startDate: data.startDate,
          endDate: data.endDate,
          message: data.message || null,
          status: ScheduleRequestStatus.PENDING
        },
        include: {
          service: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Create notification for contractor (service owner)
      await notificationService.createNotification({
        userId: service.userId,
        type: NotificationType.SCHEDULE_REQUEST,
        title: 'Nueva solicitud de horario',
        message: `${scheduleRequest.user.firstName} ${scheduleRequest.user.lastName} ha solicitado horario para el servicio "${service.title}"`,
        relatedId: scheduleRequest.id,
        serviceId: data.serviceId
      });

      // Create notification for requester
      await notificationService.createNotification({
        userId: data.userId,
        type: NotificationType.SCHEDULE_REQUEST,
        title: 'Solicitud de horario enviada',
        message: `Tu solicitud de horario para "${service.title}" ha sido enviada`,
        relatedId: scheduleRequest.id,
        serviceId: data.serviceId
      });

      logger.info(`Schedule request created: ${scheduleRequest.id}`);
      return scheduleRequest;
    } catch (error) {
      logger.error('Error creating schedule request:', error);
      throw error;
    }
  }

  /**
   * @description Get schedule requests for a service (contractor view)
   */
  async getServiceScheduleRequests(serviceId: string, status?: ScheduleRequestStatus) {
    try {
      const where: any = { serviceId };
      if (status) {
        where.status = status;
      }

      const requests = await prisma.scheduleRequest.findMany({
        where,
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
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return requests;
    } catch (error) {
      logger.error('Error fetching schedule requests:', error);
      throw error;
    }
  }

  /**
   * @description Get schedule requests for a user
   */
  async getUserScheduleRequests(userId: string, status?: ScheduleRequestStatus) {
    try {
      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const requests = await prisma.scheduleRequest.findMany({
        where,
        include: {
          service: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              }
            },
            select: {
              id: true,
              title: true,
              user: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return requests;
    } catch (error) {
      logger.error('Error fetching user schedule requests:', error);
      throw error;
    }
  }

  /**
   * @description Accept a schedule request
   */
  async acceptScheduleRequest(requestId: string, serviceOwnerId: string) {
    try {
      // Verify ownership
      const request = await prisma.scheduleRequest.findUnique({
        where: { id: requestId },
        include: {
          service: {
            include: {
              user: true
            }
          },
          user: true
        }
      });

      if (!request) {
        throw new Error('Schedule request not found');
      }

      if (request.service.userId !== serviceOwnerId) {
        throw new Error('Unauthorized to accept this request');
      }

      if (request.status !== ScheduleRequestStatus.PENDING) {
        throw new Error('Request is not in PENDING status');
      }

      // Update request status
      const updated = await prisma.scheduleRequest.update({
        where: { id: requestId },
        data: {
          status: ScheduleRequestStatus.ACCEPTED,
          respondedAt: new Date()
        },
        include: {
          service: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              }
            }
          },
          user: true
        }
      });

      // Create notification for requester
      await notificationService.createNotification({
        userId: request.userId,
        type: NotificationType.SCHEDULE_ACCEPTED,
        title: 'Solicitud de horario aceptada',
        message: `Tu solicitud de horario para "${request.service.title}" ha sido aceptada. Puedes contactar al contratista.`,
        relatedId: requestId,
        serviceId: request.serviceId
      });

      logger.info(`Schedule request accepted: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('Error accepting schedule request:', error);
      throw error;
    }
  }

  /**
   * @description Reject a schedule request
   */
  async rejectScheduleRequest(requestId: string, serviceOwnerId: string, reason?: string) {
    try {
      // Verify ownership
      const request = await prisma.scheduleRequest.findUnique({
        where: { id: requestId },
        include: {
          service: true,
          user: true
        }
      });

      if (!request) {
        throw new Error('Schedule request not found');
      }

      if (request.service.userId !== serviceOwnerId) {
        throw new Error('Unauthorized to reject this request');
      }

      if (request.status !== ScheduleRequestStatus.PENDING) {
        throw new Error('Request is not in PENDING status');
      }

      // Update request status
      const updated = await prisma.scheduleRequest.update({
        where: { id: requestId },
        data: {
          status: ScheduleRequestStatus.REJECTED,
          respondedAt: new Date(),
          message: reason ? `${request.message || ''}\n\nRechazado: ${reason}`.trim() : request.message
        }
      });

      // Create notification for requester
      await notificationService.createNotification({
        userId: request.userId,
        type: NotificationType.SCHEDULE_REJECTED,
        title: 'Solicitud de horario rechazada',
        message: `Tu solicitud de horario para "${request.service.title}" ha sido rechazada.${reason ? ` Razón: ${reason}` : ''}`,
        relatedId: requestId,
        serviceId: request.serviceId
      });

      logger.info(`Schedule request rejected: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('Error rejecting schedule request:', error);
      throw error;
    }
  }

  /**
   * @description Check if user has accepted schedule request for a service
   */
  async hasAcceptedRequest(serviceId: string, userId: string): Promise<boolean> {
    try {
      const request = await prisma.scheduleRequest.findFirst({
        where: {
          serviceId,
          userId,
          status: ScheduleRequestStatus.ACCEPTED
        }
      });
      return !!request;
    } catch (error) {
      logger.error('Error checking accepted request:', error);
      return false;
    }
  }
}

export const scheduleRequestService = new ScheduleRequestService();

