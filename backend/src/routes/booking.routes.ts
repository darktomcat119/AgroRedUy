import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { BookingController } from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const bookingController = new BookingController();

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

// GET /bookings - Get user's bookings
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest
], bookingController.getBookings);

// GET /bookings/:id - Get booking by ID
router.get('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid booking ID'),
  validateRequest
], bookingController.getBookingById);

// POST /bookings - Create new booking
router.post('/', authenticateToken, [
  body('serviceId')
    .isUUID()
    .withMessage('Valid service ID is required'),
  body('availabilityId')
    .isUUID()
    .withMessage('Valid availability ID is required'),
  body('durationHours')
    .isInt({ min: 1, max: 24 })
    .withMessage('Duration must be between 1 and 24 hours'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  body('contactName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact name must be between 2 and 100 characters'),
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid contact email is required'),
  body('contactPhone')
    .isMobilePhone('any')
    .withMessage('Valid contact phone is required'),
  validateRequest
], bookingController.createBooking);

// PUT /bookings/:id - Update booking
router.put('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid booking ID'),
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  body('contactName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact name must be between 2 and 100 characters'),
  body('contactEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid contact email is required'),
  body('contactPhone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid contact phone is required'),
  validateRequest
], bookingController.updateBooking);

// DELETE /bookings/:id - Cancel booking
router.delete('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid booking ID'),
  validateRequest
], bookingController.cancelBooking);

// GET /bookings/service/:serviceId - Get bookings for a service (service owner only)
router.get('/service/:serviceId', authenticateToken, [
  param('serviceId').isUUID().withMessage('Invalid service ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest
], bookingController.getBookingsByService);

export default router;