# AgroRedUy Backend API

Agricultural Services Marketplace Backend API built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Environment setup:**
```bash
cp env.example .env
# Edit .env with your database credentials
```

3. **Database setup:**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

4. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+59899123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Service Endpoints

#### Get All Services
```http
GET /services
```

#### Get Service by ID
```http
GET /services/:id
```

#### Create Service (Authenticated)
```http
POST /services
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "title": "Cosecha de Soja",
  "description": "Servicio profesional de cosecha",
  "pricePerHour": 50,
  "latitude": -34.9,
  "longitude": -56.2,
  "address": "Ruta 5, km 45",
  "city": "Montevideo",
  "department": "Montevideo",
  "categoryId": "category-id"
}
```

### Booking Endpoints

#### Get User Bookings
```http
GET /bookings
Authorization: Bearer your-access-token
```

#### Create Booking
```http
POST /bookings
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "serviceId": "service-id",
  "availabilityId": "availability-id",
  "durationHours": 8,
  "notes": "Additional notes",
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "+59899123456"
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── app.ts           # Main application
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed
├── tests/               # Test files
├── uploads/             # File uploads
└── logs/                # Application logs
```

## 🗄️ Database Schema

### Core Models

- **User**: Users (farmers, contractors, admins)
- **Category**: Service categories (cosecha, siembra, etc.)
- **Service**: Agricultural services
- **Booking**: Service bookings
- **Review**: Service reviews
- **Availability**: Service availability slots

### Key Features

- **Geographic Services**: PostGIS integration for location-based queries
- **User Roles**: USER, ADMIN, SUPERADMIN
- **Booking System**: Time-slot based bookings
- **Review System**: Rating and feedback
- **File Uploads**: Service images and documents

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers

## 📊 Monitoring

### Health Checks

```http
GET /health              # Basic health check
GET /health/detailed     # Detailed system status
```

### Logging

- **Winston**: Structured logging
- **Log Levels**: error, warn, info, debug
- **Log Files**: Combined and error logs
- **Request Logging**: Morgan HTTP logger

## 🚀 Deployment

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Optional
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Production Checklist

- [ ] Set secure JWT secrets
- [ ] Configure production database
- [ ] Set up Redis for caching
- [ ] Configure email service
- [ ] Set up file storage (AWS S3)
- [ ] Configure monitoring
- [ ] Set up backup strategy

## 🧪 Testing

### Test Structure

```bash
tests/
├── setup.ts           # Test setup and teardown
├── auth.test.ts       # Authentication tests
├── services.test.ts   # Service tests
└── bookings.test.ts   # Booking tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.ts
```

## 📈 Performance

### Optimization Features

- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip compression
- **Caching**: Redis caching (optional)
- **Rate Limiting**: API protection

### Monitoring

- **Health Checks**: System status monitoring
- **Logging**: Comprehensive logging
- **Error Tracking**: Error monitoring
- **Performance Metrics**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:

- **Email**: dev@agrored.uy
- **Documentation**: [API Docs](http://localhost:3001/api-docs)
- **Issues**: GitHub Issues

---

**AgroRedUy Backend API** - Connecting Uruguay's agricultural community 🌾
