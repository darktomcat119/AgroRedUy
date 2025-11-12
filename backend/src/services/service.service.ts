import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface CreateServiceData {
  title: string;
  description: string;
  categoryId: string;
  userId: string;
  // Optional fields
  price?: number;
  priceMin?: number;
  priceMax?: number;
  priceCurrency?: string;
  latitude?: number;
  longitude?: number;
  mapZoom?: number;
  radius?: number;
  address?: string;
  city?: string;
  department?: string;
  unit_id?: string;
}

export interface UpdateServiceData {
  title?: string;
  description?: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  latitude?: number;
  longitude?: number;
  mapZoom?: number;
  radius?: number;
  address?: string;
  city?: string;
  department?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface ServiceFilters {
  categoryId?: string;
  city?: string;
  department?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  isActive?: boolean;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ServiceWithDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  priceMin?: number;
  priceMax?: number;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  category: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
  averageRating?: number;
  reviewCount?: number;
}

export class ServiceService {
  async createService(data: CreateServiceData): Promise<ServiceWithDetails> {
    try {
      console.log('ServiceService.createService - Input data:', data);
      
      // Ensure default unit exists, or get the first available unit
      let finalUnitId = data.unit_id;
      if (!finalUnitId) {
        // Try to use default unit
        const defaultUnit = await prisma.units.findUnique({ where: { id: 'unit-hour' } });
        if (defaultUnit) {
          finalUnitId = 'unit-hour';
        } else {
          // If default doesn't exist, get first available unit
          const firstUnit = await prisma.units.findFirst({ where: { is_active: true } });
          if (!firstUnit) {
            throw new Error('No hay unidades disponibles. Por favor, ejecute el seed de la base de datos.');
          }
          finalUnitId = firstUnit.id;
        }
        console.log('Using default unit_id:', finalUnitId);
      }
      
      // Build create data object with all required database fields
      // Note: Schema requires these fields to be NOT NULL
      const createData: any = {
        // Required fields
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        userId: data.userId,
        
        // Database-required fields with defaults
        price: (data.price !== undefined && data.price !== null) ? Number(data.price) : 0,
        priceCurrency: data.priceCurrency || 'UYU',
        latitude: (data.latitude !== undefined && data.latitude !== null) ? Number(data.latitude) : -32.5228,
        longitude: (data.longitude !== undefined && data.longitude !== null) ? Number(data.longitude) : -55.7658,
        mapZoom: (data.mapZoom !== undefined && data.mapZoom !== null) ? Number(data.mapZoom) : 6,
        address: data.address || '',
        city: data.city || '',
        department: data.department || '',
        unit_id: finalUnitId, // Validated unit_id
        
        // Truly optional fields (nullable in DB)
        priceMin: (data.priceMin !== undefined && data.priceMin !== null) ? Number(data.priceMin) : null,
        priceMax: (data.priceMax !== undefined && data.priceMax !== null) ? Number(data.priceMax) : null,
        radius: (data.radius !== undefined && data.radius !== null) ? Number(data.radius) : null
      };
      
      console.log('ServiceService.createService - Create data:', createData);

      const service = await prisma.service.create({
        data: createData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true
            }
          },
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          subBadges: {
            orderBy: { sortOrder: 'asc' }
          },
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      console.log('✅ Service created in database:', service.id);
      
      const serviceWithStats = await this.addServiceStats(service);
      logger.info(`Service created: ${service.id}`);
      return serviceWithStats;
    } catch (error: any) {
      console.error('❌ ServiceService.createService ERROR:');
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error details:', error);
      logger.error('Error creating service:', error);
      throw error;
    }
  }

