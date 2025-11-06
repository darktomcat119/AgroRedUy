# AgroRedUy - Agricultural Services Platform

Platform connecting agricultural producers with specialized contractors in Uruguay.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- MySQL database

### Installation

1. **Clone and Install**
```bash
npm install
```
This will automatically install dependencies for both backend and frontend.

2. **Configure Environment Variables**

**Backend** (`backend/.env`):
```env
DATABASE_URL="mysql://user:password@localhost:3306/agrored_db"
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secure_random_string_minimum_32_characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

3. **Setup Database**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. **Build Project**
```bash
npm run build
```

5. **Start Application**
```bash
npm start
```

The application will start:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

## 📜 Available Scripts

### Development
- `npm run dev` - Run both backend and frontend in development mode
- `npm run dev:backend` - Run only backend in development mode
- `npm run dev:frontend` - Run only frontend in development mode

### Production
- `npm start` - Start both backend and frontend in production mode
- `npm run start:backend` - Start only backend
- `npm run start:frontend` - Start only frontend

### Build
- `npm run build` - Build both backend and frontend
- `npm run build:backend` - Build only backend
- `npm run build:frontend` - Build only frontend

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data

### Setup
- `npm run install:all` - Install all dependencies
- `npm run setup` - Complete setup (install + generate + build)

## 🏗️ Project Structure

```
agrored-uy/
├── backend/              # Express.js + Prisma backend
│   ├── dist/            # Compiled TypeScript
│   ├── prisma/          # Database schema and migrations
│   ├── src/             # Source code
│   ├── uploads/         # File uploads
│   └── package.json
├── frontend/            # Next.js frontend
│   ├── .next/          # Built application
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   ├── public/         # Static assets
│   └── package.json
├── DEPLOYMENT_GUIDE.md  # Deployment instructions
├── DEPLOYMENT_CHECKLIST.md
├── package.json         # Root package.json
└── README.md           # This file
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT + OAuth (Google, Facebook)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Forms**: React Hook Form
- **State**: React Context
- **Maps**: Leaflet
- **Icons**: Lucide React

## 📋 Features

- ✅ User authentication (email/password + OAuth)
- ✅ Role-based access control (User, Contractor, Admin, SuperAdmin)
- ✅ Service listing and search
- ✅ Schedule request system
- ✅ Booking management
- ✅ Real-time notifications
- ✅ Admin panel
- ✅ File upload (images, avatars)
- ✅ Email notifications
- ✅ Reviews and ratings
- ✅ Map integration
- ✅ Responsive design

## 👥 Default Users (After Seeding)

**SuperAdmin**
- Email: `admin@agrored.uy`
- Password: `Admin123!`

(Change these credentials immediately in production!)

## 🔒 Security

- HTTPS recommended for production
- Environment variables for sensitive data
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- SQL injection prevention (Prisma)
- XSS protection (Helmet)
- CSRF protection

## 🌐 Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions for cPanel and other hosting platforms.

### Quick Deployment Steps

1. Build the project: `npm run build`
2. Upload files to server
3. Set environment variables
4. Run migrations: `npm run prisma:migrate`
5. Start application: `npm start`

## 📝 Environment Variables

### Required Backend Variables
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed frontend origin

### Required Frontend Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_BASE_URL` - Frontend URL

### Optional Variables
- SMTP configuration for emails
- OAuth credentials (Google, Facebook)
- Rate limiting settings
- File upload settings

## 🐛 Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct
- Ensure MySQL is running
- Run `npm run prisma:generate`
- Check logs in `backend/logs/`

### Frontend won't start
- Check `NEXT_PUBLIC_API_URL` points to backend
- Clear `.next` folder and rebuild
- Ensure backend is running first

### Database errors
- Run `npm run prisma:migrate`
- Check database credentials
- Ensure database exists

## 📚 API Documentation

The backend API is available at `http://localhost:3001/api/v1`

### Main Endpoints
- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /services` - List services
- `GET /categories` - List categories
- `POST /schedule-requests` - Create schedule request

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - See LICENSE file for details

## 📞 Support

For issues and questions:
- Email: soporte@agrored.uy
- Documentation: See `DEPLOYMENT_GUIDE.md`

---

**Built with ❤️ for the Uruguayan agricultural community**

