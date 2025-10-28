import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;
const prisma = new PrismaClient();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

// Real admin statistics endpoint
app.get('/api/v1/admin/statistics', async (_req, res) => {
  try {
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
      _sum: { totalPrice: true },
      _avg: { totalPrice: true },
      _count: { id: true }
    });

    const totalRevenue = Number(revenueData._sum.totalPrice || 0);
    const averageRevenue = Number(revenueData._avg.totalPrice || 0);

    // Get top categories
    const categoryStats = await prisma.service.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

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

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalServices,
        activeServices,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        averageRevenue,
        topCategories,
        // Mock data for charts (can be enhanced later)
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
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch statistics'
      }
    });
  }
});

// Real admin categories endpoint
app.get('/api/v1/admin/categories', async (_req, res) => {
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
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch categories'
      }
    });
  }
});

// Real admin users endpoint
app.get('/api/v1/admin/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: {
        users: users,
        pagination: {
          page: 1,
          limit: 10,
          total: users.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch users'
      }
    });
  }
});

// Mock admin services endpoint
app.get('/api/v1/admin/services', (_req, res) => {
  res.json({
    success: true,
    data: {
      services: [
        {
          id: '1',
          title: 'Fumigación de cultivos',
          description: 'Servicio profesional de fumigación para cultivos',
          categoryId: '1',
          category: { name: 'Fumigación' },
          price: 1500,
          location: 'Montevideo',
          isActive: true,
          isVerified: true,
          user: {
            firstName: 'María',
            lastName: 'González',
            email: 'maria.gonzalez@email.com'
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    }
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'AgroRedUy API is running'
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'AgroRedUy API - Agricultural Services Marketplace',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/v1',
      admin: '/api/v1/admin'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AgroRedUy API server running on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Admin Stats: http://localhost:${PORT}/api/v1/admin/statistics`);
  console.log(`📁 Admin Categories: http://localhost:${PORT}/api/v1/admin/categories`);
  console.log(`👥 Admin Users: http://localhost:${PORT}/api/v1/admin/users`);
  console.log(`🔧 Admin Services: http://localhost:${PORT}/api/v1/admin/services`);
});

export default app;
