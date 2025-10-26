import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

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

// POST /auth/register
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Valid phone number is required'),
  validateRequest
], authController.register);

// POST /auth/register-contractor
router.post('/register-contractor', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Valid phone number is required'),
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('businessDescription')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Business description must be between 10 and 500 characters'),
  body('businessAddress')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Business address must be between 5 and 200 characters'),
  body('businessCity')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Business city must be between 2 and 50 characters'),
  body('businessDepartment')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Business department must be between 2 and 50 characters'),
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  body('yearsExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  validateRequest
], authController.registerContractor);

// POST /auth/login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
], authController.login);

// POST /auth/refresh
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  validateRequest
], authController.refreshToken);

// POST /auth/logout
router.post('/logout', authController.logout);

// POST /auth/forgot-password
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  validateRequest
], authController.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  validateRequest
], authController.resetPassword);

// POST /auth/verify-email
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  validateRequest
], authController.verifyEmail);

// POST /auth/resend-verification
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  validateRequest
], authController.resendVerificationEmail);

export default router;
