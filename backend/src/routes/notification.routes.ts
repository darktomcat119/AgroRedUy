/**
 * @fileoverview Notification Routes - API routes for notification management
 * @description Handles all notification-related API endpoints
 */

import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /notifications
 * @description Get all notifications for authenticated user
 */
router.get('/', notificationController.getNotifications);

/**
 * @route GET /notifications/unread/count
 * @description Get unread notification count
 */
router.get('/unread/count', notificationController.getUnreadCount);

/**
 * @route PUT /notifications/:id/read
 * @description Mark a notification as read
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @route PUT /notifications/read-all
 * @description Mark all notifications as read
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * @route DELETE /notifications/:id
 * @description Delete a notification
 */
router.delete('/:id', notificationController.deleteNotification);

export default router;

