/**
 * @fileoverview Notification Controller - Handles notification API requests
 * @description Controller for managing user notifications
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';
import { logger } from '../config/logger';

export class NotificationController {
  /**
   * @description Get all notifications for authenticated user
   */
  public getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const { unreadOnly, limit } = req.query;

      const notifications = await notificationService.getUserNotifications(userId, {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'NOTIFICATIONS_FETCH_ERROR',
          message: 'Error fetching notifications'
        }
      });
    }
  };

  /**
   * @description Get unread notification count
   */
  public getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UNREAD_COUNT_ERROR',
          message: 'Error getting unread count'
        }
      });
    }
  };

  /**
   * @description Mark notification as read
   */
  public markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;

      await notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MARK_READ_ERROR',
          message: 'Error marking notification as read'
        }
      });
    }
  };

  /**
   * @description Mark all notifications as read
   */
  public markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      logger.error('Error marking all as read:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MARK_ALL_READ_ERROR',
          message: 'Error marking all notifications as read'
        }
      });
    }
  };

  /**
   * @description Delete a notification
   */
  public deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;

      await notificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_NOTIFICATION_ERROR',
          message: 'Error deleting notification'
        }
      });
    }
  };
}

export const notificationController = new NotificationController();

