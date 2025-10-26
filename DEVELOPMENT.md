# 🚀 AgroRedUy Development Guide

This guide provides comprehensive instructions for developing, testing, and deploying the AgroRedUy platform.

## 📋 **Table of Contents**

1. [Development Environment Setup](#development-environment-setup)
2. [Project Architecture](#project-architecture)
3. [Development Workflow](#development-workflow)
4. [Testing Strategy](#testing-strategy)
5. [Deployment Guide](#deployment-guide)
6. [Troubleshooting](#troubleshooting)

## 🛠️ **Development Environment Setup**

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

### VS Code Extensions

Install these recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### Environment Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/agrored-uy.git
cd agrored-uy
```

2. **Backend setup:**
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:migrate
npm run db:seed
```

3. **Frontend setup:**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
```

## 🏗️ **Project Architecture**

### Backend Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Database connection
│   │   └── logger.ts    # Logging configuration
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── notFound.middleware.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── service.routes.ts
│   │   ├── booking.routes.ts
│   │   └── admin.routes.ts
│   ├── services/       # Business logic
│   │   ├── auth.service.ts
│   │   ├── service.service.ts
│   │   ├── booking.service.ts
│   │   └── admin.service.ts
│   └── app.ts           # Main application
├── prisma/              # Database schema
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed
├── tests/               # Test files
└── package.json         # Dependencies
```

### Frontend Architecture

```
frontend/
├── app/                 # Next.js app router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   └── sections/        # Page sections
├── lib/                 # Utility functions
│   ├── utils.ts         # General utilities
│   └── api.ts           # API client
└── public/              # Static assets
```

## 🔄 **Development Workflow**

### 1. Feature Development

1. **Create a feature branch:**
```bash
git checkout -b feature/service-management
```

2. **Make your changes:**
   - Backend: Add routes, services, tests
   - Frontend: Add components, pages, styles

3. **Test your changes:**
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

4. **Commit your changes:**
```bash
git add .
git commit -m "feat: add service management functionality"
```

5. **Push and create PR:**
```bash
git push origin feature/service-management
```

### 2. Code Quality Standards

#### TypeScript
- Use strict mode
- No `any` types
- Proper type definitions
- Interface over type when possible

#### React/Next.js
- Use functional components
- Implement proper error boundaries
- Use React hooks correctly
- Follow Next.js best practices

#### Database
- Use Prisma for all database operations
- No raw SQL queries
- Proper error handling
- Transaction support

#### Testing
- Unit tests for services
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows

### 3. Git Workflow

#### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

#### Commit Messages
Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

## 🧪 **Testing Strategy**

### Backend Testing

#### Unit Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run in watch mode
npm run test:coverage      # Run with coverage
```

#### Test Structure
```
tests/
├── setup.ts              # Test setup
├── auth.test.ts          # Authentication tests
├── service.test.ts       # Service tests
├── booking.test.ts       # Booking tests
└── admin.test.ts         # Admin tests
```

#### Example Test
```typescript
describe('AuthService', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const result = await authService.register(userData);
    expect(result.user.email).toBe(userData.email);
    expect(result.accessToken).toBeDefined();
  });
});
```

### Frontend Testing

#### Component Tests
```bash
cd frontend
npm test                   # Run all tests
npm run test:coverage     # Run with coverage
```

#### Example Test
```typescript
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';

describe('ServiceCard', () => {
  it('renders service information', () => {
    const service = {
      id: '1',
      title: 'Cosecha de Soja',
      description: 'Servicio profesional',
      pricePerHour: 50
    };

    render(<ServiceCard service={service} />);
    expect(screen.getByText('Cosecha de Soja')).toBeInTheDocument();
  });
});
```

## 🚀 **Deployment Guide**

### Development Deployment

1. **Start backend:**
```bash
cd backend
npm run dev
```

2. **Start frontend:**
```bash
cd frontend
npm run dev
```

3. **Access application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production Deployment

#### Backend Deployment

1. **Build the application:**
```bash
cd backend
npm run build
```

2. **Set environment variables:**
```bash
export NODE_ENV=production
export DATABASE_URL=postgresql://...
export JWT_SECRET=your-secret-key
```

3. **Start the server:**
```bash
npm start
```

#### Frontend Deployment

1. **Build the application:**
```bash
cd frontend
npm run build
```

2. **Start the server:**
```bash
npm start
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 **Troubleshooting**

### Common Issues

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_ctl status

# Check database connection
psql -h localhost -U username -d database_name
```

#### 2. Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 PID
```

#### 3. Prisma Issues
```bash
# Reset database
npm run db:reset

# Regenerate Prisma client
npm run db:generate
```

#### 4. Node Modules Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

#### Backend Debug
```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable Prisma debug
DEBUG=prisma:* npm run dev
```

#### Frontend Debug
```bash
# Enable Next.js debug
DEBUG=* npm run dev
```

### Performance Issues

#### Database Optimization
- Add database indexes
- Use connection pooling
- Optimize queries
- Use database caching

#### Frontend Optimization
- Use React.memo for components
- Implement code splitting
- Optimize images
- Use CDN for static assets

## 📚 **Additional Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Mobile responsive
- [ ] Accessibility compliant

---

**Happy coding! 🚀**

For more information, see the [full documentation](_docs/README.md).
