import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { EmailService } from './email.service';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  interests?: string[];
  newsletter?: boolean;
}

export interface ContractorRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessCity?: string;
  businessDepartment?: string;
  certifications?: string[];
  yearsExperience?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  requiresEmailVerification?: boolean; // Indicates if email verification is needed
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async register(registerData: RegisterData): Promise<AuthResult> {
    try {
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
        interests = [],
        newsletter = false
      } = registerData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Ya existe un usuario con este correo electrónico');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, AuthService.SALT_ROUNDS);

      // Check if email verification is enabled
      const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED === 'true';
      console.log('📧 Email Verification Enabled:', emailVerificationEnabled);
      console.log('👷 Registering CONTRACTOR (ADMIN role)');

      // Generate email verification token only if needed
      const emailVerificationToken = emailVerificationEnabled ? this.generateEmailVerificationToken() : null;
      const emailVerificationExpires = emailVerificationEnabled ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

      // Prepare user data for database - CONTRACTOR = ADMIN role
      const dbUserData = {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        address: Array.isArray(address) ? address : (address && address.trim() !== '' ? [address] : []),
        city: city && city.trim() !== '' ? city : null,
        department: department && department.trim() !== '' ? department : null,
        dateOfBirth: dateOfBirth && dateOfBirth.trim() !== '' ? new Date(dateOfBirth) : null,
        gender: gender && gender.trim() !== '' ? gender : null,
        occupation: occupation && occupation.trim() !== '' ? occupation : null,
        company: company && company.trim() !== '' ? company : null,
        interests,
        newsletter,
        role: 'ADMIN' as any, // Contractors are ADMIN role
        emailVerificationToken,
        emailVerificationExpires,
        emailVerified: !emailVerificationEnabled // Auto-verify if verification disabled
      };
      
      console.log('Creating user with data:', dbUserData);

      // Create user
      let user;
      try {
        user = await prisma.user.create({
          data: dbUserData as any
        });
        console.log('✅ User created successfully:', user.id);
      } catch (dbError) {
        console.error('❌ Database error creating user:', dbError);
        throw dbError;
      }

      // Send verification email (only if enabled)
      if (emailVerificationEnabled) {
        try {
          await this.emailService.sendVerificationEmail(email, firstName, emailVerificationToken!);
          logger.info(`✅ Verification email sent to: ${email}`);
          console.log('✅ Verification email sent successfully');
        } catch (emailError) {
          logger.error('Failed to send verification email:', emailError);
          console.log('⚠️  Failed to send verification email - user created but not verified');
          // Don't fail registration if email sending fails
        }
      } else {
        logger.info(`📧 Email verification disabled - user auto-verified: ${email}`);
        console.log('✅ Email verification disabled - user auto-verified');
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`New contractor registered: ${email} (ADMIN role) ${emailVerificationEnabled ? '(verification required)' : '(auto-verified)'}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        requiresEmailVerification: emailVerificationEnabled // Tell frontend if verification is needed
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async registerContractor(contractorData: ContractorRegisterData): Promise<AuthResult> {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        businessAddress,
        businessCity,
        businessDepartment
      } = contractorData;

      console.log('📋 Processing producer registration (USER role)...');
      console.log('   Business Address:', businessAddress);
      console.log('   Business City:', businessCity);
      console.log('   Business Department:', businessDepartment);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Ya existe un usuario con este correo electrónico');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, AuthService.SALT_ROUNDS);

      // Check if email verification is enabled
      const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED === 'true';
      console.log('📧 Email Verification Enabled:', emailVerificationEnabled);
      console.log('🌾 Registering PRODUCER (USER role)');

      // Ensure businessAddress is an array (if provided)
      const addressArray = businessAddress 
        ? (Array.isArray(businessAddress) 
            ? businessAddress 
            : (businessAddress.trim() !== '' ? [businessAddress] : []))
        : [];

      console.log('   ✅ Address converted to array:', addressArray);

      // Create producer user with USER role (in this project, PRODUCER = USER)
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          address: addressArray,
          city: businessCity && businessCity.trim() !== '' ? businessCity : null,
          department: businessDepartment && businessDepartment.trim() !== '' ? businessDepartment : null,
          role: 'USER' as any, // Producers are saved as USER role
          emailVerified: !emailVerificationEnabled // Auto-verify if verification disabled
        }
      });

      console.log('✅ Producer user created successfully:', user.id);
      console.log('✅ Role set to: USER (producer)');
      if (!emailVerificationEnabled) {
        console.log('✅ Email verification disabled - producer auto-verified');
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`New producer registered: ${email} (USER role) ${emailVerificationEnabled ? '(verification required)' : '(auto-verified)'}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        requiresEmailVerification: emailVerificationEnabled // Tell frontend if verification is needed
      };
    } catch (error) {
      logger.error('Contractor registration error:', error);
      throw error;
    }
  }

  async login(loginData: LoginData): Promise<AuthResult> {
    try {
      const { email, password } = loginData;
      
      console.log('Auth service login attempt:', { email, passwordLength: password?.length });

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      console.log('User found:', user ? { email: user.email, role: user.role, isActive: user.isActive } : 'null');

      if (!user) {
        console.log('User not found for email:', email);
        throw new Error('Credenciales inválidas');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log('Password check result:', isPasswordValid);
      if (!isPasswordValid) {
        console.log('Password invalid for user:', email);
        throw new Error('Credenciales inválidas');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('La cuenta está desactivada');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`User logged in: ${email}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET!
      ) as { sub: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // In a more sophisticated implementation, you might want to
      // blacklist the token or store it in Redis for validation
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists or not
        return;
      }

      // In a real implementation, you would:
      // 1. Generate a password reset token
      // 2. Store it in the database with expiration
      // 3. Send an email with the reset link
      
      logger.info(`Password reset requested for: ${email}`);
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Validate the reset token
      // 2. Check if it's not expired
      // 3. Update the password
      // 4. Invalidate the token
      
      logger.info('Password reset completed');
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  private generateAccessToken(user: any): string {
    return jwt.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as any
    );
  }

  private generateRefreshToken(user: any): string {
    return jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as any
    );
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            gt: new Date()
          }
        } as any
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        } as any
      });

      // Send welcome email (skip in development)
      if (process.env.NODE_ENV === 'production') {
        try {
          await this.emailService.sendWelcomeEmail(user.email, user.firstName);
          logger.info(`Welcome email sent to: ${user.email}`);
        } catch (emailError) {
          logger.error('Failed to send welcome email:', emailError);
          // Don't fail verification if welcome email fails
        }
      } else {
        logger.info(`Development mode: Skipping welcome email for ${user.email}`);
      }

      logger.info(`Email verified for user: ${user.email}`);
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email already verified');
      }

      // Generate new verification token
      const emailVerificationToken = this.generateEmailVerificationToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken,
          emailVerificationExpires
        } as any
      });

      // Send verification email (skip in development)
      if (process.env.NODE_ENV === 'production') {
        try {
          await this.emailService.sendVerificationEmail(email, user.firstName, emailVerificationToken);
          logger.info(`Verification email resent to: ${email}`);
        } catch (emailError) {
          logger.error('Failed to resend verification email:', emailError);
          throw new Error('Failed to send verification email');
        }
      } else {
        logger.info(`Development mode: Skipping email resend for ${email}`);
      }
    } catch (error) {
      logger.error('Resend verification email error:', error);
      throw error;
    }
  }

  private generateEmailVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private sanitizeUser(user: any): any {
    const { passwordHash, emailVerificationToken, emailVerificationExpires, ...sanitized } = user;
    return sanitized;
  }
}
