# Frontend Implementation Guide - AgroRedUy

## 🎯 Frontend Architecture

### Current Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Maps**: Pigeon Maps integration

### Project Structure
```
frontend/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── contacto/            # Contact page
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── servicios/           # Services pages
│   │   ├── page.tsx         # Services search
│   │   └── lista/           # Services list
│   │       └── page.tsx
│   └── admin/               # Admin pages (to be implemented)
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── textarea.tsx
│   │   └── select.tsx
│   └── sections/            # Page sections
│       ├── Navigation.tsx
│       ├── MobileMenu.tsx
│       ├── ServiceSearchSection.tsx
│       ├── ServiceDetailsSection.tsx
│       ├── CalendarSection.tsx
│       ├── ImageGallerySection.tsx
│       ├── LocationBadgesSection.tsx
│       └── NavigationMenuSection.tsx
├── lib/                     # Utility functions
│   └── utils.ts
├── public/                  # Static assets
│   └── figmaAssets/        # Design assets
├── types/                   # TypeScript types
├── hooks/                   # Custom React hooks
├── services/               # API services
├── store/                   # State management
└── config/                 # Configuration files
```

## 🎨 Design System Implementation

### Color System
```typescript
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        // AgroRedUy Brand Colors
        "verdeprimario-100": "var(--verdeprimario-100)",     // #2d8341
        "verdeprimario-60": "var(--verdeprimario-60)",       // #2d8341 with 60% opacity
        "verdesecundario-100": "var(--verdesecundario-100)", // #60a646
        "naranja-100": "var(--naranja-100)",                 // #f67f2d
        "naranja-50": "var(--naranja-50)",                   // #f67f2d with 50% opacity
        "blanco-100": "var(--blanco-100)",                   // #ffffff
        "grisprimario-100": "var(--grisprimario-100)",       // #f2f2f2
        "grisprimario-10": "var(--grisprimario-10)",         // #f2f2f2 with 10% opacity
        "grissecundario-100": "var(--grissecundario-100)",   // #c8c8c8
        "negro-100": "var(--negro-100)",                     // #000000
      }
    }
  }
};
```

### Typography System
```css
/* globals.css */
:root {
  /* Barlow Fonts - Headings */
  --barlow-bold-64pt-font-family: "Barlow", Helvetica;
  --barlow-bold-64pt-font-size: 64px;
  --barlow-bold-64pt-font-weight: 700;
  
  --barlow-bold-italic-96pt-font-family: "Barlow", Helvetica;
  --barlow-bold-italic-96pt-font-style: italic;
  --barlow-bold-italic-96pt-font-weight: 700;
  
  --barlow-medium-20pt-font-family: "Barlow", Helvetica;
  --barlow-medium-20pt-font-size: 20px;
  --barlow-medium-20pt-font-weight: 500;
  
  /* Raleway Fonts - Body Text */
  --raleway-bold-20pt-font-family: "Raleway", Helvetica;
  --raleway-bold-20pt-font-size: 20px;
  --raleway-bold-20pt-font-weight: 700;
  
  --raleway-bold-16pt-font-family: "Raleway", Helvetica;
  --raleway-bold-16pt-font-size: 16px;
  --raleway-bold-16pt-font-weight: 700;
  
  --raleway-medium-16pt-font-family: "Raleway", Helvetica;
  --raleway-medium-16pt-font-size: 16px;
  --raleway-medium-16pt-font-weight: 500;
}
```

## 🧩 Component Development

### Service Search Component
```typescript
// components/sections/ServiceSearchSection.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { SearchIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, Check, X } from "lucide-react";

interface SearchDropdownProps {
  label: string;
  placeholder: string;
  width: string;
  paddingX: string;
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  placeholder,
  width,
  paddingX,
  options,
  selectedOption,
  onSelect,
  isOpen,
  onToggle,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className={`relative ${width}`} ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`
          w-full ${paddingX} py-4 border-2 transition-all duration-200 ease-in-out cursor-pointer
          ${isOpen 
            ? 'border-verdeprimario-100 shadow-2xl shadow-verdeprimario-100/30' 
            : 'border-gray-200 hover:border-verdeprimario-100/50 hover:shadow-md'
          }
          rounded-[25px] bg-white flex items-center justify-between
        `}
      >
        <div className="text-left">
          <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
          <div className="text-gray-500">
            {selectedOption || placeholder}
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-xl border border-gray-200 z-50">
          <div className="p-2">
            <div className="text-sm font-semibold text-gray-700 mb-2 px-3 py-2">
              {label === "Servicios:" ? "Servicios disponibles" : 
               label === "Zona:" ? "Ubicaciones" : 
               "Fechas disponibles"}
            </div>
            <div className="max-h-64 overflow-y-auto dropdown-scrollbar">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(option);
                    onToggle();
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-verdeprimario-100/10 rounded-lg transition-all duration-150 flex items-center gap-3 group"
                >
                  <span className="text-gray-700 group-hover:text-verdeprimario-100">
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Date Range Picker Component
```typescript
// components/sections/ServiceSearchSection.tsx (continued)
interface DateRangePickerProps {
  label: string;
  placeholder: string;
  width: string;
  paddingX: string;
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (startDate: Date | null, endDate: Date | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  placeholder,
  width,
  paddingX,
  startDate,
  endDate,
  onDateSelect,
  isOpen,
  onToggle,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (target.closest('.calendar-date') || target.closest('.calendar-button') || target.closest('.calendar-nav')) {
          return;
        }
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const getDisplayText = (): string => {
    try {
      const displayStartDate = tempStartDate || startDate;
      const displayEndDate = tempEndDate || endDate;
      
      if (displayStartDate && displayEndDate) {
        const startDateObj = new Date(displayStartDate);
        const endDateObj = new Date(displayEndDate);
        
        if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
          const startStr = startDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          const endStr = endDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          return `${startStr} - ${endStr}`;
        }
      } else if (displayStartDate) {
        const startDateObj = new Date(displayStartDate);
        if (!isNaN(startDateObj.getTime())) {
          return startDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }
      }
      return placeholder;
    } catch (error) {
      return placeholder;
    }
  };

