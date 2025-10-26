import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServiceFilters {
  categoryId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingFilters {
  status?: string;
  serviceId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface ActivityLogFilters {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AnalyticsData {
  totalUsers: number;
  totalServices: number;
  totalBookings: number;
  activeUsers: number;
  activeServices: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export class AdminService {
  /**
   * Get all users with filtering and pagination
   */
  async getUsers(filters: UserFilters): Promise<{
    users: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page = 1, limit = 20, ...whereFilters } = filters;
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (whereFilters.role) whereClause.role = whereFilters.role;
      if (whereFilters.isActive !== undefined) whereClause.isActive = whereFilters.isActive;
      if (whereFilters.search) {
        whereClause.OR = [
          { firstName: { contains: whereFilters.search, mode: 'insensitive' } },
          { lastName: { contains: whereFilters.search, mode: 'insensitive' } },
          { email: { contains: whereFilters.search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            lastLoginAt: true
          }
        }),
        prisma.user.count({ where: whereClause })
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<any> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          department: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      });
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: any): Promise<any> {
    try {
      return await prisma.user.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          department: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all services with filtering and pagination
   */
  async getServices(filters: ServiceFilters): Promise<{
    services: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page = 1, limit = 20, ...whereFilters } = filters;
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (whereFilters.categoryId) whereClause.categoryId = whereFilters.categoryId;
      if (whereFilters.isActive !== undefined) whereClause.isActive = whereFilters.isActive;
      if (whereFilters.search) {
        whereClause.OR = [
          { title: { contains: whereFilters.search, mode: 'insensitive' } },
          { description: { contains: whereFilters.search, mode: 'insensitive' } }
        ];
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),
        prisma.service.count({ where: whereClause })
      ]);

      return {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<any> {
    try {
      return await prisma.service.findUnique({
        where: { id },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching service by ID:', error);
      throw error;
    }
  }

  /**
   * Update service
   */
  async updateService(id: string, serviceData: any): Promise<any> {
    try {
      return await prisma.service.update({
        where: { id },
        data: serviceData,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<void> {
    try {
      await prisma.service.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting service:', error);
      throw error;
    }
  }

  /**
   * Get all bookings with filtering and pagination
   */
  async getBookings(filters: BookingFilters): Promise<{
    bookings: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page = 1, limit = 20, ...whereFilters } = filters;
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (whereFilters.status) whereClause.status = whereFilters.status;
      if (whereFilters.serviceId) whereClause.serviceId = whereFilters.serviceId;
      if (whereFilters.userId) whereClause.userId = whereFilters.userId;
      if (whereFilters.startDate || whereFilters.endDate) {
        whereClause.createdAt = {};
        if (whereFilters.startDate) whereClause.createdAt.gte = whereFilters.startDate;
        if (whereFilters.endDate) whereClause.createdAt.lte = whereFilters.endDate;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            service: {
              include: {
                category: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),
        prisma.booking.count({ where: whereClause })
      ]);

      return {
        bookings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching bookings:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<any> {
    try {
      return await prisma.booking.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              category: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching booking by ID:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string): Promise<any> {
    try {
      const updateData: any = { status };
      
      if (status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      return await prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          service: {
            include: {
              category: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Get platform statistics
   */
  async getStatistics(period: string): Promise<any> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        totalUsers,
        totalServices,
        totalBookings,
        activeUsers,
        activeServices,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        averageRating
      ] = await Promise.all([
        prisma.user.count(),
        prisma.service.count(),
        prisma.booking.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.service.count({ where: { isActive: true } }),
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.booking.count({ where: { status: 'CONFIRMED' } }),
        prisma.booking.count({ where: { status: 'COMPLETED' } }),
        prisma.booking.count({ where: { status: 'CANCELLED' } }),
        prisma.booking.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { totalPrice: true }
        }).then(result => result._sum.totalPrice || 0),
        prisma.review.aggregate({
          _avg: { rating: true }
        }).then(result => result._avg.rating || 0)
      ]);

      return {
        totalUsers,
        totalServices,
        totalBookings,
        activeUsers,
        activeServices,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        averageRating: Math.round(averageRating * 100) / 100
      };
    } catch (error) {
      logger.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Get content management data
   */
  async getContentManagement(): Promise<any> {
    try {
      const [faqs, terms, privacy, contact] = await Promise.all([
        prisma.faqContent.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.termsContent.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.privacyContent.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.contactInfo.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      return { faqs, terms, privacy, contact };
    } catch (error) {
      logger.error('Error fetching content management:', error);
      throw error;
    }
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<any> {
    try {
      const startTime = Date.now();
      
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - startTime;

      // Get system metrics
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          responseTime: `${dbResponseTime}ms`
        },
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        uptime: `${Math.floor(uptime)}s`,
        environment: process.env.NODE_ENV || 'development'
      };
    } catch (error) {
      logger.error('Error fetching system health:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}