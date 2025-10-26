import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { ServiceController } from '../controllers/service.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const serviceController = new ServiceController();

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

// GET /services - Get all services with filters
router.get('/', [
  query('categoryId').optional().isUUID().withMessage('Invalid category ID'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('department').optional().isString().withMessage('Department must be a string'),
  query('minPrice').optional().isNumeric().withMessage('Min price must be a number'),
  query('maxPrice').optional().isNumeric().withMessage('Max price must be a number'),
  query('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
  query('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
  query('radius').optional().isNumeric().withMessage('Radius must be a number'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest
], serviceController.getServices);

// GET /services/:id - Get service by ID
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid service ID'),
  validateRequest
], serviceController.getServiceById);

// POST /services - Create new service
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('pricePerHour')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price per hour must be a positive number'),
  body('priceMin')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  body('priceMax')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  body('latitude')
    .isNumeric()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isNumeric()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('categoryId')
    .isUUID()
    .withMessage('Valid category ID is required'),
  validateRequest
], serviceController.createService);

// PUT /services/:id - Update service
router.put('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid service ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('pricePerHour')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price per hour must be a positive number'),
  body('priceMin')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  body('priceMax')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  body('latitude')
    .optional()
    .isNumeric()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isNumeric()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Valid category ID is required'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validateRequest
], serviceController.updateService);

// DELETE /services/:id - Delete service
router.delete('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid service ID'),
  validateRequest
], serviceController.deleteService);

// GET /services/user/my-services - Get user's services
router.get('/user/my-services', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest
], serviceController.getMyServices);

export default router;