# Backend Implementation Plan - AgroRedUy

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and configuration
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic API structure
- [ ] Development environment setup

### Phase 2: Core Features (Weeks 3-4)
- [ ] User management system
- [ ] Service management system
- [ ] Geographic services
- [ ] File upload system
- [ ] Basic API endpoints

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Calendar and availability system
- [ ] Booking system
- [ ] Review system
- [ ] Search and filtering
- [ ] Email notifications

### Phase 4: Admin Features (Weeks 7-8)
- [ ] Admin panel API
- [ ] Content management system
- [ ] Analytics and reporting
- [ ] User management (admin)
- [ ] Service management (admin)

### Phase 5: Optimization (Weeks 9-10)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Testing implementation
- [ ] Documentation completion
- [ ] Production deployment

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── service.controller.ts
│   │   ├── booking.controller.ts
│   │   └── admin.controller.ts
│   ├── services/             # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── service.service.ts
│   │   ├── booking.service.ts
│   │   ├── email.service.ts
│   │   └── file.service.ts
│   ├── models/               # Data models
│   │   ├── user.model.ts
│   │   ├── service.model.ts
│   │   ├── booking.model.ts
│   │   └── review.model.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── service.routes.ts
│   │   ├── booking.routes.ts
│   │   └── admin.routes.ts
│   ├── utils/                # Utility functions
│   │   ├── database.ts
│   │   ├── validation.ts
│   │   ├── encryption.ts
│   │   └── helpers.ts
│   ├── types/                # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── service.types.ts
│   │   └── booking.types.ts
│   ├── config/               # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── email.ts
│   └── app.ts                # Express app setup
├── prisma/                   # Database schema
│   ├── schema.prisma
│   └── migrations/
├── tests/                    # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── uploads/                  # File uploads
│   ├── images/
│   └── documents/
├── docs/                     # API documentation
│   └── api.yaml
├── .env                      # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── jest.config.js           # Test configuration
└── README.md                # Project documentation
```

## 🛠️ Technology Stack

### Core Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.0",
    "nodemailer": "^6.9.7",
    "redis": "^4.6.10",
    "ioredis": "^5.3.2",
    "prisma": "^5.7.1",
    "@prisma/client": "^5.7.1",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/compression": "^1.7.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.14",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "prettier": "^3.1.1"
  }
}
```

## 🔧 Configuration Setup

### Environment Variables
```bash
# .env
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/agrored_db"
DATABASE_URL_TEST="postgresql://username:password@localhost:5432/agrored_test_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="30d"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@agrored.uy"
FROM_NAME="AgroRedUy"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
ALLOWED_DOCUMENT_TYPES="application/pdf,application/msword"

# CORS
CORS_ORIGIN="http://localhost:3000"
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# Encryption
ENCRYPTION_KEY="your-encryption-key"

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/app.log"
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## 🗄️ Database Implementation

### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  firstName     String    @map("first_name")
  lastName      String    @map("last_name")
  phone         String?
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true) @map("is_active")
  emailVerified Boolean   @default(false) @map("email_verified")
  profileImageUrl String? @map("profile_image_url")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  lastLoginAt   DateTime? @map("last_login_at")
  
  services      Service[]
  bookings      Booking[]
  reviews       Review[]
  sentMessages  BookingMessage[] @relation("MessageSender")
  
  @@map("users")
}

model Service {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  categoryId  String   @map("category_id")
  title       String
  description String
  pricePerHour Decimal @map("price_per_hour")
  priceMin    Decimal? @map("price_min")
  priceMax    Decimal? @map("price_max")
  latitude    Decimal
  longitude   Decimal
  address     String
  city        String
  department  String
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category       @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  availability Availability[]
  bookings    Booking[]
  images      ServiceImage[]
  reviews     Review[]
  
  @@map("services")
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  iconUrl     String?   @map("icon_url")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  services    Service[]
  
  @@map("categories")
}

model Availability {
  id          String   @id @default(uuid())
  serviceId  String @map("service_id")
  date        DateTime @db.Date
  startTime   String   @map("start_time")
  endTime     String   @map("end_time")
  isAvailable Boolean  @default(true) @map("is_available")
  isBooked    Boolean  @default(false) @map("is_booked")
  bookingId   String?  @map("booking_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  booking     Booking? @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  
  @@unique([serviceId, date, startTime, endTime])
  @@map("availability")
}

model Booking {
  id            String        @id @default(uuid())
  serviceId     String        @map("service_id")
  userId        String        @map("user_id")
  availabilityId String       @map("availability_id")
  status        BookingStatus @default(PENDING)
  totalPrice    Decimal       @map("total_price")
  durationHours Int          @map("duration_hours")
  notes         String?
  contactName   String        @map("contact_name")
  contactEmail  String        @map("contact_email")
  contactPhone  String        @map("contact_phone")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  confirmedAt   DateTime?     @map("confirmed_at")
  cancelledAt   DateTime?     @map("cancelled_at")
  
  service       Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  availability  Availability  @relation(fields: [availabilityId], references: [id], onDelete: Cascade)
  review        Review?
  messages      BookingMessage[]
  
  @@map("bookings")
}

model ServiceImage {
  id        String   @id @default(uuid())
  serviceId String   @map("service_id")
  imageUrl  String   @map("image_url")
  sortOrder Int      @default(0) @map("sort_order")
  isPrimary Boolean  @default(false) @map("is_primary")
  createdAt DateTime @default(now()) @map("created_at")
  
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  @@map("service_images")
}

model Review {
  id        String   @id @default(uuid())
  serviceId String   @map("service_id")
  userId    String   @map("user_id")
  bookingId String   @unique @map("booking_id")
  rating    Int
  comment   String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  
  @@map("reviews")
}

model BookingMessage {
  id        String   @id @default(uuid())
  bookingId String   @map("booking_id")
  senderId  String   @map("sender_id")
  message   String
  createdAt DateTime @default(now()) @map("created_at")
  
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  sender    User     @relation("MessageSender", fields: [senderId], references: [id], onDelete: Cascade)
  
  @@map("booking_messages")
}

enum UserRole {
  USER
  ADMIN
  SUPERADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

## 🔐 Authentication Implementation

### JWT Service
```typescript
// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  async register(userData: RegisterData): Promise<AuthResult> {
    const { email, password, firstName, lastName, phone } = userData;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('User already exists');
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
        phone
      }
    });
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
  
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
  
  private generateAccessToken(user: any): string {
    return jwt.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }
  
  private generateRefreshToken(user: any): string {
    return jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
  }
  
  private sanitizeUser(user: any): any {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
```

### Authentication Middleware
```typescript
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: { message: 'Access token required' } 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Invalid token' } 
      });
    }
    req.user = user as AuthRequest['user'];
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Insufficient permissions' } 
      });
    }
    next();
  };
};
```

## 📁 File Upload System

### Multer Configuration
```typescript
// src/config/upload.ts
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  }
});

