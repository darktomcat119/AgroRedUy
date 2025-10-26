import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * @fileoverview User Service - Handles all user-related business logic
 * @description This service manages user operations including CRUD operations,
 * profile management, and user data validation for the real estate platform.
 */

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
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
  profileImageUrl?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  profileImageUrl?: string;
  address?: string;
  city?: string;
  department?: string;
  dateOfBirth?: Date;
  gender?: string;
  occupation?: string;
  company?: string;
  interests: string[];
  newsletter: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class UserService {
  /**
   * @description Get user by ID with full details
   * @param id - User ID
   * @returns User object or null if not found
   */
  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          profileImageUrl: true,
          address: true,
          city: true,
          department: true,
          dateOfBirth: true,
          gender: true,
          occupation: true,
          company: true,
          interests: true,
          newsletter: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error('Error in getUserById:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * @description Get user profile (public information only)
   * @param id - User ID
   * @returns User profile object or null if not found
   */
  async getUserProfile(id: string): Promise<Partial<UserProfile> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          profileImageUrl: true,
          address: true,
          city: true,
          department: true,
          occupation: true,
          company: true,
          interests: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error('Error in getUserProfile:', error);
      throw new Error('Failed to retrieve user profile');
    }
  }

  /**
   * @description Update user information
   * @param id - User ID
   * @param updateData - Data to update
   * @returns Updated user object
   */
  async updateUser(id: string, updateData: UserUpdateData): Promise<UserProfile> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Check if email is being changed and if it's already taken
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: updateData.email },
        });

        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      // Prepare update data
      const dataToUpdate: any = { ...updateData };

      // Convert dateOfBirth string to Date if provided
      if (updateData.dateOfBirth) {
        dataToUpdate.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          profileImageUrl: true,
          address: true,
          city: true,
          department: true,
          dateOfBirth: true,
          gender: true,
          occupation: true,
          company: true,
          interests: true,
          newsletter: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      logger.info(`User ${id} updated successfully`);
      return updatedUser;
    } catch (error) {
      logger.error('Error in updateUser:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  /**
   * @description Delete user account
   * @param id - User ID
   * @returns void
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Delete user (cascade will handle related records)
      await prisma.user.delete({
        where: { id },
      });

      logger.info(`User ${id} deleted successfully`);
    } catch (error) {
      logger.error('Error in deleteUser:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete user');
    }
  }

  /**
   * @description Get user by email
   * @param email - User email
   * @returns User object or null if not found
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          profileImageUrl: true,
          address: true,
          city: true,
          department: true,
          dateOfBirth: true,
          gender: true,
          occupation: true,
          company: true,
          interests: true,
          newsletter: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error('Error in getUserByEmail:', error);
      throw new Error('Failed to retrieve user by email');
    }
  }

  /**
   * @description Update user's last login timestamp
   * @param id - User ID
   * @returns void
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
    } catch (error) {
      logger.error('Error in updateLastLogin:', error);
      // Don't throw error for login timestamp update failure
    }
  }

  /**
   * @description Check if user exists by ID
   * @param id - User ID
   * @returns boolean
   */
  async userExists(id: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });

      return !!user;
    } catch (error) {
      logger.error('Error in userExists:', error);
      return false;
    }
  }

  /**
   * @description Get user statistics
   * @param id - User ID
   * @returns User statistics object
   */
  async getUserStats(id: string): Promise<{
    totalServices: number;
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
  }> {
    try {
      const [services, bookings, reviews] = await Promise.all([
        prisma.service.count({
          where: { userId: id, isActive: true },
        }),
        prisma.booking.count({
          where: { userId: id },
        }),
        prisma.review.count({
          where: { userId: id },
        }),
      ]);

      // Calculate average rating
      const ratingResult = await prisma.review.aggregate({
        where: { userId: id },
        _avg: { rating: true },
      });

      const averageRating = ratingResult._avg.rating || 0;

      return {
        totalServices: services,
        totalBookings: bookings,
        totalReviews: reviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      };
    } catch (error) {
      logger.error('Error in getUserStats:', error);
      throw new Error('Failed to retrieve user statistics');
    }
  }
}
