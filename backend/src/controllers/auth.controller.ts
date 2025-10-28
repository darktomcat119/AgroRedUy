import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../config/logger';

/**
 * @fileoverview Auth Controller - Handles all authentication-related HTTP requests
 * @description This controller manages user authentication operations including
 * registration, login, logout, password reset, and token management.
 */

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * @description Register a new user
   * @route POST /auth/register
   * @access Public
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Received registration data:', req.body);
      
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone,
        address,
        city,
        department,
        dateOfBirth,
        gender,
        occupation,
        company,
        interests,
        newsletter
      } = req.body;
      
      console.log('Extracted fields:', {
        email, firstName, lastName, phone, address, city, department, 
        dateOfBirth, gender, occupation, company, interests, newsletter
      });

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        city,
        department,
        dateOfBirth,
        gender,
        occupation,
        company,
        interests,
        newsletter
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message
        }
      });
    }
  };

  /**
   * @description Register a new contractor
   * @route POST /auth/register-contractor
   * @access Public
   */
  public registerContractor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone,
        businessName,
        businessDescription,
        businessAddress,
        businessCity,
        businessDepartment,
        certifications = [],
        yearsExperience
      } = req.body;

      const result = await this.authService.registerContractor({
        email,
        password,
        firstName,
        lastName,
        phone,
        businessName,
        businessDescription,
        businessAddress,
        businessCity,
        businessDepartment,
        certifications,
        yearsExperience
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Contractor registered successfully'
      });
    } catch (error: any) {
      logger.error('Contractor registration error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CONTRACTOR_REGISTRATION_FAILED',
          message: error.message
        }
      });
    }
  };

  /**
   * @description Login user with email and password
   * @route POST /auth/login
   * @access Public
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email, passwordLength: password?.length });

      const result = await this.authService.login({ email, password });

      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Invalid credentials'
        }
      });
    }
  };

  /**
   * @description Refresh access token using refresh token
   * @route POST /auth/refresh
   * @access Public
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const result = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: 'Invalid refresh token'
        }
      });
    }
  };

  /**
   * @description Logout user (invalidate session)
   * @route POST /auth/logout
   * @access Public
   */
  public logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // In a more sophisticated implementation, you might want to
      // blacklist the token or store it in Redis for validation
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed'
        }
      });
    }
  };

  /**
   * @description Send password reset email
   * @route POST /auth/forgot-password
   * @access Public
   */
  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.forgotPassword(email);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FORGOT_PASSWORD_FAILED',
          message: 'Failed to process password reset request'
        }
      });
    }
  };

  /**
   * @description Reset password using reset token
   * @route POST /auth/reset-password
   * @access Public
   */
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      await this.authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error: any) {
      logger.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'RESET_PASSWORD_FAILED',
          message: 'Failed to reset password'
        }
      });
    }
  };

  /**
   * @description Verify email with verification token
   * @route POST /auth/verify-email
   * @access Public
   */
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      await this.authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error: any) {
      logger.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_VERIFICATION_FAILED',
          message: error.message
        }
      });
    }
  };

  /**
   * @description Resend verification email
   * @route POST /auth/resend-verification
   * @access Public
   */
  public resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error: any) {
      logger.error('Resend verification email error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'RESEND_VERIFICATION_FAILED',
          message: error.message
        }
      });
    }
  };
}