  const handleDateClick = (date: Date) => {
    try {
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        setTempStartDate(date);
        setTempEndDate(null);
      } else if (tempStartDate && !tempEndDate) {
        if (date < tempStartDate) {
          setTempEndDate(tempStartDate);
          setTempStartDate(date);
        } else {
          setTempEndDate(date);
        }
      }
    } catch (error) {
      console.error('Error handling date click:', error);
    }
  };

  const handleConfirm = () => {
    try {
      if (tempStartDate && tempEndDate) {
        onDateSelect(tempStartDate, tempEndDate);
      } else if (tempStartDate) {
        onDateSelect(tempStartDate, null);
      }
      onToggle();
    } catch (error) {
      console.error('Error confirming dates:', error);
    }
  };

  const handleClear = () => {
    try {
      setTempStartDate(null);
      setTempEndDate(null);
      onDateSelect(null, null);
      onToggle();
    } catch (error) {
      console.error('Error clearing dates:', error);
    }
  };

  // Calendar rendering logic...
  const renderCalendar = (monthOffset: number) => {
    const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset);
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const day = currentDate.getDate();
      const date = new Date(currentDate);
      
      const isStartDate = tempStartDate && isSameDate(date, tempStartDate);
      const isEndDate = tempEndDate && isSameDate(date, tempEndDate);
      const isInRange = tempStartDate && tempEndDate && 
        date > tempStartDate && date < tempEndDate;
      const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push(
        <button
          key={day}
          onClick={() => !isPastDate && handleDateClick(date)}
          disabled={isPastDate}
          className={`
            w-8 h-8 rounded-full text-sm font-medium transition-all duration-150 ease-in-out calendar-date
            ${isPastDate ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 hover:scale-105'}
            ${isStartDate || isEndDate ? 'bg-verdeprimario-100 text-white hover:bg-verdeprimario-100 shadow-md' : ''}
            ${isInRange && !isStartDate && !isEndDate ? 'bg-verdesecundario-100/30 hover:bg-verdesecundario-100/50' : ''}
            ${isToday && !isStartDate && !isEndDate ? 'border-2 border-gray-400 hover:border-gray-500' : ''}
          `}
        >
          {day}
        </button>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className={`relative ${width}`} ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`
          w-full ${paddingX} py-4 border-2 transition-all duration-200 ease-in-out cursor-pointer
          ${isOpen 
            ? 'border-verdeprimario-100 shadow-2xl shadow-verdeprimario-100/30' 
            : 'border-gray-200 hover:border-verdeprimario-100/50 hover:shadow-md'
          }
          rounded-[25px] bg-white flex items-center justify-between
        `}
      >
        <div className="text-left">
          <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
          <div className="text-gray-500">
            {getDisplayText()}
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className="text-lg font-semibold">Seleccionar fechas</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleConfirm}
                  className="w-10 h-10 bg-verdeprimario-100 text-white rounded-full hover:bg-verdeprimario-100/90 transition-all duration-150 hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-6 px-2">
              {/* Left Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-110 calendar-nav"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <h4 className="font-semibold capitalize">{getMonthName(currentMonth)}</h4>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-110 calendar-nav"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                    <div key={`left-day-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar(0)}
                </div>
              </div>

              {/* Right Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-1 hover:bg-gray-100 rounded calendar-nav"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <h4 className="font-semibold capitalize">{getMonthName(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}</h4>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-1 hover:bg-gray-100 rounded calendar-nav"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                    <div key={`right-day-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🔄 State Management

### TanStack Query Setup
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### API Services
```typescript
// services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData: RegisterData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Services endpoints
  static async getServices(filters?: ServiceFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    return this.request(`/services?${params.toString()}`);
  }

  static async getService(id: string) {
    return this.request(`/services/${id}`);
  }

  static async createService(serviceData: CreateServiceData) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  // Bookings endpoints
  static async getBookings() {
    return this.request('/bookings');
  }

  static async createBooking(bookingData: CreateBookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }
}
```

### Custom Hooks
```typescript
// hooks/useServices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';

export const useServices = (filters?: ServiceFilters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => ApiService.getServices(filters),
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => ApiService.getService(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
```

## 🗺️ Map Integration

### Pigeon Maps Setup
```typescript
// components/maps/ServiceMap.tsx
import { Map, Marker } from 'pigeon-maps';
import { useState } from 'react';

interface ServiceMapProps {
  services: Service[];
  center: [number, number];
  zoom: number;
  onServiceSelect: (service: Service) => void;
}

export const ServiceMap: React.FC<ServiceMapProps> = ({
  services,
  center,
  zoom,
  onServiceSelect,
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleMarkerClick = (service: Service) => {
    setSelectedService(service);
    onServiceSelect(service);
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <Map
        center={center}
        zoom={zoom}
        height={400}
        defaultProvider="openstreetmap"
      >
        {services.map((service) => (
          <Marker
            key={service.id}
            anchor={[service.latitude, service.longitude]}
            payload={service}
            onClick={({ payload }) => handleMarkerClick(payload)}
          >
            <div className={`
              w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer
              ${selectedService?.id === service.id 
                ? 'bg-verdeprimario-100' 
                : 'bg-verdesecundario-100'
              }
            `} />
          </Marker>
        ))}
      </Map>
    </div>
  );
};
```

## 📱 Responsive Design

### Mobile-First Approach
```typescript
// components/layout/ResponsiveContainer.tsx
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`
      w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
      ${className}
    `}>
      {children}
    </div>
  );
};

// Usage in pages
export default function ServicesPage() {
  return (
    <ResponsiveContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Service cards */}
      </div>
    </ResponsiveContainer>
  );
}
```

### Navigation Component
```typescript
// components/Navigation.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut } from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/figmaAssets/frame-3.svg" 
              alt="AgroRedUy" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-verdeprimario-100">
              Inicio
            </Link>
            <Link href="/servicios" className="text-gray-700 hover:text-verdeprimario-100">
              Servicios
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-verdeprimario-100">
              Contacto
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-verdeprimario-100"
              >
                <User className="w-5 h-5" />
                <span>Mi Cuenta</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Perfil
                  </Link>
                  <Link href="/my-services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mis Servicios
                  </Link>
                  <Link href="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mis Reservas
                  </Link>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-verdeprimario-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-verdeprimario-100">
                Inicio
              </Link>
              <Link href="/servicios" className="block px-3 py-2 text-gray-700 hover:text-verdeprimario-100">
                Servicios
              </Link>
              <Link href="/contacto" className="block px-3 py-2 text-gray-700 hover:text-verdeprimario-100">
                Contacto
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
```

## 🧪 Testing Implementation

### Component Testing
```typescript
// __tests__/components/ServiceSearchSection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceSearchSection } from '@/components/sections/ServiceSearchSection';

