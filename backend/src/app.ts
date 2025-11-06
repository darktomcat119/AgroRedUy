import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import session from 'express-session';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';
import oauthRoutes from './routes/oauth.routes';
import fileRoutes from './routes/file.routes';
import searchRoutes from './routes/search.routes';
import mapsRoutes from './routes/maps.routes';
import notificationRoutes from './routes/notification.routes';
import scheduleRequestRoutes from './routes/schedule-request.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { logger } from './config/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      // Allow images to be loaded cross-origin from dev frontends and backend
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001"
      ],
    },
  },
  // Critical for allowing cross-origin images (avatars) to be consumed by the frontend
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const corsOptions = {
  origin: process.env['NODE_ENV'] === 'production' 
    ? [process.env['CORS_ORIGIN'] || 'https://agrored.uy']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '1000'), // Increased for development
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development (React StrictMode causes duplicate requests)
  skip: (req) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const ip = req.ip || req.socket?.remoteAddress || '';
    const isLocalhost = ip === '127.0.0.1' 
      || ip === '::1' 
      || ip === '::ffff:127.0.0.1'
      || ip.includes('localhost')
      || ip.includes('127.0.0.1');
    return isDevelopment && isLocalhost;
  }
});

const authLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_AUTH_MAX_REQUESTS'] || '5'),
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin operations rate limiter (more permissive for authenticated admin users)
const adminLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_ADMIN_MAX_REQUESTS'] || '500'), // Much higher for admin operations
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const ip = req.ip || req.socket?.remoteAddress || '';
    const isLocalhost = ip === '127.0.0.1' 
      || ip === '::1' 
      || ip === '::ffff:127.0.0.1'
      || ip.includes('localhost')
      || ip.includes('127.0.0.1');
    return isDevelopment && isLocalhost;
  }
});

// Apply rate limiting
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/v1/admin', adminLimiter); // Apply admin-specific rate limit
app.use('/api/v1/schedule-requests', adminLimiter); // Apply admin-specific rate limit for schedule requests

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.use('/health', healthRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/maps', mapsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/schedule-requests', scheduleRequestRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'AgroRedUy API - Agricultural Services Marketplace',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      oauth: '/api/v1/oauth',
      users: '/api/v1/users',
      services: '/api/v1/services',
      bookings: '/api/v1/bookings',
      admin: '/api/v1/admin',
      files: '/api/v1/files',
      search: '/api/v1/search',
      maps: '/api/v1/maps'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 AgroRedUy API server running on port ${PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

export default app;