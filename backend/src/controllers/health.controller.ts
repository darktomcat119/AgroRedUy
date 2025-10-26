import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * @fileoverview Health Controller - Handles health check endpoints
 * @description This controller manages health check operations for monitoring
 * system status, database connectivity, and system metrics.
 */

export class HealthController {
  /**
   * @description Basic health check endpoint
   * @route GET /health
   * @access Public
   */
  public getHealth = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected',
        version: '1.0.0',
        environment: process.env['NODE_ENV'] || 'development'
      };

      res.json(healthData);
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    }
  };

  /**
   * @description Detailed health check endpoint with database stats
   * @route GET /health/detailed
   * @access Public
   */
  public getDetailedHealth = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Get database stats
      const userCount = await prisma.user.count();
      const serviceCount = await prisma.service.count();
      const bookingCount = await prisma.booking.count();

      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: 'connected',
          stats: {
            users: userCount,
            services: serviceCount,
            bookings: bookingCount
          }
        },
        version: '1.0.0',
        environment: process.env['NODE_ENV'] || 'development',
        nodeVersion: process.version,
        platform: process.platform
      };

      res.json(healthData);
    } catch (error) {
      logger.error('Detailed health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    }
  };
}
