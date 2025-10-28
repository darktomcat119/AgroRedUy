import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface CreateBookingData {
  serviceId: string;
  userId: string;
  availabilityId: string;
  durationHours: number;
  notes?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface UpdateBookingData {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface BookingWithDetails {
  id: string;
  serviceId: string;
  userId: string;
  availabilityId: string;
  status: string;
  totalPrice: number;
  durationHours: number;
  notes?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    address: string;
    city: string;
    department: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
    category: {
      id: string;
      name: string;
    };
  };
  availability: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
  };
  review?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  };
}

export class BookingService {
  async createBooking(data: CreateBookingData): Promise<BookingWithDetails> {
    try {
      // Check if availability exists and is available
      const availability = await prisma.availability.findUnique({
        where: { id: data.availabilityId },
        include: {
          service: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              },
              category: true
            }
          }
        }
      });

      if (!availability) {
        throw new Error('Availability not found');
      }

      if (!availability.isAvailable || availability.isBooked) {
        throw new Error('This time slot is no longer available');
      }

      if (availability.service.userId === data.userId) {
        throw new Error('Cannot book your own service');
      }

      // Calculate total price
      const totalPrice = Number(availability.service.price) * data.durationHours;

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          serviceId: data.serviceId,
          userId: data.userId,
          availabilityId: data.availabilityId,
          totalPrice,
          durationHours: data.durationHours,
          notes: data.notes,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone
        },
        include: {
          service: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              },
              category: true
            }
          },
          availability: true,
          review: true
        }
      });

      // Mark availability as booked
      await prisma.availability.update({
        where: { id: data.availabilityId },
        data: {
          isBooked: true
        }
      });

      logger.info(`Booking created: ${booking.id}`);
      return {
        ...booking,
        totalPrice: Number(booking.totalPrice),
        service: {
          ...booking.service,
          price: Number(booking.service.price)
        }
      } as BookingWithDetails;
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBookings(userId: string, page = 1, limit = 20): Promise<{
    bookings: BookingWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            service: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true
                  }
                },
                category: true
              }
            },
            availability: true,
            review: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.count({ where: { userId } })
      ]);

      return {
        bookings: bookings.map(booking => ({
          ...booking,
          totalPrice: Number(booking.totalPrice),
          service: {
            ...booking.service,
            price: Number(booking.service.price)
          }
        })) as BookingWithDetails[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching bookings:', error);
      throw error;
    }
  }

  async getBookingById(id: string, userId: string): Promise<BookingWithDetails | null> {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          id,
          OR: [
            { userId }, // User's own booking
            { service: { userId } } // Booking for user's service
          ]
        },
        include: {
          service: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              },
              category: true
            }
          },
          availability: true,
          review: true
        }
      });

      if (!booking) {
        return null;
      }

      logger.info(`Booking retrieved: ${id}`);
      return {
        ...booking,
        totalPrice: Number(booking.totalPrice),
        service: {
          ...booking.service,
          price: Number(booking.service.price)
        }
      } as BookingWithDetails;
    } catch (error) {
      logger.error('Error fetching booking:', error);
      throw error;
    }
  }

  async updateBooking(id: string, data: UpdateBookingData, userId: string): Promise<BookingWithDetails> {
    try {
      // Check if user can update this booking
      const existingBooking = await prisma.booking.findFirst({
        where: {
          id,
          OR: [
            { userId }, // User's own booking
            { service: { userId } } // Booking for user's service
          ]
        }
      });

      if (!existingBooking) {
        throw new Error('Booking not found or unauthorized');
      }

      const updateData: any = { ...data };

      // Set timestamps for status changes
      if (data.status === 'CONFIRMED' && existingBooking.status !== 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      }

      if (data.status === 'CANCELLED' && existingBooking.status !== 'CANCELLED') {
        updateData.cancelledAt = new Date();
        
        // Free up the availability slot
        await prisma.availability.update({
          where: { id: existingBooking.availabilityId },
          data: {
            isBooked: false
          }
        });
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          service: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              },
              category: true
            }
          },
          availability: true,
          review: true
        }
      });

      logger.info(`Booking updated: ${id}`);
      return {
        ...booking,
        totalPrice: Number(booking.totalPrice),
        service: {
          ...booking.service,
          price: Number(booking.service.price)
        }
      } as BookingWithDetails;
    } catch (error) {
      logger.error('Error updating booking:', error);
      throw error;
    }
  }

  async cancelBooking(id: string, userId: string): Promise<void> {
    try {
      // Check if user can cancel this booking
      const existingBooking = await prisma.booking.findFirst({
        where: {
          id,
          OR: [
            { userId }, // User's own booking
            { service: { userId } } // Booking for user's service
          ]
        }
      });

      if (!existingBooking) {
        throw new Error('Booking not found or unauthorized');
      }

      if (existingBooking.status === 'CANCELLED') {
        throw new Error('Booking is already cancelled');
      }

      if (existingBooking.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed booking');
      }

      // Update booking status
      await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      // Free up the availability slot
      await prisma.availability.update({
        where: { id: existingBooking.availabilityId },
        data: {
          isBooked: false
        }
      });

      logger.info(`Booking cancelled: ${id}`);
    } catch (error) {
      logger.error('Error cancelling booking:', error);
      throw error;
    }
  }

  async getServiceBookings(serviceId: string, userId: string, page = 1, limit = 20): Promise<{
    bookings: BookingWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Check if user owns the service
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          userId
        }
      });

      if (!service) {
        throw new Error('Service not found or unauthorized');
      }

      const skip = (page - 1) * limit;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: { serviceId },
          skip,
          take: limit,
          include: {
            service: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true
                  }
                },
                category: true
              }
            },
            availability: true,
            review: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.count({ where: { serviceId } })
      ]);

      return {
        bookings: bookings.map(booking => ({
          ...booking,
          totalPrice: Number(booking.totalPrice),
          service: {
            ...booking.service,
            price: Number(booking.service.price)
          }
        })) as BookingWithDetails[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching service bookings:', error);
      throw error;
    }
  }
}