  async getServices(filters: ServiceFilters = {}, page = 1, limit = 20): Promise<{
    services: ServiceWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {};

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (!filters.area) {
        if (filters.city) {
          where.city = { contains: filters.city, mode: 'insensitive' };
        }

        if (filters.department) {
          where.department = { contains: filters.department, mode: 'insensitive' };
        }
      }

      if (filters.area) {
        const areaCond = {
          OR: [
            { city: { contains: filters.area, mode: 'insensitive' } },
            { department: { contains: filters.area, mode: 'insensitive' } }
          ]
        } as any;
        if (where.AND) {
          (where.AND as any[]).push(areaCond);
        } else {
          where.AND = [areaCond];
        }
      }

      // If both city and department are provided and have the same value, treat as a generic area OR
      if (!filters.area && filters.city && filters.department && filters.city.toLowerCase() === filters.department.toLowerCase()) {
        // Remove strict city/department filters in favor of OR
        delete (where as any).city;
        delete (where as any).department;
        const val = filters.city;
        const areaCond = {
          OR: [
            { city: { contains: val, mode: 'insensitive' } },
            { department: { contains: val, mode: 'insensitive' } }
          ]
        } as any;
        if (where.AND) {
          (where.AND as any[]).push(areaCond);
        } else {
          where.AND = [areaCond];
        }
      }

      if (filters.minPrice !== undefined) {
        where.pricePerHour = { gte: filters.minPrice } as any;
      }

      if (filters.maxPrice !== undefined) {
        where.pricePerHour = { ...(where as any).pricePerHour, lte: filters.maxPrice } as any;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { address: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Geographic filtering
      if (filters.latitude && filters.longitude && filters.radius) {
        // This would require PostGIS extension for proper geographic queries
        // For now, we'll use a simple bounding box approximation
        const latDelta = filters.radius / 111; // Rough conversion: 1 degree ≈ 111 km
        const lngDelta = filters.radius / (111 * Math.cos(filters.latitude * Math.PI / 180));
        
        where.latitude = {
          gte: filters.latitude - latDelta,
          lte: filters.latitude + latDelta
        };
        where.longitude = {
          gte: filters.longitude - lngDelta,
          lte: filters.longitude + lngDelta
        };
      }

      // Availability date range filtering
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        start.setHours(0,0,0,0);
        const end = new Date(filters.endDate);
        end.setHours(23,59,59,999);
        where.availability = {
          some: {
            isAvailable: true,
            date: { gte: start, lte: end }
          }
        };
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true
              }
            },
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' }
            },
            subBadges: {
              orderBy: { sortOrder: 'asc' }
            },
            reviews: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.service.count({ where })
      ]);

      const servicesWithStats = await Promise.all(
        services.map(service => this.addServiceStats(service))
      );

      return {
        services: servicesWithStats,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching services:', error);
      throw error;
    }
  }

  async getServiceById(id: string): Promise<ServiceWithDetails | null> {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              phone: true
            }
          },
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          subBadges: {
            orderBy: { sortOrder: 'asc' }
          },
          availability: {
            where: { isAvailable: true },
            orderBy: { date: 'asc' }
          },
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!service) {
        return null;
      }

      const serviceWithStats = await this.addServiceStats(service);
      logger.info(`Service retrieved: ${id}`);
      return serviceWithStats;
    } catch (error) {
      logger.error('Error fetching service:', error);
      throw error;
    }
  }

  async updateService(id: string, data: UpdateServiceData, userId: string): Promise<ServiceWithDetails> {
    try {
      // Check if user owns the service
      const existingService = await prisma.service.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!existingService) {
        throw new Error('Service not found');
      }

      if (existingService.userId !== userId) {
        throw new Error('Unauthorized to update this service');
      }

      const service = await prisma.service.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true
            }
          },
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      const serviceWithStats = await this.addServiceStats(service);
      logger.info(`Service updated: ${id}`);
      return serviceWithStats;
    } catch (error) {
      logger.error('Error updating service:', error);
      throw error;
    }
  }

  async deleteService(id: string, userId: string): Promise<void> {
    try {
      // Check if user owns the service
      const existingService = await prisma.service.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!existingService) {
        throw new Error('Service not found');
      }

      if (existingService.userId !== userId) {
        throw new Error('Unauthorized to delete this service');
      }

      await prisma.service.delete({
        where: { id }
      });

      logger.info(`Service deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting service:', error);
      throw error;
    }
  }

  async getUserServices(userId: string, page = 1, limit = 20): Promise<{
    services: ServiceWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true
              }
            },
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' }
            },
            reviews: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.service.count({ where: { userId } })
      ]);

      const servicesWithStats = await Promise.all(
        services.map(service => this.addServiceStats(service))
      );

      return {
        services: servicesWithStats,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching user services:', error);
      throw error;
    }
  }

  private async addServiceStats(service: any): Promise<ServiceWithDetails> {
    // Calculate average rating and review count
    const stats = await prisma.review.aggregate({
      where: { serviceId: service.id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    return {
      ...service,
      averageRating: stats._avg.rating || 0,
      reviewCount: stats._count.rating || 0
    };
  }

  async getCategories(): Promise<{ id: string; name: string; description: string; iconUrl: string; isActive: boolean }[]> {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          iconUrl: true,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });

      return categories;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }
}
