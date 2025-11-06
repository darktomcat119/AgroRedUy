/**
 * @fileoverview Schedule Request Routes - API routes for schedule request management
 * @description Handles all schedule request-related API endpoints
 */

import { Router } from 'express';
import { scheduleRequestController } from '../controllers/schedule-request.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route POST /schedule-requests
 * @description Create a new schedule request
 */
router.post('/', scheduleRequestController.createScheduleRequest);

/**
 * @route GET /schedule-requests/admin/all
 * @description Get all schedule requests (admin view)
 */
router.get('/admin/all', scheduleRequestController.getAllScheduleRequestsForAdmin);

/**
 * @route GET /schedule-requests/service/:serviceId
 * @description Get schedule requests for a service (contractor view)
 */
router.get('/service/:serviceId', scheduleRequestController.getServiceScheduleRequests);

/**
 * @route GET /schedule-requests/user
 * @description Get schedule requests for current user
 */
router.get('/user', scheduleRequestController.getUserScheduleRequests);

/**
 * @route PUT /schedule-requests/:id/accept
 * @description Accept a schedule request
 */
router.put('/:id/accept', scheduleRequestController.acceptScheduleRequest);

/**
 * @route PUT /schedule-requests/:id/reject
 * @description Reject a schedule request
 */
router.put('/:id/reject', scheduleRequestController.rejectScheduleRequest);

/**
 * @route GET /schedule-requests/check/:serviceId
 * @description Check if user has accepted request for a service
 */
router.get('/check/:serviceId', scheduleRequestController.checkAcceptedRequest);

export default router;