// Image processing middleware
export const processImage = async (req: any, res: any, next: any) => {
  if (!req.file) return next();
  
  try {
    const filename = req.file.filename;
    const filepath = path.join('uploads/images/', filename);
    
    // Resize and optimize image
    await sharp(filepath)
      .resize(800, 600, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(filepath.replace(path.extname(filename), '_optimized.jpg'));
    
    req.file.processed = true;
    next();
  } catch (error) {
    next(error);
  }
};
```

## 📧 Email Service

### Email Templates
```typescript
// src/services/email.service.ts
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  async sendWelcomeEmail(user: any): Promise<void> {
    const template = this.getWelcomeTemplate(user);
    
    await this.transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }
  
  async sendBookingConfirmation(booking: any): Promise<void> {
    const template = this.getBookingConfirmationTemplate(booking);
    
    await this.transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: booking.contactEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }
  
  private getWelcomeTemplate(user: any) {
    return {
      subject: 'Bienvenido a AgroRedUy',
      html: `
        <h1>¡Bienvenido a AgroRedUy!</h1>
        <p>Hola ${user.firstName},</p>
        <p>Gracias por registrarte en AgroRedUy. Tu cuenta ha sido creada exitosamente.</p>
        <p>Puedes comenzar a:</p>
        <ul>
          <li>Publicar servicios agrícolas</li>
          <li>Buscar servicios en tu zona</li>
          <li>Conectar con otros agricultores</li>
        </ul>
        <p>¡Bienvenido a la comunidad!</p>
      `,
      text: `Bienvenido a AgroRedUy, ${user.firstName}. Tu cuenta ha sido creada exitosamente.`
    };
  }
  
  private getBookingConfirmationTemplate(booking: any) {
    return {
      subject: 'Confirmación de Reserva - AgroRedUy',
      html: `
        <h1>Reserva Confirmada</h1>
        <p>Hola ${booking.contactName},</p>
        <p>Tu reserva ha sido confirmada exitosamente.</p>
        <h3>Detalles de la Reserva:</h3>
        <ul>
          <li>Servicio: ${booking.service.title}</li>
          <li>Fecha: ${booking.availability.date}</li>
          <li>Hora: ${booking.availability.startTime} - ${booking.availability.endTime}</li>
          <li>Precio Total: $${booking.totalPrice}</li>
        </ul>
        <p>¡Gracias por usar AgroRedUy!</p>
      `,
      text: `Reserva confirmada para ${booking.service.title} el ${booking.availability.date}.`
    };
  }
}
```

## 🧪 Testing Implementation

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
};
```

### Test Setup
```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST
    }
  }
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.bookingMessage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.serviceImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});
```

### Unit Test Example
```typescript
// tests/unit/auth.service.test.ts
import { AuthService } from '../../src/services/auth.service';
import { PrismaClient } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaClient;
  
  beforeEach(() => {
    authService = new AuthService();
    prisma = new PrismaClient();
  });
  
  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+59812345678'
      };
      
      const result = await authService.register(userData);
      
      expect(result.user.email).toBe(userData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
    
    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      // Create user first
      await authService.register(userData);
      
      // Try to create same user again
      await expect(authService.register(userData)).rejects.toThrow('User already exists');
    });
  });
});
```

## 🚀 Production Deployment

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/agrored_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=agrored_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Production Scripts
```json
{
  "scripts": {
    "start": "node dist/app.js",
    "build": "tsc",
    "dev": "nodemon src/app.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

## 📊 Monitoring & Logging

### Winston Logger
```typescript
// src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Health Check
```typescript
// src/routes/health.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
