# API Architecture - AgroRedUy

## 🏗️ API Design Principles

### RESTful API Standards
- **Resource-Based URLs**: Clear, intuitive endpoint structure
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **Status Codes**: Standard HTTP status codes for responses
- **JSON Format**: Consistent JSON request/response format
- **Versioning**: API versioning for backward compatibility

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Granular permissions system
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Cross-origin resource sharing setup
- **Security Headers**: Security-focused HTTP headers

## 🔗 API Endpoints Structure

### Base URL
```
Production: https://api.agrored.uy/v1
Development: http://localhost:3001/api/v1
```

### Authentication Endpoints
```
POST   /auth/register          # User registration
POST   /auth/login             # User login
POST   /auth/logout            # User logout
POST   /auth/refresh           # Refresh JWT token
POST   /auth/forgot-password   # Password reset request
POST   /auth/reset-password    # Password reset confirmation
GET    /auth/me                # Get current user profile
PUT    /auth/me                # Update current user profile
```

### User Management Endpoints
```
GET    /users                  # Get all users (admin only)
GET    /users/:id              # Get user by ID
POST   /users                  # Create new user (admin only)
PUT    /users/:id              # Update user
DELETE /users/:id              # Delete user (admin only)
GET    /users/:id/services     # Get user's services
PUT    /users/:id/role          # Update user role (admin only)
```

### Service Management Endpoints
```
GET    /services               # Get all services with filters
GET    /services/:id           # Get service by ID
POST   /services               # Create new service
PUT    /services/:id           # Update service
DELETE /services/:id           # Delete service
GET    /services/search        # Search services
GET    /services/categories    # Get service categories
POST   /services/:id/images    # Upload service images
DELETE /services/:id/images/:imageId  # Delete service image
```

### Geographic Services Endpoints
```
GET    /locations              # Get all locations
GET    /locations/:id          # Get location by ID
POST   /locations              # Create new location (admin only)
PUT    /locations/:id          # Update location (admin only)
DELETE /locations/:id          # Delete location (admin only)
GET    /locations/search       # Search locations by name
GET    /locations/nearby       # Get nearby locations by coordinates
```

### Calendar & Availability Endpoints
```
GET    /services/:id/availability    # Get service availability
POST   /services/:id/availability    # Set service availability
PUT    /services/:id/availability/:dateId  # Update specific date
DELETE /services/:id/availability/:dateId  # Remove specific date
GET    /services/:id/bookings        # Get service bookings
POST   /services/:id/bookings        # Create new booking
PUT    /bookings/:id                  # Update booking
DELETE /bookings/:id                  # Cancel booking
```

### Content Management Endpoints (Admin Only)
```
GET    /content/faq             # Get FAQ content
PUT    /content/faq             # Update FAQ content
GET    /content/terms           # Get terms and conditions
PUT    /content/terms           # Update terms and conditions
GET    /content/privacy          # Get privacy policy
PUT    /content/privacy          # Update privacy policy
GET    /content/contact          # Get contact information
PUT    /content/contact          # Update contact information
```

### File Upload Endpoints
```
POST   /upload/images           # Upload image files
POST   /upload/documents        # Upload document files
DELETE /upload/:fileId          # Delete uploaded file
GET    /upload/:fileId          # Get file information
```

### Analytics Endpoints (Admin Only)
```
GET    /analytics/users         # User analytics
GET    /analytics/services      # Service analytics
GET    /analytics/bookings      # Booking analytics
GET    /analytics/geographic    # Geographic analytics
GET    /analytics/performance    # Platform performance metrics
```

## 📝 Request/Response Formats

