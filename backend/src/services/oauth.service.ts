import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

export interface OAuthUserData {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  providerData?: any;
}

export class OAuthService {
  /**
   * Find or create user from OAuth provider data
   */
  async findOrCreateUser(userData: OAuthUserData): Promise<any> {
    try {
      // First, try to find user by provider and providerId
      let user = await prisma.user.findFirst({
        where: {
          provider: userData.provider,
          providerId: userData.providerId
        }
      });

      if (user) {
        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
        return user;
      }

      // If not found by provider, try to find by email
      user = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (user) {
        // Link OAuth account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: userData.provider,
            providerId: userData.providerId,
            providerData: userData.providerData,
            emailVerified: true, // OAuth users are considered verified
            profileImageUrl: userData.profileImageUrl || user.profileImageUrl
          }
        });
        return user;
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          provider: userData.provider,
          providerId: userData.providerId,
          providerData: userData.providerData,
          profileImageUrl: userData.profileImageUrl,
          emailVerified: true, // OAuth users are considered verified
          isActive: true,
          role: 'USER' // Default role for OAuth users
        }
      });

      logger.info(`New OAuth user created: ${userData.email} (${userData.provider})`);
      return user;
    } catch (error) {
      logger.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  /**
   * Generate access token for OAuth user
   */
  generateAccessToken(user: any): string {
    // This would typically use JWT or similar
    // For now, we'll return a simple token
    return `oauth_${user.id}_${Date.now()}`;
  }

  /**
   * Validate OAuth user data
   */
  validateUserData(userData: OAuthUserData): boolean {
    if (!userData.provider || !userData.providerId || !userData.email) {
      logger.error('Missing required OAuth user data');
      return false;
    }

    if (!userData.firstName || !userData.lastName) {
      logger.error('Missing name in OAuth user data');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      logger.error('Invalid email format in OAuth data');
      return false;
    }

    return true;
  }

  /**
   * Validate OAuth data (alias for validateUserData)
   */
  validateOAuthData(userData: OAuthUserData): boolean {
    return this.validateUserData(userData);
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(userData: OAuthUserData): Promise<any> {
    return await this.findOrCreateUser(userData);
  }
}