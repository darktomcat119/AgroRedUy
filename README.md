# 🌾 AgroRedUy - Agricultural Services Marketplace

**AgroRedUy** is a comprehensive agricultural services marketplace platform that connects service providers with service seekers in Uruguay. Built with modern web technologies, it provides a seamless experience for discovering, booking, and managing agricultural services.

## 🚀 **Quick Start**

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/agrored-uy.git
cd agrored-uy
```

2. **Backend Setup:**
```bash
cd backend
# Windows
setup.bat
# Linux/Mac
chmod +x setup.sh && ./setup.sh
```

3. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 📁 **Project Structure**

```
agrored-uy/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.ts          # Main application
│   ├── prisma/             # Database schema and migrations
│   ├── tests/              # Test files
│   └── setup.bat/setup.sh  # Setup scripts
├── frontend/               # Next.js React application
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   └── public/             # Static assets
├── _docs/                  # Comprehensive documentation
└── README.md               # This file
```

## 🛠️ **Technology Stack**

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **Jest** - Testing framework

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### Database
- **PostgreSQL** - Primary database
- **PostGIS** - Geographic extensions
- **Redis** - Caching (optional)

## 🌟 **Key Features**

### 🏠 **Core Functionality**
- **User Management** - Registration, authentication, profiles
- **Service Management** - Create, edit, delete agricultural services
- **Geographic Search** - Location-based service discovery
- **Booking System** - Time-slot based bookings
- **Review System** - Rating and feedback
- **Admin Dashboard** - User and service management

### 🗺️ **Geographic Features**
- **Interactive Maps** - Service location visualization
- **Radius Search** - Find services within distance
- **Location Services** - Coordinate-based discovery
- **Zone-based Services** - Services organized by geographic areas

### 📱 **Mobile-First Design**
- **Responsive Layout** - Works on all devices
- **Touch-Friendly** - Optimized for mobile use
- **Offline Capabilities** - Critical functions work offline
- **Fast Loading** - Optimized for slow connections

### 🔒 **Security & Privacy**
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - API protection
- **Input Validation** - Request validation
- **CORS** - Cross-origin resource sharing

## 📚 **API Documentation**

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
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
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Service Endpoints

#### Get All Services
```http
GET /api/v1/services?categoryId=uuid&city=Montevideo&page=1&limit=20
```

#### Create Service
```http
POST /api/v1/services
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

#### Create Booking
```http
POST /api/v1/bookings
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "serviceId": "service-id",
  "availabilityId": "availability-id",
  "durationHours": 8,
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "+59899123456"
}
```

## 🗄️ **Database Schema**

### Core Models
- **User** - Users (farmers, contractors, admins)
- **Category** - Service categories (cosecha, siembra, etc.)
- **Service** - Agricultural services
- **Booking** - Service bookings
- **Review** - Service reviews
- **Availability** - Service availability slots

### Key Features
- **Geographic Services** - PostGIS integration for location-based queries
- **User Roles** - USER, ADMIN, SUPERADMIN
- **Booking System** - Time-slot based bookings
- **Review System** - Rating and feedback
- **File Uploads** - Service images and documents

## 🧪 **Testing**

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:coverage    # Run with coverage
npm run test:watch       # Run in watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                 # Run all tests
npm run test:coverage    # Run with coverage
```

## 🚀 **Deployment**

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/agrored_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_MAP_API_KEY=your-map-api-key
```

### Production Checklist
- [ ] Set secure JWT secrets
- [ ] Configure production database
- [ ] Set up Redis for caching
- [ ] Configure email service
- [ ] Set up file storage (AWS S3)
- [ ] Configure monitoring
- [ ] Set up backup strategy

## 📊 **Monitoring & Analytics**

### Health Checks
```http
GET /health              # Basic health check
GET /health/detailed     # Detailed system status
```

### Logging
- **Winston** - Structured logging
- **Log Levels** - error, warn, info, debug
- **Log Files** - Combined and error logs
- **Request Logging** - Morgan HTTP logger

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write comprehensive tests
- Use conventional commit messages
- Ensure mobile responsiveness
- Follow accessibility guidelines

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:

- **Email**: dev@agrored.uy
- **Documentation**: [Full Documentation](_docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/agrored-uy/issues)

## 🌟 **Acknowledgments**

- **Uruguay's Agricultural Community** - For inspiration and requirements
- **Open Source Contributors** - For the amazing tools and libraries
- **Development Team** - For their dedication and hard work

---

**AgroRedUy** - Connecting Uruguay's agricultural community 🌾

*Built with ❤️ for the agricultural community of Uruguay*
