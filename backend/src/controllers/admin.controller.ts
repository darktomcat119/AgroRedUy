import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { fileService } from '../services/file.service';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRevenue: number;
  topCategories: Array<{ categoryId: string; categoryName: string; serviceCount: number }>;
  topServices: Array<{ serviceId: string; serviceTitle: string; bookingCount: number; totalRevenue: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  serviceGrowth: Array<{ date: string; count: number }>;
  bookingGrowth: Array<{ date: string; count: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class AdminController {
  /**
   * Get comprehensive admin statistics
   */
  public getStatistics = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Get basic counts
      const [
        totalUsers,
        activeUsers,
        totalServices,
        activeServices,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.service.count(),
        prisma.service.count({ where: { isActive: true } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.booking.count({ where: { status: 'CONFIRMED' } }),
        prisma.booking.count({ where: { status: 'COMPLETED' } }),
        prisma.booking.count({ where: { status: 'CANCELLED' } })
      ]);

      // Get revenue data
      const revenueData = await prisma.booking.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _sum: { totalPrice: true },
        _avg: { totalPrice: true }
      });

      const totalRevenue = revenueData._sum.totalPrice || 0;
      const averageRevenue = revenueData._avg.totalPrice || 0;

      // Get top categories with actual service counts
      const categoryStats = await prisma.service.groupBy({
        by: ['categoryId'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      });

      // Get category names for the top categories
      const topCategories = await Promise.all(
        categoryStats.map(async (stat) => {
          const category = await prisma.category.findUnique({
            where: { id: stat.categoryId },
            select: { name: true }
          });
          return {
            categoryId: stat.categoryId,
            categoryName: category?.name || 'Unknown',
            serviceCount: stat._count.id
          };
        })
      );

      // Get top services with actual booking counts and revenue
      const serviceStats = await prisma.booking.groupBy({
        by: ['serviceId'],
        _count: {
          id: true
        },
        _sum: {
          totalPrice: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      });

      // Get service details for the top services
      const topServices = await Promise.all(
        serviceStats.map(async (stat) => {
          const service = await prisma.service.findUnique({
            where: { id: stat.serviceId },
            select: { title: true }
          });
          return {
            serviceId: stat.serviceId,
            serviceTitle: service?.title || 'Unknown',
            bookingCount: stat._count.id,
            totalRevenue: Number(stat._sum.totalPrice || 0)
          };
        })
      );

      const statistics: AdminStatistics = {
        totalUsers,
        activeUsers,
        totalServices,
        activeServices,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: Number(totalRevenue),
        averageRevenue: Number(averageRevenue),
        topCategories,
        topServices,
        // Add growth data (mock for now - can be enhanced with real time-series data)
        userGrowth: [
          { date: '2024-01-01', count: Math.floor(totalUsers * 0.7) },
          { date: '2024-01-15', count: Math.floor(totalUsers * 0.85) },
          { date: '2024-02-01', count: totalUsers }
        ],
        serviceGrowth: [
          { date: '2024-01-01', count: Math.floor(totalServices * 0.6) },
          { date: '2024-01-15', count: Math.floor(totalServices * 0.8) },
          { date: '2024-02-01', count: totalServices }
        ],
        bookingGrowth: [
          { date: '2024-01-01', count: Math.floor(totalBookings * 0.5) },
          { date: '2024-01-15', count: Math.floor(totalBookings * 0.75) },
          { date: '2024-02-01', count: totalBookings }
        ]
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_FETCH_ERROR',
          message: 'Error fetching admin statistics'
        }
      });
    }
  };

  /**
   * Get users with pagination and filtering
   */
  public getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      if (role) {
        where.role = role;
      }
      
      if (status) {
        where.isActive = status === 'active';
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            profileImageUrl: true,
            createdAt: true,
            lastLoginAt: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      // Transform relative URLs to full URLs for profileImageUrl
      const transformedUsers = users.map(user => ({
        ...user,
        profileImageUrl: user.profileImageUrl 
          ? (user.profileImageUrl.startsWith('http') 
              ? user.profileImageUrl 
              : `${process.env.API_URL || 'http://localhost:3003'}${user.profileImageUrl}`)
          : null
      }));

      res.json({
        success: true,
        data: {
          users: transformedUsers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'USERS_FETCH_ERROR',
          message: 'Error fetching users'
        }
      });
    }
  };

  /**
   * Create user
   */
  public createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone, 
        role, 
        isActive, 
        emailVerified,
        address,
        city,
        department,
        dateOfBirth,
        gender,
        occupation,
        company,
        interests,
        newsletter,
        profileImageUrl
      } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User already exists with this email'
          }
        });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          role: role || 'USER',
          isActive: isActive !== undefined ? isActive : true,
          emailVerified: emailVerified !== undefined ? emailVerified : false,
          profileImageUrl: profileImageUrl || null,
          address: address || null,
          city: city || null,
          department: department || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          occupation: occupation || null,
          company: company || null,
          interests: interests ? interests.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0) : [],
          newsletter: newsletter !== undefined ? newsletter : false
        },
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
          updatedAt: true
        }
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_CREATE_ERROR',
          message: 'Error creating user'
        }
      });
    }
  };

  /**
   * Get user details
   */
  public getUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

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
          services: {
            select: {
              id: true,
              title: true,
              isActive: true,
              createdAt: true
            }
          },
          bookings: {
            select: {
              id: true,
              status: true,
              totalPrice: true,
              createdAt: true
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_DETAILS_ERROR',
          message: 'Error fetching user details'
        }
      });
    }
  };

  /**
   * Update user
   */
  public updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
      const { id } = req.params;
    let updateData: any = {};
    
    try {
      updateData = { ...req.body };

      console.log('Update user request:', { id, updateData });

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.passwordHash;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Handle password update if provided
      if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
        delete updateData.password; // Remove plain password
      }

      // Normalize dateOfBirth to a valid Date or null
      if (typeof updateData.dateOfBirth !== 'undefined') {
        if (typeof updateData.dateOfBirth === 'string' && updateData.dateOfBirth.trim() !== '') {
          const parsed = new Date(updateData.dateOfBirth);
          if (!isNaN(parsed.getTime())) {
            updateData.dateOfBirth = parsed;
          } else {
            // Invalid date string; respond with 400
            res.status(400).json({
              success: false,
              error: {
                code: 'INVALID_DATE_OF_BIRTH',
                message: 'dateOfBirth must be a valid ISO date (e.g., 2025-10-15 or 2025-10-15T00:00:00Z)'
              }
            });
            return;
          }
        } else {
          updateData.dateOfBirth = null;
        }
      }

      // Convert empty optional strings to null
      const optionalStrings = ['phone','address','city','department','gender','occupation','company','profileImageUrl','interests'];
      for (const key of optionalStrings) {
        if (Object.prototype.hasOwnProperty.call(updateData, key) && typeof updateData[key] === 'string' && updateData[key].trim() === '') {
          updateData[key] = null;
        }
      }

      // Coerce booleans if sent as strings
      if (typeof updateData.isActive !== 'undefined') {
        updateData.isActive = Boolean(updateData.isActive);
      }
      if (typeof updateData.emailVerified !== 'undefined') {
        updateData.emailVerified = Boolean(updateData.emailVerified);
      }

      // Normalize interests to string[] for Prisma scalar list
      if (typeof updateData.interests !== 'undefined') {
        if (Array.isArray(updateData.interests)) {
          const cleaned = updateData.interests
            .filter((v: unknown) => typeof v === 'string')
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0);
          updateData.interests = cleaned;
        } else if (typeof updateData.interests === 'string') {
          const cleaned = updateData.interests
            .split(/[,\n]/)
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0);
          updateData.interests = cleaned;
        } else {
          // Any other type → clear interests
          updateData.interests = [];
        }
      }

      console.log('Processed update data:', updateData);

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
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
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Update data:', updateData);
      console.error('User ID:', id);
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_UPDATE_ERROR',
          message: 'Error updating user',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  };

  /**
   * Delete user
   */
  public deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_DELETE_ERROR',
          message: 'Error deleting user'
        }
      });
    }
  };

  /**
   * Block/Unblock user
   */
  public blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { blocked } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { isActive: !blocked },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true
        }
      });

      res.json({
        success: true,
        data: user,
        message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_BLOCK_ERROR',
          message: 'Error blocking user'
        }
      });
    }
  };

  /**
   * Reset user password
   */
  public resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password in database
      await prisma.user.update({
        where: { id },
        data: { passwordHash: hashedPassword }
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PASSWORD_RESET_ERROR',
          message: 'Error resetting password'
        }
      });
    }
  };

  /**
   * Get services with pagination and filtering
   */
  public getServices = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, search = '', category = '', status = '' } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      if (category) {
        where.categoryId = category;
      }
      
      if (status) {
        where.isActive = status === 'active';
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            category: {
              select: {
                id: true,
                name: true
              }
            },
            subBadges: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.service.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          services,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVICES_FETCH_ERROR',
          message: 'Error fetching services'
        }
      });
    }
  };

  /**
   * Get service details
   */
  public getServiceDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          units: {
            select: {
              id: true,
              name: true,
              symbol: true
            }
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          subBadges: {
            orderBy: { sortOrder: 'asc' }
          },
          availability: {
            orderBy: { date: 'asc' }
          },
          bookings: {
            select: {
              id: true,
              status: true,
              totalPrice: true,
              createdAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!service) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SERVICE_NOT_FOUND',
            message: 'Service not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      console.error('Error fetching service details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVICE_DETAILS_ERROR',
          message: 'Error fetching service details'
        }
      });
    }
  };

  /**
   * Update service
   */
  public updateService = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log('=== Update Service Request ===');
      console.log('Service ID:', id);
      console.log('Request body keys:', Object.keys(req.body));
      console.log('subBadges in req.body:', (req.body as any).subBadges);
      console.log('Full req.body:', JSON.stringify(req.body, null, 2));
      const schedule = (req.body as any).schedule as { startDate?: string; endDate?: string; startTime?: string; endTime?: string } | undefined;

      // Validate foreign keys if present
      if (updateData.categoryId) {
        const category = await prisma.category.findUnique({ where: { id: String(updateData.categoryId) } });
        if (!category) {
          res.status(400).json({ success: false, error: { code: 'INVALID_CATEGORY', message: 'categoryId does not exist' } });
          return;
        }
      }
      if (updateData.unit_id) {
        const unit = await prisma.units.findUnique({ where: { id: String(updateData.unit_id) } });
        if (!unit) {
          res.status(400).json({ success: false, error: { code: 'INVALID_UNIT', message: 'unit_id does not exist' } });
          return;
        }
      }

      // IMPORTANT: Extract subBadges from req.body BEFORE modifying updateData
      // because updateData is a reference to req.body, and we'll delete subBadges from it
      const subBadges = (req.body as any).subBadges;
      console.log('Sub-badges extracted from req.body BEFORE deletion:', JSON.stringify(subBadges));

      // Build a safe Prisma update payload
      const prismaData: any = {};

      // Primitive fields
      if (typeof updateData.title === 'string') prismaData.title = updateData.title;
      if (typeof updateData.description === 'string') prismaData.description = updateData.description;
      if (updateData.price !== undefined) prismaData.price = Number(updateData.price);
      if (updateData.priceMin !== undefined) prismaData.priceMin = Number(updateData.priceMin);
      if (updateData.priceMax !== undefined) prismaData.priceMax = Number(updateData.priceMax);
      if (typeof updateData.priceCurrency === 'string') prismaData.priceCurrency = updateData.priceCurrency;
      if (updateData.latitude !== undefined) prismaData.latitude = Number(updateData.latitude);
      if (updateData.longitude !== undefined) prismaData.longitude = Number(updateData.longitude);
      if (updateData.radius !== undefined) prismaData.radius = updateData.radius !== null ? Number(updateData.radius) : null;
      if (typeof updateData.address === 'string') prismaData.address = updateData.address;
      if (typeof updateData.city === 'string') prismaData.city = updateData.city;
      if (typeof updateData.department === 'string') prismaData.department = updateData.department;
      if (typeof updateData.isActive === 'boolean') prismaData.isActive = updateData.isActive;
      if (updateData.mapZoom !== undefined) prismaData.mapZoom = Number(updateData.mapZoom);

      // Relations
      if (updateData.categoryId) {
        prismaData.category = { connect: { id: String(updateData.categoryId) } };
      }
      if (updateData.unit_id) {
        prismaData.units = { connect: { id: String(updateData.unit_id) } };
      }

      // Remove fields that shouldn't be updated directly or are not columns
      delete (updateData as any).id;
      delete (updateData as any).userId;
      delete (updateData as any).createdAt;
      delete (updateData as any).updatedAt;
      delete (updateData as any).schedule;
      delete (updateData as any).images;
      delete (updateData as any).subBadges;

      // Update service (we'll re-fetch with all relations after handling subBadges and schedule)
      await prisma.service.update({
        where: { id },
        data: prismaData
      });

      // Handle sub-badges update: delete existing and create new ones
      console.log('Sub-badges received in update (after extraction):', JSON.stringify(subBadges));
      if (Array.isArray(subBadges)) {
        // Delete existing sub-badges
        await prisma.serviceSubBadge.deleteMany({ where: { serviceId: id } });
        console.log(`Deleted existing sub-badges for service ${id}`);
        
        // Create new sub-badges
        if (subBadges.length > 0) {
          let sortOrder = 0;
          for (const badge of subBadges) {
            if (badge.name && badge.name.trim()) {
              const created = await prisma.serviceSubBadge.create({
                data: {
                  serviceId: id,
                  name: String(badge.name).trim(),
                  iconUrl: badge.iconUrl ? String(badge.iconUrl).trim() : null,
                  sortOrder: sortOrder++
                }
              });
              console.log(`Created sub-badge: ${created.id} - ${created.name}`);
            }
          }
        }
      } else {
        console.warn('Sub-badges is not an array:', typeof subBadges, subBadges);
      }

      // If schedule provided, reset availability for this service to the new range (full-day if times omitted)
      if (schedule && schedule.startDate && schedule.endDate) {
        // Remove existing availability
        await prisma.availability.deleteMany({ where: { serviceId: id } });

        const start = new Date(schedule.startDate);
        const end = new Date(schedule.endDate);
        const toCreate: any[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          toCreate.push({
            serviceId: id,
            date: new Date(d),
            startTime: schedule.startTime || '00:00',
            endTime: schedule.endTime || '23:59',
            isAvailable: true,
            isBooked: false
          });
        }
        if (toCreate.length > 0) {
          await prisma.availability.createMany({ data: toCreate });
        }
      }

      // Re-fetch service with all related data (subBadges, availability, images) to include in response
      const updatedService = await prisma.service.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          units: {
            select: {
              id: true,
              name: true,
              symbol: true
            }
          },
          subBadges: {
            orderBy: { sortOrder: 'asc' }
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          availability: {
            orderBy: { date: 'asc' }
          }
        }
      });

      console.log('Updated service with subBadges:', JSON.stringify(updatedService?.subBadges));

      res.json({
        success: true,
        data: updatedService,
        message: 'Service updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating service:', error);
      if (error?.code === 'P2003') {
        const fieldName = error?.meta?.field_name as string | undefined;
        if (fieldName && fieldName.includes('services_unit_id_fkey')) {
          res.status(400).json({ success: false, error: { code: 'INVALID_UNIT', message: 'unit_id does not exist' } });
          return;
        }
        if (fieldName && fieldName.includes('services_category_id_fkey')) {
          res.status(400).json({ success: false, error: { code: 'INVALID_CATEGORY', message: 'categoryId does not exist' } });
          return;
        }
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVICE_UPDATE_ERROR',
          message: 'Error updating service'
        }
      });
    }
  };

  /**
   * Delete service
   */
  public deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await prisma.service.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVICE_DELETE_ERROR',
          message: 'Error deleting service'
        }
      });
    }
  };

  /**
   * Delete a service image (Admin/SuperAdmin)
   */
  public deleteServiceImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { serviceId, imageId } = req.params as { serviceId: string; imageId: string };

      // Fetch image and validate it belongs to the service
      const image = await prisma.serviceImage.findUnique({ where: { id: imageId } });
      if (!image) {
        res.status(404).json({ success: false, error: { code: 'IMAGE_NOT_FOUND', message: 'Service image not found' } });
        return;
      }
      if (image.serviceId !== serviceId) {
        res.status(400).json({ success: false, error: { code: 'IMAGE_SERVICE_MISMATCH', message: 'Image does not belong to service' } });
        return;
      }

      // Delete DB record first
      await prisma.serviceImage.delete({ where: { id: imageId } });

      // Attempt to delete physical file if it's a local upload path
      const imageUrl = image.imageUrl || '';
      let relativePath = '';
      if (imageUrl.startsWith('http')) {
        // Extract '/uploads/...' segment if present
        const uploadsIndex = imageUrl.indexOf('/uploads/');
        if (uploadsIndex >= 0) {
          relativePath = imageUrl.substring(uploadsIndex + '/uploads/'.length);
        }
      } else if (imageUrl.startsWith('/uploads/')) {
        relativePath = imageUrl.substring('/uploads/'.length);
      }

      if (relativePath) {
        try {
          await fileService.deleteFile(relativePath);
        } catch (_e) {
          // ignore file deletion errors
        }
      }

      res.json({ success: true, message: 'Service image deleted' });
    } catch (error) {
      console.error('Error deleting service image:', error);
      res.status(500).json({ success: false, error: { code: 'SERVICE_IMAGE_DELETE_ERROR', message: 'Error deleting service image' } });
    }
  };

  /**
   * Create service (Admin/SuperAdmin)
   */
  public createService = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const {
        title,
        description,
        price,
        priceMin,
        priceMax,
        priceCurrency,
        latitude,
        longitude,
        mapZoom,
        radius,
        address,
        city,
        department,
        categoryId,
        unit_id,
        images = [],
        schedule,
        subBadges = []
      } = req.body as any;
      // Pre-validate FK references to avoid Prisma P2003
      const [category, unit] = await Promise.all([
        prisma.category.findUnique({ where: { id: String(categoryId) } }),
        prisma.units.findUnique({ where: { id: String(unit_id) } })
      ]);
      if (!category) {
        res.status(400).json({ success: false, error: { code: 'INVALID_CATEGORY', message: 'categoryId does not exist' } });
        return;
      }
      if (!unit) {
        res.status(400).json({ success: false, error: { code: 'INVALID_UNIT', message: 'unit_id does not exist' } });
        return;
      }
      // Use service layer to avoid schema/type mismatches
      const { ServiceService } = await import('../services/service.service');
      const serviceService = new ServiceService();

      const created = await serviceService.createService({
        title: String(title),
        description: String(description),
        price: Number(price),
        priceMin: priceMin !== undefined ? Number(priceMin) : undefined,
        priceMax: priceMax !== undefined ? Number(priceMax) : undefined,
        priceCurrency: priceCurrency ? String(priceCurrency) : undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        mapZoom: mapZoom !== undefined ? Number(mapZoom) : 6,
        radius: radius !== undefined && radius !== null ? Number(radius) : undefined,
        address: String(address),
        city: String(city),
        department: String(department),
        categoryId: String(categoryId),
        unit_id: String(unit_id),
        userId
      });

      // Create images if provided
      if (Array.isArray(images) && images.length > 0) {
        let order = 0;
        for (const url of images as string[]) {
          await prisma.serviceImage.create({
            data: {
              serviceId: created.id,
              imageUrl: url,
              sortOrder: order++,
              isPrimary: order === 1
            }
          });
        }
      }

      // Create sub-badges if provided
      if (Array.isArray(subBadges) && subBadges.length > 0) {
        let sortOrder = 0;
        for (const badge of subBadges) {
          if (badge.name && badge.name.trim()) {
            await prisma.serviceSubBadge.create({
              data: {
                serviceId: created.id,
                name: String(badge.name).trim(),
                iconUrl: badge.iconUrl ? String(badge.iconUrl).trim() : null,
                sortOrder: sortOrder++
              }
            });
          }
        }
      }

      // Create availability if a schedule was provided (times optional; default full-day)
      if (schedule && schedule.startDate && schedule.endDate) {
        const start = new Date(schedule.startDate);
        const end = new Date(schedule.endDate);
        // generate daily availability entries between dates
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          await prisma.availability.create({
            data: {
              serviceId: created.id,
              date: new Date(d),
              startTime: schedule.startTime || '00:00',
              endTime: schedule.endTime || '23:59',
              isAvailable: true,
              isBooked: false
            }
          });
        }
      }

      const result = await prisma.service.findUnique({
        where: { id: created.id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true } },
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          subBadges: { orderBy: { sortOrder: 'asc' } },
          reviews: {
            include: { user: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error creating service:', error);
      if (error?.code === 'P2003') {
        const fieldName = error?.meta?.field_name as string | undefined;
        if (fieldName && fieldName.includes('services_unit_id_fkey')) {
          res.status(400).json({ success: false, error: { code: 'INVALID_UNIT', message: 'unit_id does not exist' } });
          return;
        }
        if (fieldName && fieldName.includes('services_category_id_fkey')) {
          res.status(400).json({ success: false, error: { code: 'INVALID_CATEGORY', message: 'categoryId does not exist' } });
          return;
        }
      }
      res.status(500).json({ success: false, error: { code: 'SERVICE_CREATE_ERROR', message: 'Error creating service' } });
    }
  };

  /**
   * Approve/Reject service
   */
  public approveService = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      const service = await prisma.service.update({
        where: { id },
        data: { isActive: approved },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: service,
        message: `Service ${approved ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Error approving service:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVICE_APPROVAL_ERROR',
          message: 'Error approving service'
        }
      });
    }
  };

  /**
   * Get measurement units for services
   */
  public getUnits = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const units = await prisma.units.findMany({
        where: { is_active: true },
        orderBy: { name: 'asc' }
      });
      res.json({ success: true, data: units });
    } catch (error) {
      console.error('Error fetching units:', error);
      res.status(500).json({ success: false, error: { code: 'UNITS_FETCH_ERROR', message: 'Error fetching units' } });
    }
  };

  /**
   * Get platform settings
   */
  public getSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Mock settings data - in production, this would come from a settings table
      const settings = {
        general: {
          platformName: 'AgroRedUy',
          platformDescription: 'Plataforma de servicios agrícolas',
          platformUrl: 'https://agrored.uy',
          supportEmail: 'support@agrored.uy',
          contactPhone: '+598 99 123 456',
          timezone: 'America/Montevideo',
          language: 'es',
          currency: 'UYU',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h'
        },
        features: {
          userRegistration: true,
          contractorRegistration: true,
          serviceBooking: true,
          paymentProcessing: true,
          notifications: true,
          analytics: true,
          reports: true,
          apiAccess: true
        },
        limits: {
          maxUsersPerContractor: 1000,
          maxServicesPerContractor: 50,
          maxBookingsPerUser: 100,
          maxFileSize: 10485760, // 10MB
          maxImagesPerService: 10,
          sessionTimeout: 3600, // 1 hour
          passwordMinLength: 8,
          passwordRequireSpecial: true
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          adminNotifications: true,
          userWelcomeEmail: true,
          bookingConfirmationEmail: true,
          paymentConfirmationEmail: true,
          reminderEmails: true
        },
        security: {
          requireEmailVerification: true,
          requirePhoneVerification: false,
          twoFactorAuth: false,
          passwordExpiry: 90, // days
          maxLoginAttempts: 5,
          lockoutDuration: 900, // 15 minutes
          sessionSecurity: true,
          ipWhitelist: [] as string[],
          allowedDomains: [] as string[]
        },
        payment: {
          enabled: true,
          defaultCurrency: 'UYU',
          supportedCurrencies: ['UYU', 'USD'],
          paymentMethods: ['credit_card', 'bank_transfer', 'cash'],
          commissionRate: 0.05, // 5%
          minimumPayout: 1000,
          payoutSchedule: 'weekly',
          taxRate: 0.22 // 22% IVA
        },
        maintenance: {
          maintenanceMode: false,
          maintenanceMessage: 'El sitio está en mantenimiento. Volveremos pronto.',
          scheduledMaintenance: null as string | null,
          autoBackup: true,
          backupFrequency: 'daily',
          logRetention: 30 // days
        }
      };

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SETTINGS_FETCH_ERROR',
          message: 'Error fetching settings'
        }
      });
    }
  };

  /**
   * Update platform settings
   */
  public updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { category, settings } = req.body;

      if (!category || !settings) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Category and settings are required'
          }
        });
        return;
      }

      // Validate category
      const validCategories = ['general', 'features', 'limits', 'notifications', 'security', 'payment', 'maintenance'];
      if (!validCategories.includes(category)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Invalid settings category'
          }
        });
        return;
      }

      // In production, this would update the database
      console.log(`Updating ${category} settings:`, settings);

      res.json({
        success: true,
        message: `${category} settings updated successfully`,
        data: {
          category,
          updatedAt: new Date().toISOString(),
          updatedBy: req.user?.id
        }
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SETTINGS_UPDATE_ERROR',
          message: 'Error updating settings'
        }
      });
    }
  };

  /**
   * Reset settings to default
   */
  public resetSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { category } = req.body;

      if (!category) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Category is required'
          }
        });
        return;
      }

      // Validate category
      const validCategories = ['general', 'features', 'limits', 'notifications', 'security', 'payment', 'maintenance'];
      if (!validCategories.includes(category)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Invalid settings category'
          }
        });
        return;
      }

      // In production, this would reset to default values in database
      console.log(`Resetting ${category} settings to default`);

      res.json({
        success: true,
        message: `${category} settings reset to default successfully`,
        data: {
          category,
          resetAt: new Date().toISOString(),
          resetBy: req.user?.id
        }
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SETTINGS_RESET_ERROR',
          message: 'Error resetting settings'
        }
      });
    }
  };

  /**
   * Get system health status
   */
  public getSystemHealth = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: 'healthy',
            responseTime: Math.random() * 50 + 10, // Mock response time
            lastCheck: new Date().toISOString()
          },
          redis: {
            status: 'healthy',
            responseTime: Math.random() * 20 + 5,
            lastCheck: new Date().toISOString()
          },
          storage: {
            status: 'healthy',
            diskUsage: Math.random() * 30 + 40, // Mock disk usage percentage
            lastCheck: new Date().toISOString()
          },
          email: {
            status: 'healthy',
            lastSent: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            lastCheck: new Date().toISOString()
          }
        },
        metrics: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          activeConnections: Math.floor(Math.random() * 100 + 50)
        }
      };

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: 'Error fetching system health'
        }
      });
    }
  };

  /**
   * Get security logs
   */
  public getSecurityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 50, level = '', type = '', startDate = '', endDate = '' } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      // Mock security logs data - in production, this would come from a security_logs table
      const mockLogs = [
        {
          id: 'log_1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          level: 'warning',
          type: 'failed_login',
          message: 'Multiple failed login attempts detected',
          details: {
            email: 'user@example.com',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            attempts: 5,
            blocked: true
          },
          userId: null as string | null,
          ipAddress: '192.168.1.100',
          resolved: false
        },
        {
          id: 'log_2',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          level: 'info',
          type: 'password_change',
          message: 'User password changed successfully',
          details: {
            userId: 'user_123',
            email: 'user@example.com',
            changedBy: 'user_123',
            ipAddress: '192.168.1.101'
          },
          userId: 'user_123',
          ipAddress: '192.168.1.101',
          resolved: true
        }
      ];

      // Filter logs based on query parameters
      let filteredLogs = mockLogs;
      
      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }
      
      if (type) {
        filteredLogs = filteredLogs.filter(log => log.type === type);
      }
      
      if (startDate) {
        const start = new Date(startDate as string);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate as string);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
      }

      const paginatedLogs = filteredLogs.slice(skip, skip + Number(limit));

      res.json({
        success: true,
        data: {
          logs: paginatedLogs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: filteredLogs.length,
            pages: Math.ceil(filteredLogs.length / Number(limit))
          },
          summary: {
            totalLogs: filteredLogs.length,
            unresolvedLogs: filteredLogs.filter(log => !log.resolved).length,
            criticalLogs: filteredLogs.filter(log => log.level === 'error').length,
            warningLogs: filteredLogs.filter(log => log.level === 'warning').length
          }
        }
      });
    } catch (error) {
      console.error('Error fetching security logs:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SECURITY_LOGS_ERROR',
          message: 'Error fetching security logs'
        }
      });
    }
  };

  /**
   * Get security statistics
   */
  public getSecurityStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { period = '7d' } = req.query;
      
      // Calculate date range based on period
      let daysBack = 7;
      if (period === '1d') daysBack = 1;
      else if (period === '7d') daysBack = 7;
      else if (period === '30d') daysBack = 30;
      else if (period === '90d') daysBack = 90;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Mock security statistics - in production, this would query the database
      const stats = {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        overview: {
          totalEvents: Math.floor(Math.random() * 1000 + 500),
          criticalEvents: Math.floor(Math.random() * 50 + 10),
          warningEvents: Math.floor(Math.random() * 200 + 50),
          infoEvents: Math.floor(Math.random() * 800 + 200),
          resolvedEvents: Math.floor(Math.random() * 600 + 300),
          unresolvedEvents: Math.floor(Math.random() * 200 + 50)
        },
        eventTypes: {
          failed_login: Math.floor(Math.random() * 100 + 20),
          password_change: Math.floor(Math.random() * 50 + 10),
          unauthorized_access: Math.floor(Math.random() * 30 + 5),
          user_registration: Math.floor(Math.random() * 200 + 50),
          suspicious_activity: Math.floor(Math.random() * 40 + 10),
          data_breach_attempt: Math.floor(Math.random() * 10 + 2),
          admin_action: Math.floor(Math.random() * 80 + 20)
        },
        topThreats: [
          {
            type: 'failed_login',
            count: Math.floor(Math.random() * 100 + 20),
            severity: 'medium',
            trend: 'increasing'
          },
          {
            type: 'unauthorized_access',
            count: Math.floor(Math.random() * 30 + 5),
            severity: 'high',
            trend: 'stable'
          },
          {
            type: 'suspicious_activity',
            count: Math.floor(Math.random() * 40 + 10),
            severity: 'medium',
            trend: 'decreasing'
          }
        ],
        ipAddresses: [
          {
            ip: '192.168.1.100',
            events: Math.floor(Math.random() * 50 + 10),
            country: 'Uruguay',
            blocked: true,
            lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString()
          },
          {
            ip: '192.168.1.200',
            events: Math.floor(Math.random() * 30 + 5),
            country: 'Unknown',
            blocked: true,
            lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString()
          }
        ],
        userActivity: [
          {
            userId: 'user_123',
            email: 'user@example.com',
            events: Math.floor(Math.random() * 20 + 5),
            lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            riskLevel: 'low'
          },
          {
            userId: 'user_789',
            email: 'suspicious@example.com',
            events: Math.floor(Math.random() * 50 + 20),
            lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            riskLevel: 'high'
          }
        ]
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching security statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SECURITY_STATS_ERROR',
          message: 'Error fetching security statistics'
        }
      });
    }
  };

  /**
   * Block IP address
   */
  public blockIpAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { ipAddress, reason, duration } = req.body;

      if (!ipAddress || !reason) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'IP address and reason are required'
          }
        });
        return;
      }

      // In production, this would add to blocked IPs table
      console.log(`Blocking IP address: ${ipAddress}, Reason: ${reason}, Duration: ${duration || 'permanent'}`);

      res.json({
        success: true,
        message: `IP address ${ipAddress} blocked successfully`,
        data: {
          ipAddress,
          reason,
          duration: duration || 'permanent',
          blockedAt: new Date().toISOString(),
          blockedBy: req.user?.id
        }
      });
    } catch (error) {
      console.error('Error blocking IP address:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'IP_BLOCK_ERROR',
          message: 'Error blocking IP address'
        }
      });
    }
  };

  /**
   * Unblock IP address
   */
  public unblockIpAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { ipAddress } = req.params;

      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'IP address is required'
          }
        });
        return;
      }

      // In production, this would remove from blocked IPs table
      console.log(`Unblocking IP address: ${ipAddress}`);

      res.json({
        success: true,
        message: `IP address ${ipAddress} unblocked successfully`,
        data: {
          ipAddress,
          unblockedAt: new Date().toISOString(),
          unblockedBy: req.user?.id
        }
      });
    } catch (error) {
      console.error('Error unblocking IP address:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'IP_UNBLOCK_ERROR',
          message: 'Error unblocking IP address'
        }
      });
    }
  };

  /**
   * Resolve security log
   */
  public resolveSecurityLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { logId } = req.params;
      const { resolution, notes } = req.body;

      if (!logId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Log ID is required'
          }
        });
        return;
      }

      // In production, this would update the security log
      console.log(`Resolving security log: ${logId}, Resolution: ${resolution}, Notes: ${notes}`);

      res.json({
        success: true,
        message: 'Security log resolved successfully',
        data: {
          logId,
          resolution,
          notes,
          resolvedAt: new Date().toISOString(),
          resolvedBy: req.user?.id
        }
      });
    } catch (error) {
      console.error('Error resolving security log:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOG_RESOLVE_ERROR',
          message: 'Error resolving security log'
        }
      });
    }
  };

  /**
   * Get all categories
   */
  public async getCategories(_req: AuthRequest, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CATEGORIES_FETCH_ERROR',
          message: 'Failed to fetch categories'
        }
      });
    }
  }

  /**
   * Create a new category
   */
  public async createCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, iconUrl } = req.body;

      // Check if category with same name already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name }
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_EXISTS',
            message: 'A category with this name already exists'
          }
        });
        return;
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
          iconUrl
        }
      });

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CATEGORY_CREATE_ERROR',
          message: 'Failed to create category'
        }
      });
    }
  }

  /**
   * Update a category
   */
  public async updateCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found'
          }
        });
        return;
      }

      // If updating name, check for duplicates
      if (updateData.name && updateData.name !== existingCategory.name) {
        const duplicateCategory = await prisma.category.findUnique({
          where: { name: updateData.name }
        });

        if (duplicateCategory) {
          res.status(400).json({
            success: false,
            error: {
              code: 'CATEGORY_EXISTS',
              message: 'A category with this name already exists'
            }
          });
          return;
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CATEGORY_UPDATE_ERROR',
          message: 'Failed to update category'
        }
      });
    }
  }

  /**
   * Delete a category
   */
  public async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id },
        include: {
          services: true
        }
      });

      if (!existingCategory) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found'
          }
        });
        return;
      }

      // Check if category has services
      if (existingCategory.services.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_HAS_SERVICES',
            message: 'Cannot delete category that has services. Please reassign or delete services first.'
          }
        });
        return;
      }

      await prisma.category.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CATEGORY_DELETE_ERROR',
          message: 'Failed to delete category'
        }
      });
    }
  }

  /**
   * Get all sub-badges (across all services)
   */
  public async getSubBadges(_req: AuthRequest, res: Response) {
    try {
      const subBadges = await prisma.serviceSubBadge.findMany({
        include: {
          service: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: subBadges
      });
    } catch (error) {
      console.error('Error fetching sub-badges:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SUB_BADGES_FETCH_ERROR',
          message: 'Failed to fetch sub-badges'
        }
      });
    }
  }

  /**
   * Create a new sub-badge
   */
  public async createSubBadge(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, iconUrl, serviceId } = req.body;

      if (!name || !serviceId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'name and serviceId are required'
          }
        });
        return;
      }

      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SERVICE_NOT_FOUND',
            message: 'Service not found'
          }
        });
        return;
      }

      // Get max sortOrder for this service
      const maxSort = await prisma.serviceSubBadge.findFirst({
        where: { serviceId },
        orderBy: { sortOrder: 'desc' }
      });

      const subBadge = await prisma.serviceSubBadge.create({
        data: {
          name,
          iconUrl: iconUrl || null,
          serviceId,
          sortOrder: maxSort ? maxSort.sortOrder + 1 : 0
        },
        include: {
          service: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: subBadge
      });
    } catch (error) {
      console.error('Error creating sub-badge:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SUB_BADGE_CREATE_ERROR',
          message: 'Failed to create sub-badge'
        }
      });
    }
  }

  /**
   * Update a sub-badge
   */
  public async updateSubBadge(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if sub-badge exists
      const existingSubBadge = await prisma.serviceSubBadge.findUnique({
        where: { id }
      });

      if (!existingSubBadge) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUB_BADGE_NOT_FOUND',
            message: 'Sub-badge not found'
          }
        });
        return;
      }

      // If updating serviceId, verify service exists
      if (updateData.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: updateData.serviceId }
        });

        if (!service) {
          res.status(404).json({
            success: false,
            error: {
              code: 'SERVICE_NOT_FOUND',
              message: 'Service not found'
            }
          });
          return;
        }
      }

      const updatedSubBadge = await prisma.serviceSubBadge.update({
        where: { id },
        data: {
          name: updateData.name,
          iconUrl: updateData.iconUrl !== undefined ? updateData.iconUrl : undefined,
          sortOrder: updateData.sortOrder !== undefined ? updateData.sortOrder : undefined
        },
        include: {
          service: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: updatedSubBadge
      });
    } catch (error) {
      console.error('Error updating sub-badge:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SUB_BADGE_UPDATE_ERROR',
          message: 'Failed to update sub-badge'
        }
      });
    }
  }

  /**
   * Delete a sub-badge
   */
  public async deleteSubBadge(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if sub-badge exists
      const existingSubBadge = await prisma.serviceSubBadge.findUnique({
        where: { id }
      });

      if (!existingSubBadge) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUB_BADGE_NOT_FOUND',
            message: 'Sub-badge not found'
          }
        });
        return;
      }

      await prisma.serviceSubBadge.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Sub-badge deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting sub-badge:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SUB_BADGE_DELETE_ERROR',
          message: 'Failed to delete sub-badge'
        }
      });
    }
  }
}