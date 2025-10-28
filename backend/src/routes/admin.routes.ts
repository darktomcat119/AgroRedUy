import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../middleware/auth.middleware';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = Router();
const adminController = new AdminController();

// Apply authentication to all admin routes
router.use(authenticateToken);

// Statistics routes (Admin and Super Admin)
router.get('/statistics', requireAdmin, adminController.getStatistics);

// User management routes (Admin and Super Admin)
router.get('/users', 
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('role').optional().isIn(['USER', 'CONTRACTOR']).withMessage('Invalid role'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
  ],
  validateRequest,
  adminController.getUsers
);

router.post('/users',
  requireAdmin,
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('firstName').isString().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('lastName').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('phone').optional().isString().trim().isLength({ min: 8, max: 20 }).withMessage('Phone must be 8-20 characters'),
    body('role').optional().isIn(['USER', 'CONTRACTOR']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('emailVerified').optional().isBoolean().withMessage('emailVerified must be boolean')
  ],
  validateRequest,
  adminController.createUser
);

router.put('/users/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('firstName').optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('lastName').optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isString().trim().isLength({ min: 8, max: 20 }).withMessage('Phone must be 8-20 characters'),
    body('role').optional().isIn(['USER', 'CONTRACTOR']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('emailVerified').optional().isBoolean().withMessage('emailVerified must be boolean')
  ],
  validateRequest,
  adminController.updateUser
);

router.delete('/users/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid user ID')
  ],
  validateRequest,
  adminController.deleteUser
);

// Service management routes (Admin and Super Admin)
router.get('/services',
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    query('contractorId').optional().isUUID().withMessage('Invalid contractor ID')
  ],
  validateRequest,
  adminController.getServices
);

router.put('/services/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid service ID'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().isString().trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be 1-1000 characters'),
    body('category').optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be 1-50 characters'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('location').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Location must be 1-100 characters'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('isVerified').optional().isBoolean().withMessage('isVerified must be boolean')
  ],
  validateRequest,
  adminController.updateService
);

router.delete('/services/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid service ID')
  ],
  validateRequest,
  adminController.deleteService
);

// Reports routes (Super Admin only)
router.post('/reports/generate',
  requireSuperAdmin,
  [
    body('type').isIn(['user_activity', 'service_performance', 'revenue_analysis', 'booking_trends', 'contractor_performance']).withMessage('Invalid report type'),
    body('period').isIn(['last_7_days', 'last_30_days', 'last_90_days', 'custom']).withMessage('Invalid period'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    body('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Invalid format')
  ],
  validateRequest,
  adminController.generateReport
);

router.get('/reports',
  requireSuperAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['user_activity', 'service_performance', 'revenue_analysis', 'booking_trends', 'contractor_performance']).withMessage('Invalid report type'),
    query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status')
  ],
  validateRequest,
  adminController.getReports
);

router.get('/reports/:id',
  requireSuperAdmin,
  [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Invalid report ID')
  ],
  validateRequest,
  adminController.getReportDetails
);

router.delete('/reports/:id',
  requireSuperAdmin,
  [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Invalid report ID')
  ],
  validateRequest,
  adminController.deleteReport
);

// Settings routes (Super Admin only)
router.get('/settings',
  requireSuperAdmin,
  adminController.getSettings
);

router.put('/settings',
  requireSuperAdmin,
  [
    body('category').isIn(['general', 'features', 'limits', 'notifications', 'security', 'payment', 'maintenance']).withMessage('Invalid settings category'),
    body('settings').isObject().withMessage('Settings must be an object')
  ],
  validateRequest,
  adminController.updateSettings
);

router.post('/settings/reset',
  requireSuperAdmin,
  [
    body('category').isIn(['general', 'features', 'limits', 'notifications', 'security', 'payment', 'maintenance']).withMessage('Invalid settings category')
  ],
  validateRequest,
  adminController.resetSettings
);

router.get('/health',
  requireSuperAdmin,
  adminController.getSystemHealth
);

// Category management routes (Super Admin only)
router.get('/categories',
  requireSuperAdmin,
  adminController.getCategories
);

router.post('/categories',
  requireSuperAdmin,
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Category name must be 1-100 characters'),
    body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('iconUrl').optional().isURL().withMessage('Icon URL must be a valid URL')
  ],
  validateRequest,
  adminController.createCategory
);

router.put('/categories/:id',
  requireSuperAdmin,
  [
    param('id').isUUID().withMessage('Invalid category ID'),
    body('name').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Category name must be 1-100 characters'),
    body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('iconUrl').optional().isURL().withMessage('Icon URL must be a valid URL'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validateRequest,
  adminController.updateCategory
);

router.delete('/categories/:id',
  requireSuperAdmin,
  [
    param('id').isUUID().withMessage('Invalid category ID')
  ],
  validateRequest,
  adminController.deleteCategory
);

// Security monitoring routes (Super Admin only)
router.get('/security/logs',
  requireSuperAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('level').optional().isIn(['info', 'warning', 'error']).withMessage('Invalid log level'),
    query('type').optional().isString().withMessage('Type must be a string'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format')
  ],
  validateRequest,
  adminController.getSecurityLogs
);

router.get('/security/stats',
  requireSuperAdmin,
  [
    query('period').optional().isIn(['1d', '7d', '30d', '90d']).withMessage('Invalid period')
  ],
  validateRequest,
  adminController.getSecurityStats
);

router.post('/security/block-ip',
  requireSuperAdmin,
  [
    body('ipAddress').isIP().withMessage('Invalid IP address'),
    body('reason').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters'),
    body('duration').optional().isString().withMessage('Duration must be a string')
  ],
  validateRequest,
  adminController.blockIpAddress
);

router.delete('/security/unblock-ip/:ipAddress',
  requireSuperAdmin,
  [
    param('ipAddress').isIP().withMessage('Invalid IP address')
  ],
  validateRequest,
  adminController.unblockIpAddress
);

router.put('/security/resolve-log/:logId',
  requireSuperAdmin,
  [
    param('logId').isString().trim().isLength({ min: 1 }).withMessage('Invalid log ID'),
    body('resolution').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Resolution must be 1-500 characters'),
    body('notes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Notes must be max 1000 characters')
  ],
  validateRequest,
  adminController.resolveSecurityLog
);

export default router;