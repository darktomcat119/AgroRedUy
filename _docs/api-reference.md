# API Reference - AgroRedUy

## 🔗 Base URL
```
Production: https://api.agrored.uy/v1
Development: http://localhost:3001/api/v1
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 📚 API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+59899123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2024-12-01T10:30:00Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Authenticate user and return tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "Login successful"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

#### POST /auth/logout
Logout user and invalidate tokens.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### User Management Endpoints

#### GET /users
Get all users (admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "isActive": true,
        "createdAt": "2024-12-01T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /users/:id
Get user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+59899123456",
    "role": "user",
    "isActive": true,
    "emailVerified": true,
    "profileImageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-12-01T10:30:00Z",
    "lastLoginAt": "2024-12-01T15:30:00Z"
  }
}
```

#### PUT /users/:id
Update user information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+59899123456",
  "profileImageUrl": "https://example.com/image.jpg"
}
```

#### DELETE /users/:id
Delete user (admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Service Management Endpoints

#### GET /services
Get all services with optional filtering.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `location` (optional): Filter by location (city or department)
- `priceMin` (optional): Minimum price
- `priceMax` (optional): Maximum price
- `date` (optional): Filter by availability date
- `latitude` (optional): Center latitude for geographic search
- `longitude` (optional): Center longitude for geographic search
- `radius` (optional): Search radius in kilometers
- `sortBy` (optional): Sort by 'price', 'distance', 'rating', 'date'
- `sortOrder` (optional): 'asc' or 'desc'

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "title": "Cosecha de Soja",
        "description": "Servicio profesional de cosecha",
        "category": "Cosecha",
        "pricePerHour": 50,
        "priceRange": {
          "min": 40,
          "max": 60
        },
        "location": {
          "latitude": -34.9,
          "longitude": -56.2,
          "address": "Ruta 5, km 45",
          "city": "Montevideo",
          "department": "Montevideo"
        },
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "provider": {
          "id": "uuid",
          "name": "Juan Pérez",
          "email": "juan@example.com"
        },
        "rating": 4.5,
        "reviewCount": 12,
        "isActive": true,
        "createdAt": "2024-12-01T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### GET /services/:id
Get service by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Cosecha de Soja",
    "description": "Servicio profesional de cosecha de soja con maquinaria moderna",
    "category": "Cosecha",
    "pricePerHour": 50,
    "priceRange": {
      "min": 40,
      "max": 60
    },
    "location": {
      "latitude": -34.9,
      "longitude": -56.2,
      "address": "Ruta 5, km 45",
      "city": "Montevideo",
      "department": "Montevideo"
    },
    "images": [
      {
        "id": "uuid",
        "url": "https://example.com/image1.jpg",
        "isPrimary": true
      }
    ],
    "provider": {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+59899123456",
      "rating": 4.5
    },
    "availability": [
      {
        "id": "uuid",
        "date": "2024-12-15",
        "startTime": "08:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ],
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Excelente servicio",
        "user": {
          "name": "María García"
        },
        "createdAt": "2024-12-01T10:30:00Z"
      }
    ],
    "isActive": true,
    "createdAt": "2024-12-01T10:30:00Z"
  }
}
```

#### POST /services
Create new service.

**Request Body:**
```json
{
  "title": "Cosecha de Soja",
  "description": "Servicio profesional de cosecha",
  "category": "Cosecha",
  "pricePerHour": 50,
  "priceRange": {
    "min": 40,
    "max": 60
  },
  "location": {
    "latitude": -34.9,
    "longitude": -56.2,
    "address": "Ruta 5, km 45",
    "city": "Montevideo",
    "department": "Montevideo"
  }
}
```

#### PUT /services/:id
Update service.

**Request Body:**
```json
{
  "title": "Cosecha de Soja Actualizada",
  "description": "Servicio profesional de cosecha con nueva maquinaria",
  "pricePerHour": 55
}
```

#### DELETE /services/:id
Delete service.

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

### Booking Management Endpoints

#### GET /bookings
Get user's bookings.

**Query Parameters:**
- `status` (optional): Filter by booking status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "service": {
          "id": "uuid",
          "title": "Cosecha de Soja",
          "provider": {
            "name": "Juan Pérez"
          }
        },
        "status": "confirmed",
        "totalPrice": 400,
        "durationHours": 8,
        "date": "2024-12-15",
        "startTime": "08:00",
        "endTime": "17:00",
        "contactInfo": {
          "name": "María García",
          "email": "maria@example.com",
          "phone": "+59899123456"
        },
        "createdAt": "2024-12-01T10:30:00Z"
      }
    ]
  }
}
```

#### POST /bookings
Create new booking.

**Request Body:**
```json
{
  "serviceId": "uuid",
  "availabilityId": "uuid",
  "contactInfo": {
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+59899123456"
  },
  "notes": "Servicio para finca de 50 hectáreas"
}
```

#### PUT /bookings/:id
Update booking status.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

#### DELETE /bookings/:id
Cancel booking.

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### Geographic Services Endpoints

#### GET /services/nearby
Get services near a location.

**Query Parameters:**
- `latitude`: Center latitude
- `longitude`: Center longitude
- `radius`: Search radius in kilometers (default: 10)
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "title": "Cosecha de Soja",
        "location": {
          "latitude": -34.9,
          "longitude": -56.2,
          "city": "Montevideo"
        },
        "distance": 2.5,
        "pricePerHour": 50
      }
    ]
  }
}
```

