import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { logger } from '../config/logger';

/**
 * @fileoverview Booking Controller - Handles all booking-related HTTP requests
 * @description This controller manages booking operations including creating,
 * updating, canceling bookings, and retrieving booking information.
 */

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  /**
   * @description Get user's bookings with pagination
   * @route GET /bookings
   * @access Private
   */
  public getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const userId = (req as any).user.id;

      const result = await this.bookingService.getBookings(userId, page, limit);

      res.json({
        success: true,
        data: result,
        message: 'Bookings retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKINGS_FAILED',
          message: 'Failed to fetch bookings'
        }
      });
    }
  };

  /**
   * @description Get booking by ID
   * @route GET /bookings/:id
   * @access Private
   */
  public getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_ID',
            message: 'Booking ID is required'
          }
        });
        return;
      }

      const booking = await this.bookingService.getBookingById(id, userId);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: booking,
        message: 'Booking retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error fetching booking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKING_FAILED',
          message: 'Failed to fetch booking'
        }
      });
    }
  };

  /**
   * @description Create a new booking
   * @route POST /bookings
   * @access Private
   */
  public createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const bookingData = {
        ...req.body,
        userId
      };

      const booking = await this.bookingService.createBooking(bookingData);

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating booking:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_BOOKING_FAILED',
          message: error.message || 'Failed to create booking'
        }
      });
    }
  };

  /**
   * @description Update booking
   * @route PUT /bookings/:id
   * @access Private
   */
  public updateBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_ID',
            message: 'Booking ID is required'
          }
        });
        return;
      }

      const booking = await this.bookingService.updateBooking(id, updateData, userId);

      res.json({
        success: true,
        data: booking,
        message: 'Booking updated successfully'
      });
    } catch (error: any) {
      logger.error('Error updating booking:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_BOOKING_FAILED',
          message: error.message || 'Failed to update booking'
        }
      });
    }
  };

  /**
   * @description Cancel booking
   * @route DELETE /bookings/:id
   * @access Private
   */
  public cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_ID',
            message: 'Booking ID is required'
          }
        });
        return;
      }

      await this.bookingService.cancelBooking(id, userId);

      res.json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error: any) {
      logger.error('Error cancelling booking:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CANCEL_BOOKING_FAILED',
          message: error.message || 'Failed to cancel booking'
        }
      });
    }
  };

  /**
   * @description Get bookings for a specific service
   * @route GET /bookings/service/:serviceId
   * @access Private
   */
  public getBookingsByService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;

      if (!serviceId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SERVICE_ID',
            message: 'Service ID is required'
          }
        });
        return;
      }

      const userId = (req as any).user.id;
      const result = await this.bookingService.getServiceBookings(serviceId, userId, page, limit);

      res.json({
        success: true,
        data: result,
        message: 'Service bookings retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error fetching service bookings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SERVICE_BOOKINGS_FAILED',
          message: 'Failed to fetch service bookings'
        }
      });
    }
  };
}