### Standard Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-12-01T10:30:00Z",
  "requestId": "req_123456789"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-12-01T10:30:00Z",
  "requestId": "req_123456789"
}
```

### Pagination Format
```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🔐 Authentication Implementation

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user",
  "iat": 1701432000,
  "exp": 1701518400,
  "iss": "agrored.uy"
}
```

### Authentication Middleware
```typescript
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin';
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user as AuthRequest['user'];
    next();
  });
};
```

### Role-Based Authorization
```typescript
const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
app.get('/admin/users', authenticateToken, requireRole(['admin', 'superadmin']), getUsers);
```

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  emailVerified: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

### Service Model
```typescript
interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePerHour: number;
  priceRange?: {
    min: number;
    max: number;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    department: string;
  };
  images: string[];
  provider: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  availability: Availability[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Availability Model
```typescript
interface Availability {
  id: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking Model
```typescript
interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  availabilityId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  duration: number; // in hours
  notes?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
}
```

## 🔍 Search & Filtering

### Service Search Parameters
```typescript
interface ServiceSearchParams {
  query?: string;           // Search term
  category?: string;        // Service category
  location?: {              // Geographic search
    latitude: number;
    longitude: number;
    radius: number;         // in kilometers
  };
  dateRange?: {             // Date filtering
    start: Date;
    end: Date;
  };
  priceRange?: {            // Price filtering
    min: number;
    max: number;
  };
  sortBy?: 'price' | 'distance' | 'rating' | 'date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

### Search Implementation
```typescript
// GET /services/search
const searchServices = async (req: Request, res: Response) => {
  const {
    query,
    category,
    location,
    dateRange,
    priceRange,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = req.query as ServiceSearchParams;

  const whereClause = buildWhereClause({
    query,
    category,
    location,
    dateRange,
    priceRange
  });

  const services = await prisma.service.findMany({
    where: whereClause,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      provider: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      availability: true
    }
  });

  res.json({
    success: true,
    data: {
      services,
      pagination: {
        page,
        limit,
        total: await prisma.service.count({ where: whereClause })
      }
    }
  });
};
```

## 📍 Geographic Services

### Location-Based Search
```typescript
// GET /services/nearby
const getNearbyServices = async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 10 } = req.query;
  
  const services = await prisma.$queryRaw`
    SELECT *,
      (6371 * acos(cos(radians(${latitude})) 
       * cos(radians(latitude)) 
       * cos(radians(longitude) - radians(${longitude})) 
       + sin(radians(${latitude})) 
       * sin(radians(latitude)))) AS distance
    FROM services 
    WHERE (6371 * acos(cos(radians(${latitude})) 
           * cos(radians(latitude)) 
           * cos(radians(longitude) - radians(${longitude})) 
           + sin(radians(${latitude})) 
           * sin(radians(latitude)))) < ${radius}
    ORDER BY distance
  `;

  res.json({
    success: true,
    data: services
  });
};
```

### Map Integration
```typescript
// GET /services/map-data
const getMapData = async (req: Request, res: Response) => {
  const { bounds } = req.query; // { north, south, east, west }
  
  const services = await prisma.service.findMany({
    where: {
      latitude: {
        gte: bounds.south,
        lte: bounds.north
      },
      longitude: {
        gte: bounds.west,
        lte: bounds.east
      }
    },
    select: {
      id: true,
      title: true,
      latitude: true,
      longitude: true,
      pricePerHour: true,
      category: true
    }
  });

  res.json({
    success: true,
    data: services
  });
};
```

## 📧 Email Integration

### Email Templates
```typescript
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const emailTemplates = {
  welcome: {
    subject: 'Bienvenido a AgroRedUy',
    html: '<h1>¡Bienvenido!</h1><p>Gracias por registrarte...</p>',
    text: 'Bienvenido a AgroRedUy...'
  },
  bookingConfirmation: {
    subject: 'Confirmación de Reserva',
    html: '<h1>Reserva Confirmada</h1><p>Tu reserva ha sido confirmada...</p>',
    text: 'Tu reserva ha sido confirmada...'
  },
  passwordReset: {
    subject: 'Restablecer Contraseña',
    html: '<h1>Restablecer Contraseña</h1><p>Haz clic en el enlace...</p>',
    text: 'Para restablecer tu contraseña...'
  }
};
```

### Email Service
```typescript
class EmailService {
  async sendWelcomeEmail(user: User) {
    const template = emailTemplates.welcome;
    await this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendBookingConfirmation(booking: Booking) {
    const template = emailTemplates.bookingConfirmation;
    await this.sendEmail({
      to: booking.contactInfo.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }
}
```

## 🔒 Security Implementation

### Input Validation
```typescript
import { z } from 'zod';

const createServiceSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(1),
  pricePerHour: z.number().positive(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(1),
    city: z.string().min(1),
    department: z.string().min(1)
  })
});

const validateCreateService = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = createServiceSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.errors
      }
    });
  }
};
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts'
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
```

### CORS Configuration
```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://agrored.uy', 'https://www.agrored.uy']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## 📊 API Documentation

### OpenAPI/Swagger Integration
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgroRedUy API',
      version: '1.0.0',
      description: 'Agricultural services marketplace API'
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.agrored.uy/v1',
        description: 'Production server'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### API Testing
```typescript
// Jest test example
describe('Service API', () => {
  test('GET /services should return services list', async () => {
    const response = await request(app)
      .get('/api/v1/services')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('services');
  });

  test('POST /services should create new service', async () => {
    const serviceData = {
      title: 'Test Service',
      description: 'Test description',
      category: 'agriculture',
      pricePerHour: 50,
      location: {
        latitude: -34.9,
        longitude: -56.2,
        address: 'Test Address',
        city: 'Montevideo',
        department: 'Montevideo'
      }
    };

    const response = await request(app)
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${authToken}`)
      .send(serviceData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(serviceData.title);
  });
});
```

## 🚀 Performance Optimization

### Caching Strategy
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const originalSend = res.json;
    res.json = function(data) {
      redis.setex(key, duration, JSON.stringify(data));
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Usage
app.get('/services', cacheMiddleware(300), getServices); // 5 minutes cache
```

### Database Optimization
```typescript
// Indexes for performance
const createIndexes = async () => {
  await prisma.$executeRaw`
    CREATE INDEX idx_services_location ON services USING GIST (
      ST_Point(longitude, latitude)
    );
  `;
  
  await prisma.$executeRaw`
    CREATE INDEX idx_services_category ON services(category);
  `;
  
  await prisma.$executeRaw`
    CREATE INDEX idx_services_price ON services(price_per_hour);
  `;
};
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
