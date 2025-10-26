# Deployment Guide - AgroRedUy

## 🚀 Production Deployment Strategy

### Overview
This guide covers the complete deployment process for AgroRedUy, including both frontend and backend deployment, database setup, monitoring, and maintenance procedures.

## 🏗️ Infrastructure Architecture

### Production Stack
- **Frontend**: Next.js 14 on Vercel
- **Backend**: Node.js/Express on Railway/Heroku
- **Database**: PostgreSQL on Railway/Supabase
- **Redis**: Redis Cloud
- **File Storage**: AWS S3/Cloudinary
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + Vercel Analytics
- **Email**: SendGrid/Mailgun

### Environment Setup
```
Production Environment:
├── Frontend (Vercel)
│   ├── Domain: https://agrored.uy
│   ├── CDN: Global edge network
│   └── Analytics: Vercel Analytics
├── Backend (Railway)
│   ├── API: https://api.agrored.uy
│   ├── Database: PostgreSQL
│   └── Redis: Redis Cloud
├── File Storage (AWS S3)
│   ├── Images: s3://agrored-images
│   └── Documents: s3://agrored-documents
└── Monitoring
    ├── Sentry: Error tracking
    ├── Uptime: UptimeRobot
    └── Logs: Railway logs
```

## 🎯 Frontend Deployment (Vercel)

### Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.agrored.uy/v1",
    "NEXT_PUBLIC_APP_URL": "https://agrored.uy",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY": "@google-maps-api-key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": false
    }
  ]
}
```

### Environment Variables
```bash
# Vercel Environment Variables
NEXT_PUBLIC_API_URL=https://api.agrored.uy/v1
NEXT_PUBLIC_APP_URL=https://agrored.uy
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Deployment Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_APP_URL
```

## 🖥️ Backend Deployment (Railway)

### Railway Configuration
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### Environment Variables
```bash
# Railway Environment Variables
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/agrored_db
REDIS_URL=redis://user:pass@host:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@agrored.uy
FROM_NAME=AgroRedUy
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://agrored.uy
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=your-encryption-key
LOG_LEVEL=info
```

### Deployment Commands
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to project
railway link

# Deploy to production
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your-database-url
```

## 🗄️ Database Deployment

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE agrored_db;

-- Create user
CREATE USER agrored_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE agrored_db TO agrored_user;

-- Connect to database
\c agrored_db;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO agrored_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO agrored_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO agrored_user;
```

### Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed
```

### Database Backup Strategy
```bash
#!/bin/bash
# backup-database.sh

# Set variables
DB_NAME="agrored_db"
DB_USER="agrored_user"
DB_HOST="your-db-host"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://agrored-backups/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

## 📁 File Storage (AWS S3)

### S3 Bucket Configuration
```json
// s3-bucket-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::agrored-images/*"
    },
    {
      "Sid": "RestrictUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/agrored-app"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::agrored-images/*"
    }
  ]
}
```

### AWS Configuration
```typescript
// config/aws.ts
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

export const s3 = new AWS.S3({
  params: {
    Bucket: process.env.AWS_S3_BUCKET || 'agrored-images'
  }
});

export const uploadToS3 = async (file: Buffer, key: string, contentType: string) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read'
  };

  return s3.upload(params).promise();
};
```

## 📧 Email Service (SendGrid)

### SendGrid Configuration
```typescript
// services/email.service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  async sendWelcomeEmail(user: any): Promise<void> {
    const msg = {
      to: user.email,
      from: {
        email: process.env.FROM_EMAIL!,
        name: process.env.FROM_NAME!
      },
      templateId: 'd-welcome-template-id',
      dynamicTemplateData: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    };

    await sgMail.send(msg);
  }

  async sendBookingConfirmation(booking: any): Promise<void> {
    const msg = {
      to: booking.contactEmail,
      from: {
        email: process.env.FROM_EMAIL!,
        name: process.env.FROM_NAME!
      },
      templateId: 'd-booking-confirmation-template-id',
      dynamicTemplateData: {
        contactName: booking.contactName,
        serviceTitle: booking.service.title,
        bookingDate: booking.availability.date,
        totalPrice: booking.totalPrice
      }
    };

    await sgMail.send(msg);
  }
}
```

## 📊 Monitoring & Analytics

### Sentry Configuration
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

### Vercel Analytics
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
};
```

### Health Check Endpoints
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
```

## 🔒 Security Configuration

### SSL/TLS Setup
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name agrored.uy www.agrored.uy;
    
    ssl_certificate /etc/ssl/certs/agrored.uy.crt;
    ssl_certificate_key /etc/ssl/private/agrored.uy.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### CORS Configuration
```typescript
// backend/src/config/cors.ts
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://agrored.uy', 'https://www.agrored.uy']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export default cors(corsOptions);
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

## 📈 Performance Optimization

### CDN Configuration
```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['agrored-images.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
```

### Caching Strategy
```typescript
// lib/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  }
};
```

## 🔄 Backup & Recovery

### Automated Backups
```bash
#!/bin/bash
# automated-backup.sh

# Database backup
pg_dump $DATABASE_URL | gzip > /backups/db_$(date +%Y%m%d_%H%M%S).sql.gz

# File backup
aws s3 sync s3://agrored-images /backups/images/

# Upload to S3
aws s3 sync /backups/ s3://agrored-backups/

# Clean old backups
find /backups -name "*.sql.gz" -mtime +7 -delete
```

### Recovery Procedures
```bash
#!/bin/bash
# recovery.sh

# Restore database
gunzip -c /backups/db_20241201_120000.sql.gz | psql $DATABASE_URL

# Restore files
aws s3 sync s3://agrored-backups/images/ s3://agrored-images/

# Restart services
railway restart
```

## 📊 Monitoring Dashboard

### Key Metrics
- **Uptime**: 99.9% target
- **Response Time**: < 200ms API, < 2s frontend
- **Error Rate**: < 0.1%
- **Database Performance**: Query time < 100ms
- **File Upload**: Success rate > 99%

### Alerting Rules
```yaml
# monitoring/alerts.yml
alerts:
  - name: High Error Rate
    condition: error_rate > 0.05
    duration: 5m
    action: email,slack
    
  - name: Database Slow Queries
    condition: avg_query_time > 1000ms
    duration: 2m
    action: email
    
  - name: High Memory Usage
    condition: memory_usage > 80%
    duration: 5m
    action: email,slack
```

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Monitoring setup
- [ ] Backup procedures tested

### Launch Day
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run database migrations
- [ ] Verify all services
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Check user feedback
- [ ] Verify analytics
- [ ] Performance optimization
- [ ] Security review
- [ ] Documentation update

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
