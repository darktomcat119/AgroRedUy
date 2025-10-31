/**
 * @fileoverview Notification Service - Handles notification operations
 * @description Service for managing user notifications including schedule requests, bookings, and general notifications
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';

export enum NotificationType {
  SCHEDULE_REQUEST = 'SCHEDULE_REQUEST',
  SCHEDULE_ACCEPTED = 'SCHEDULE_ACCEPTED',
  SCHEDULE_REJECTED = 'SCHEDULE_REJECTED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  GENERAL = 'GENERAL'
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
}

export class NotificationService {
  /**
   * @description Create a new notification
   */
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          relatedId: data.relatedId || null,
          isRead: false
        }
      });
      logger.info(`Notification created: ${notification.id} for user: ${data.userId}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * @description Get all notifications for a user
   */
  async getUserNotifications(userId: string, options?: { limit?: number; unreadOnly?: boolean }) {
    try {
      const where: any = { userId };
      if (options?.unreadOnly) {
        where.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50
      });

      return notifications;
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * @description Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });
      return count;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * @description Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId // Ensure user owns the notification
        },
        data: {
          isRead: true
        }
      });
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * @description Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * @description Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId // Ensure user owns the notification
        }
      });
      return notification;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();

