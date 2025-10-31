import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../middleware/auth.middleware';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware';

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
    body('role').optional().isIn(['USER', 'CONTRACTOR', 'ADMIN', 'SUPERADMIN']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('emailVerified').optional().isBoolean().withMessage('emailVerified must be boolean'),
    body('address').optional().isString().trim().isLength({ max: 200 }).withMessage('Address must be max 200 characters'),
    body('city').optional().isString().trim().isLength({ max: 100 }).withMessage('City must be max 100 characters'),
    body('department').optional().isString().trim().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
    body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
    body('occupation').optional().isString().trim().isLength({ max: 100 }).withMessage('Occupation must be max 100 characters'),
    body('company').optional().isString().trim().isLength({ max: 100 }).withMessage('Company must be max 100 characters'),
    body('interests').optional().custom((value) => {
      if (Array.isArray(value)) {
        return value.every((v) => typeof v === 'string');
      }
      if (typeof value === 'string') {
        return true;
      }
      throw new Error('Interests must be a string or an array of strings');
    }).withMessage('Interests must be a string or an array of strings'),
    body('newsletter').optional().isBoolean().withMessage('Newsletter must be boolean'),
    body('profileImageUrl').optional().isString().withMessage('Profile image URL must be a string')
  ],
  validateRequest,
  adminController.createUser
);

router.get('/users/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid user ID')
  ],
  validateRequest,
  adminController.getUserDetails
);

router.put('/users/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('firstName').optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('lastName').optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isString().trim().isLength({ min: 8, max: 20 }).withMessage('Phone must be 8-20 characters'),
    body('role').optional().isIn(['USER', 'CONTRACTOR', 'ADMIN', 'SUPERADMIN']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('emailVerified').optional().isBoolean().withMessage('emailVerified must be boolean'),
    body('address').optional().isString().trim().isLength({ max: 200 }).withMessage('Address must be max 200 characters'),
    body('city').optional().isString().trim().isLength({ max: 100 }).withMessage('City must be max 100 characters'),
    body('department').optional().isString().trim().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
    body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
    body('occupation').optional().isString().trim().isLength({ max: 100 }).withMessage('Occupation must be max 100 characters'),
    body('company').optional().isString().trim().isLength({ max: 100 }).withMessage('Company must be max 100 characters'),
    body('interests').optional().custom((value) => {
      if (Array.isArray(value)) {
        return value.every((v) => typeof v === 'string');
      }
      if (typeof value === 'string') {
        return true;
      }
      throw new Error('Interests must be a string or an array of strings');
    }).withMessage('Interests must be a string or an array of strings'),
    body('newsletter').optional().isBoolean().withMessage('Newsletter must be boolean'),
    body('profileImageUrl').optional().isString().withMessage('Profile image URL must be a string')
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

router.get('/services/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid service ID')
  ],
  validateRequest,
  adminController.getServiceDetails
);

// Units listing for validation/select options
router.get('/units', requireAdmin, adminController.getUnits);

// Create service
router.post('/services',
  requireAdmin,
  [
    body('title').isString().trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
    body('description').isString().trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('priceCurrency').optional().isIn(['UYU','USD']).withMessage('Invalid price currency'),
    body('priceMin').optional().isFloat({ gt: 0 }).withMessage('priceMin must be greater than 0'),
    body('priceMax').optional().isFloat({ gt: 0 }).withMessage('priceMax must be greater than 0'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('mapZoom').optional().isInt({ min: 1, max: 20 }).withMessage('mapZoom must be between 1 and 20'),
    body('address').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Address must be 3-200 characters'),
    body('city').isString().trim().isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
    body('department').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Department must be 2-100 characters'),
    body('categoryId').isUUID().withMessage('Invalid categoryId'),
    body('unit_id').isString().trim().isLength({ min: 1, max: 50 }).withMessage('unit_id is required'),
    body('images').optional().isArray({ max: 10 }).withMessage('images must be an array of max 10 items'),
    body('images.*').optional().isString().withMessage('image url must be string'),
    body('schedule').optional().isObject().withMessage('schedule must be an object'),
    body('schedule.startDate').optional().isISO8601().withMessage('Invalid startDate'),
    body('schedule.endDate').optional().isISO8601().withMessage('Invalid endDate'),
    // Times optional; if omitted, backend will default to full-day
  ],
  validateRequest,
  adminController.createService
);

router.put('/services/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid service ID'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().isString().trim().isLength({ min: 1, max: 5000 }).withMessage('Description must be 1-5000 characters'),
    body('categoryId').optional().isUUID().withMessage('Invalid categoryId'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a number > 0'),
    body('priceCurrency').optional().isIn(['UYU','USD']).withMessage('Invalid price currency'),
    body('priceMin').optional().isFloat({ gt: 0 }).withMessage('priceMin must be > 0'),
    body('priceMax').optional().isFloat({ gt: 0 }).withMessage('priceMax must be > 0'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('mapZoom').optional().isInt({ min: 1, max: 20 }).withMessage('mapZoom must be between 1 and 20'),
    body('address').optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage('Address must be 3-200 characters'),
    body('city').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
    body('department').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Department must be 2-100 characters'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
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

// Delete a service image
router.delete('/services/:serviceId/images/:imageId',
  requireAdmin,
  [
    param('serviceId').isUUID().withMessage('Invalid service ID'),
    param('imageId').isUUID().withMessage('Invalid image ID')
  ],
  validateRequest,
  adminController.deleteServiceImage
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

// Category management routes
router.get('/categories',
  requireAdmin,
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

// Sub-badge management routes
router.get('/sub-badges',
  requireAdmin,
  adminController.getSubBadges
);

router.post('/sub-badges',
  requireSuperAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('serviceId').isUUID().withMessage('Valid serviceId is required'),
    body('iconUrl').optional().isString().withMessage('iconUrl must be a string')
  ],
  validateRequest,
  adminController.createSubBadge
);

router.put('/sub-badges/:id',
  requireSuperAdmin,
  [
    param('id').isUUID().withMessage('Invalid sub-badge ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('iconUrl').optional().isString().withMessage('iconUrl must be a string'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  adminController.updateSubBadge
);

router.delete('/sub-badges/:id',
  requireSuperAdmin,
  [
    param('id').isUUID().withMessage('Invalid sub-badge ID')
  ],
  validateRequest,
  adminController.deleteSubBadge
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