#### GET /services/map-data
Get services for map display.

**Query Parameters:**
- `bounds`: Map bounds (north, south, east, west)

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "title": "Cosecha de Soja",
        "latitude": -34.9,
        "longitude": -56.2,
        "pricePerHour": 50,
        "category": "Cosecha"
      }
    ]
  }
}
```

### Content Management Endpoints (Admin Only)

#### GET /content/faq
Get FAQ content.

**Response:**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": "uuid",
        "question": "¿Cómo funciona AgroRedUy?",
        "answer": "AgroRedUy es una plataforma que conecta...",
        "sortOrder": 1,
        "isActive": true
      }
    ]
  }
}
```

#### PUT /content/faq
Update FAQ content.

**Request Body:**
```json
{
  "faqs": [
    {
      "id": "uuid",
      "question": "¿Cómo funciona AgroRedUy?",
      "answer": "AgroRedUy es una plataforma que conecta productores y contratistas...",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

#### GET /content/terms
Get terms and conditions.

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Términos y Condiciones",
    "content": "Contenido de términos y condiciones...",
    "version": "1.0",
    "lastUpdated": "2024-12-01T10:30:00Z"
  }
}
```

#### PUT /content/terms
Update terms and conditions.

**Request Body:**
```json
{
  "title": "Términos y Condiciones",
  "content": "Nuevo contenido de términos y condiciones...",
  "version": "1.1"
}
```

### File Upload Endpoints

#### POST /upload/images
Upload image files.

**Request:** Multipart form data
- `file`: Image file
- `serviceId` (optional): Associate with service

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://example.com/uploaded-image.jpg",
    "filename": "image.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

#### DELETE /upload/:fileId
Delete uploaded file.

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Analytics Endpoints (Admin Only)

#### GET /analytics/users
Get user analytics.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y)
- `startDate`: Start date
- `endDate`: End date

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "newUsers": 45,
    "activeUsers": 890,
    "userGrowth": 12.5,
    "userRetention": 78.3,
    "topLocations": [
      {
        "location": "Montevideo",
        "userCount": 450
      }
    ]
  }
}
```

#### GET /analytics/services
Get service analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalServices": 320,
    "activeServices": 280,
    "newServices": 15,
    "topCategories": [
      {
        "category": "Cosecha",
        "count": 120
      }
    ],
    "averagePrice": 45.5,
    "priceRange": {
      "min": 20,
      "max": 100
    }
  }
}
```

#### GET /analytics/bookings
Get booking analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 890,
    "confirmedBookings": 750,
    "cancelledBookings": 50,
    "completedBookings": 700,
    "averageBookingValue": 350,
    "bookingTrends": [
      {
        "date": "2024-12-01",
        "bookings": 25
      }
    ]
  }
}
```

## 📊 Response Formats

### Success Response
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

### Error Response
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

### Pagination Response
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

## 🔒 Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Code Reference
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_REQUIRED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Internal server error

## 🔄 Rate Limiting

### Rate Limits
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 10 requests per hour
- **Search**: 50 requests per 15 minutes

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 Request Examples

### cURL Examples

#### Register User
```bash
curl -X POST https://api.agrored.uy/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+59899123456"
  }'
```

#### Get Services
```bash
curl -X GET "https://api.agrored.uy/v1/services?category=Cosecha&location=Montevideo" \
  -H "Authorization: Bearer your_access_token"
```

#### Create Booking
```bash
curl -X POST https://api.agrored.uy/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token" \
  -d '{
    "serviceId": "uuid",
    "availabilityId": "uuid",
    "contactInfo": {
      "name": "María García",
      "email": "maria@example.com",
      "phone": "+59899123456"
    }
  }'
```

### JavaScript Examples

#### Using Fetch API
```javascript
// Get services
const response = await fetch('https://api.agrored.uy/v1/services', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

#### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.agrored.uy/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get services
const services = await api.get('/services');
```

## 🔧 SDK Examples

### TypeScript SDK
```typescript
class AgroRedAPI {
  private baseURL: string;
  private accessToken?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async getServices(filters?: ServiceFilters): Promise<Service[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(`${this.baseURL}/services?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data.data.services;
  }

  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const response = await fetch(`${this.baseURL}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();
    return data.data;
  }
}

// Usage
const api = new AgroRedAPI('https://api.agrored.uy/v1');
api.setAccessToken('your_access_token');

const services = await api.getServices({ category: 'Cosecha' });
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