describe('ServiceSearchSection', () => {
  it('renders search form', () => {
    render(<ServiceSearchSection />);
    
    expect(screen.getByText('Servicios:')).toBeInTheDocument();
    expect(screen.getByText('Fechas:')).toBeInTheDocument();
    expect(screen.getByText('Zona:')).toBeInTheDocument();
  });

  it('opens service dropdown when clicked', () => {
    render(<ServiceSearchSection />);
    
    const serviceButton = screen.getByText('¿Qué servicio necesitas?');
    fireEvent.click(serviceButton);
    
    expect(screen.getByText('Servicios disponibles')).toBeInTheDocument();
  });

  it('selects service option', () => {
    render(<ServiceSearchSection />);
    
    const serviceButton = screen.getByText('¿Qué servicio necesitas?');
    fireEvent.click(serviceButton);
    
    const option = screen.getByText('Cosecha');
    fireEvent.click(option);
    
    expect(screen.getByText('Cosecha')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/services.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServicesPage } from '@/app/servicios/page';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Services Integration', () => {
  it('loads and displays services', async () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <ServicesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Servicios Agrícolas')).toBeInTheDocument();
    });
  });
});
```

## 🚀 Performance Optimization

### Image Optimization
```typescript
// components/optimized/Image.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
```

### Code Splitting
```typescript
// components/lazy/LazyComponent.tsx
import { lazy, Suspense } from 'react';

const LazyServiceMap = lazy(() => import('@/components/maps/ServiceMap'));
const LazyCalendar = lazy(() => import('@/components/calendar/Calendar'));

export const LazyServiceMapWithSuspense: React.FC<any> = (props) => (
  <Suspense fallback={<div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg" />}>
    <LazyServiceMap {...props} />
  </Suspense>
);

export const LazyCalendarWithSuspense: React.FC<any> = (props) => (
  <Suspense fallback={<div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />}>
    <LazyCalendar {...props} />
  </Suspense>
);
```

## 📱 PWA Implementation

### Service Worker
```typescript
// public/sw.js
const CACHE_NAME = 'agrored-v1';
const urlsToCache = [
  '/',
  '/servicios',
  '/contacto',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

### PWA Manifest
```json
// public/manifest.json
{
  "name": "AgroRedUy - Servicios Agrícolas",
  "short_name": "AgroRedUy",
  "description": "Plataforma de servicios agrícolas en Uruguay",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2d8341",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
