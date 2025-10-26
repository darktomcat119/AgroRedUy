import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
    return;
  }
  next();
};

// GET /admin/statistics - Get platform statistics
router.get('/statistics', adminController.getStatistics);

// GET /admin/users - Get all users
router.get('/users', [
  query('role').optional().isIn(['USER', 'ADMIN', 'SUPERADMIN']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest
], adminController.getUsers);

// GET /admin/users/:id - Get user by ID
router.get('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID'),
  validateRequest
], adminController.getUserById);

// PUT /admin/users/:id - Update user
router.put('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN', 'SUPERADMIN'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('emailVerified')
    .optional()
    .isBoolean()
    .withMessage('emailVerified must be a boolean'),
  validateRequest
], adminController.updateUser);

// DELETE /admin/users/:id - Delete user
router.delete('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID'),
  validateRequest
], adminController.deleteUser);

// GET /admin/services - Get all services
router.get('/services', [
  query('categoryId').optional().isUUID().withMessage('Invalid category ID'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest
], adminController.getServices);

// GET /admin/content - Get content management data
router.get('/content', adminController.getContentManagement);

export default router;