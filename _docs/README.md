# AgroRedUy - Development Documentation

## 📋 Overview

This documentation provides comprehensive guidance for developing AgroRedUy, an agricultural services marketplace platform similar to Airbnb but focused on agricultural services in Uruguay.

## 🎯 Project Vision

**AgroRedUy** is a digital platform that connects agricultural service providers (farmers, contractors, agricultural professionals) with service seekers (landowners, farmers needing services) in Uruguay. The platform enables:

- **Service Discovery**: Browse agricultural services by location, type, and availability
- **Geographic Matching**: Location-based service discovery with map integration
- **Direct Communication**: Secure contact between providers and seekers
- **Service Management**: Complete lifecycle management of agricultural services
- **Admin Control**: Comprehensive backend management for platform administrators

## 📚 Documentation Structure

### Core Documentation
- **[Development Principles](./development-principles.md)** - Core development guidelines and standards
- **[UI/UX Design System](./ui-design-system.md)** - Complete design system and component library
- **[API Architecture](./api-architecture.md)** - Backend API design and endpoints
- **[Database Design](./database-design.md)** - Database schema and relationships

### Implementation Guides
- **[Backend Implementation](./backend-implementation.md)** - Backend development roadmap
- **[Frontend Implementation](./frontend-implementation.md)** - Frontend development guidelines
- **[Deployment Guide](./deployment-guide.md)** - Production deployment instructions

### Technical References
- **[Component Library](./component-library.md)** - Reusable UI components
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Database Schema](./database-schema.md)** - Detailed database structure

## 🏗️ Current Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query for server state
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### Backend (To Be Implemented)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based sessions
- **File Storage**: Local/Cloud storage for images
- **Maps**: Integration with mapping services
- **Email**: Nodemailer for notifications

## 🎨 Design System

### Brand Colors
- **Primary Green**: `#2d8341` (verdeprimario-100)
- **Secondary Green**: `#60a646` (verdesecundario-100)
- **Orange**: `#f67f2d` (naranja-100)
- **Light Gray**: `#f2f2f2` (grisprimario-100)
- **White**: `#ffffff` (blanco-100)

### Typography
- **Headings**: Barlow (Bold, Bold Italic)
- **Body Text**: Raleway (Regular, Medium, Bold)

## 🚀 Key Features

### User Features
1. **Service Discovery**: Browse services by location, type, and date
2. **User Registration**: Secure user accounts with role-based access
3. **Service Management**: Create, edit, and manage agricultural services
4. **Geographic Services**: Location-based service discovery
5. **Calendar Integration**: Availability management
6. **Direct Communication**: Secure messaging between users
7. **Admin Panel**: Comprehensive platform management

### Admin Features
1. **User Management**: View, edit, and delete user accounts
2. **Service Management**: Approve, edit, and manage services
3. **Content Management**: Edit FAQs, Terms, Privacy Policy, Contact
4. **Analytics**: Platform usage and performance metrics
5. **Geographic Management**: Location and zone management

## 📱 Current Pages

### Public Pages
- **Home** (`/`) - Landing page with hero section
- **Services** (`/servicios`) - Service search and discovery
- **Services List** (`/servicios/lista`) - Service listings
- **Contact** (`/contacto`) - Contact form and information

### Authentication Pages
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration

### Admin Pages (To Be Implemented)
- **Admin Dashboard** (`/admin`) - Admin overview
- **User Management** (`/admin/users`) - User administration
- **Service Management** (`/admin/services`) - Service administration
- **Content Management** (`/admin/content`) - Content editing

## 🛠️ Development Workflow

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git for version control

### Getting Started
1. **Clone Repository**: `git clone <repository-url>`
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Configure environment variables
4. **Database Setup**: Run database migrations
5. **Start Development**: `npm run dev`

### Development Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Testing**: Unit and integration tests
- **Documentation**: Comprehensive code documentation

## 📈 Roadmap

### Phase 1: Backend Foundation
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic API endpoints
- [ ] File upload system

### Phase 2: Core Features
- [ ] Service management
- [ ] User management
- [ ] Geographic services
- [ ] Calendar integration

### Phase 3: Advanced Features
- [ ] Admin panel
- [ ] Content management
- [ ] Analytics dashboard
- [ ] Email notifications

### Phase 4: Optimization
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Mobile optimization
- [ ] Production deployment

## 🤝 Contributing

### Development Guidelines
1. Follow the established design system
2. Maintain TypeScript strict mode
3. Write comprehensive tests
4. Document all new features
5. Follow the established code style

### Code Review Process
1. All changes require code review
2. Tests must pass before merging
3. Documentation must be updated
4. Security implications must be considered

## 📞 Support

For questions or issues:
- **Technical Issues**: Create GitHub issues
- **Design Questions**: Refer to design system documentation
- **API Questions**: Check API documentation
- **Database Questions**: Review database schema

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
