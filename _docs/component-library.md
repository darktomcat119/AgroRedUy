# Component Library - AgroRedUy

## 🧩 Component Overview

This document provides a comprehensive guide to the AgroRedUy component library, including reusable UI components, their usage, props, and examples.

## 🎨 Base Components (shadcn/ui)

### Button Component
```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-verdeprimario-100 text-white hover:bg-verdeprimario-100/90",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-verdeprimario-100 text-verdeprimario-100 hover:bg-verdeprimario-100/10",
        secondary: "bg-verdesecundario-100 text-white hover:bg-verdesecundario-100/90",
        ghost: "hover:bg-verdeprimario-100/10 hover:text-verdeprimario-100",
        link: "text-verdeprimario-100 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Input Component
```typescript
// components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verdeprimario-100 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### Card Component
```typescript
// components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

## 🏗️ Feature Components

### Service Card Component
```typescript
// components/features/ServiceCard.tsx
import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, Phone } from 'lucide-react';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    pricePerHour: number;
    category: string;
    location: {
      city: string;
      department: string;
    };
    images: string[];
    rating: number;
    reviewCount: number;
    provider: {
      name: string;
      phone?: string;
    };
  };
  onViewDetails: (serviceId: string) => void;
  onContact: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onViewDetails,
  onContact,
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative">
        <Image
          src={service.images[0] || '/placeholder-service.jpg'}
          alt={service.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-4 right-4 bg-verdeprimario-100 text-white">
          {service.category}
        </Badge>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{service.rating}</span>
          <span className="text-xs text-gray-500">({service.reviewCount})</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <CardTitle className="text-xl text-verdeprimario-100 mb-2 line-clamp-1">
          {service.title}
        </CardTitle>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {service.description}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{service.location.city}, {service.location.department}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Disponible</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-verdeprimario-100">
              ${service.pricePerHour}
            </div>
            <div className="text-sm text-gray-500">por hora</div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact(service.id)}
              className="flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contactar
            </Button>
            <Button
              onClick={() => onViewDetails(service.id)}
              size="sm"
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### Service Search Bar Component
```typescript
// components/features/ServiceSearchBar.tsx
"use client";

import React, { useState } from 'react';
import { SearchIcon, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchDropdown } from './SearchDropdown';
import { DateRangePicker } from './DateRangePicker';

interface ServiceSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

interface SearchFilters {
  service?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
}

export const ServiceSearchBar: React.FC<ServiceSearchBarProps> = ({
  onSearch,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const serviceOptions = [
    'Cosecha',
    'Siembra',
    'Fumigación',
    'Fertilización',
    'Riego',
    'Poda',
    'Labranza',
    'Pulverización',
    'Carga y transporte',
    'Otros servicios'
  ];

  const locationOptions = [
    'Montevideo',
    'Canelones',
    'Maldonado',
    'Rocha',
    'Treinta y Tres',
    'Cerro Largo',
    'Rivera',
    'Tacuarembó',
    'Salto',
    'Artigas',
    'Paysandú',
    'Río Negro',
    'Soriano',
    'Colonia',
    'San José',
    'Flores',
    'Florida',
    'Lavalleja',
    'Durazno'
  ];

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="flex w-full max-w-4xl mx-auto bg-white rounded-[45px] shadow-lg border border-gray-200 p-2">
      <div className="flex-1 flex items-center gap-2">
        <SearchDropdown
          label="Servicios:"
          placeholder="¿Qué servicio necesitas?"
          width="w-1/3"
          paddingX="px-4"
          options={serviceOptions}
          selectedOption={filters.service || null}
          onSelect={(option) => setFilters({ ...filters, service: option })}
          isOpen={isServiceOpen}
          onToggle={() => setIsServiceOpen(!isServiceOpen)}
        />
        
        <DateRangePicker
          label="Fechas:"
          placeholder="¿Cuándo?"
          width="w-1/3"
          paddingX="px-4"
          startDate={filters.startDate || null}
          endDate={filters.endDate || null}
          onDateSelect={(startDate, endDate) => 
            setFilters({ ...filters, startDate, endDate })
          }
          isOpen={isDateOpen}
          onToggle={() => setIsDateOpen(!isDateOpen)}
        />
        
        <SearchDropdown
          label="Zona:"
          placeholder="¿Dónde?"
          width="w-1/3"
          paddingX="px-4"
          options={locationOptions}
          selectedOption={filters.location || null}
          onSelect={(option) => setFilters({ ...filters, location: option })}
          isOpen={isLocationOpen}
          onToggle={() => setIsLocationOpen(!isLocationOpen)}
        />
      </div>
      
      <Button
        onClick={handleSearch}
        className="bg-verdesecundario-100 hover:bg-verdeprimario-100 rounded-full p-3 ml-2"
      >
        <SearchIcon className="w-5 h-5" />
      </Button>
    </div>
  );
};
```

### Map Component
```typescript
// components/features/ServiceMap.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Map, Marker } from 'pigeon-maps';
import { Card } from '@/components/ui/card';

interface ServiceMapProps {
  services: Service[];
  center: [number, number];
  zoom: number;
  onServiceSelect: (service: Service) => void;
  selectedService?: Service;
}

interface Service {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  category: string;
  isActive: boolean;
}

export const ServiceMap: React.FC<ServiceMapProps> = ({
  services,
  center,
  zoom,
  onServiceSelect,
  selectedService,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  const handleMarkerClick = (service: Service) => {
    onServiceSelect(service);
    setMapCenter([service.latitude, service.longitude]);
    setMapZoom(12);
  };

  return (
    <Card className="p-4">
      <div className="w-full h-96 rounded-lg overflow-hidden">
        <Map
          center={mapCenter}
          zoom={mapZoom}
          height={400}
          defaultProvider="openstreetmap"
          onBoundsChanged={({ center, zoom }) => {
            setMapCenter(center);
            setMapZoom(zoom);
          }}
        >
          {services
            .filter(service => service.isActive)
            .map((service) => (
              <Marker
                key={service.id}
                anchor={[service.latitude, service.longitude]}
                payload={service}
                onClick={({ payload }) => handleMarkerClick(payload)}
              >
                <div className={`
                  w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-xs font-bold
                  ${selectedService?.id === service.id 
                    ? 'bg-verdeprimario-100 scale-110' 
                    : 'bg-verdesecundario-100 hover:bg-verdeprimario-100'
                  }
                  transition-all duration-200
                `}>
                  ${service.pricePerHour}
                </div>
              </Marker>
            ))}
        </Map>
      </div>
      
      {selectedService && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-verdeprimario-100 mb-2">
            {selectedService.title}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedService.category} • ${selectedService.pricePerHour}/hora
          </p>
        </div>
      )}
    </Card>
  );
};
```

### Calendar Component
```typescript
// components/features/ServiceCalendar.tsx
"use client";

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceCalendarProps {
  availability: Availability[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

interface Availability {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export const ServiceCalendar: React.FC<ServiceCalendarProps> = ({
  availability,
  onDateSelect,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.some(
      slot => slot.date.toISOString().split('T')[0] === dateStr && slot.isAvailable
    );
  };

  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.some(
      slot => slot.date.toISOString().split('T')[0] === dateStr && slot.isBooked
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isAvailable = isDateAvailable(date);
      const isBooked = isDateBooked(date);
      const isSelected = isDateSelected(date);
      const isTodayDate = isToday(date);

      days.push(
        <button
          key={day}
          onClick={() => isAvailable && onDateSelect(date)}
          disabled={!isAvailable || isBooked}
          className={`
            w-8 h-8 rounded-full text-sm font-medium transition-all duration-150
            ${isSelected 
              ? 'bg-verdeprimario-100 text-white' 
              : isBooked
              ? 'bg-red-100 text-red-600 cursor-not-allowed'
              : isAvailable
              ? 'bg-verdesecundario-100/30 text-gray-700 hover:bg-verdesecundario-100/50 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
            }
            ${isTodayDate ? 'border-2 border-verdeprimario-100' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disponibilidad</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          
          <h3 className="font-semibold capitalize">
            {getMonthName(currentMonth)}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
            <div key={index} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
        
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-verdesecundario-100/30 rounded-full"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-verdeprimario-100 rounded-full"></div>
            <span>Seleccionado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 📱 Layout Components

### Navigation Component
```typescript
// components/layout/Navigation.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/figmaAssets/frame-3.svg" 
              alt="AgroRedUy" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-verdeprimario-100">
              AgroRedUy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-verdeprimario-100 transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/servicios" 
              className="text-gray-700 hover:text-verdeprimario-100 transition-colors"
            >
              Servicios
            </Link>
            <Link 
              href="/contacto" 
              className="text-gray-700 hover:text-verdeprimario-100 transition-colors"
            >
              Contacto
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Mi Cuenta</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-services">Mis Servicios</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings">Mis Reservas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-verdeprimario-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                href="/servicios" 
                className="block px-3 py-2 text-gray-700 hover:text-verdeprimario-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link 
                href="/contacto" 
                className="block px-3 py-2 text-gray-700 hover:text-verdeprimario-100"
                onClick={() => setIsMenuOpen(false)}
              >
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

### Footer Component
```typescript
// components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/figmaAssets/frame-3.svg" 
                alt="AgroRedUy" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">AgroRedUy</span>
            </div>
            <p className="text-gray-300 mb-4">
              Conectamos el campo uruguayo. La plataforma que une a productores 
              y contratistas para hacer crecer la agricultura en Uruguay.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/servicios" className="text-gray-300 hover:text-white transition-colors">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-verdeprimario-100" />
                <span className="text-gray-300">Montevideo, Uruguay</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-verdeprimario-100" />
                <span className="text-gray-300">+598 99 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-verdeprimario-100" />
                <span className="text-gray-300">info@agrored.uy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AgroRedUy. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
```

## 🎨 Form Components

### Contact Form Component
```typescript
// components/forms/ContactForm.tsx
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-verdeprimario-100 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-verdeprimario-100 mb-2">
            ¡Mensaje enviado!
          </h3>
          <p className="text-gray-600 mb-4">
            Gracias por contactarnos. Te responderemos pronto.
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
          >
            Enviar otro mensaje
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-verdeprimario-100">
          Contáctanos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register('name')}
              placeholder="Tu nombre"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register('email')}
              type="email"
              placeholder="Tu email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register('phone')}
              type="tel"
              placeholder="Tu teléfono"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Textarea
              {...register('message')}
              placeholder="Tu mensaje"
              rows={4}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Enviando...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar mensaje
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

## 🧪 Testing Components

### Component Testing Examples
```typescript
// __tests__/components/ServiceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceCard } from '@/components/features/ServiceCard';

const mockService = {
  id: '1',
  title: 'Cosecha de Soja',
  description: 'Servicio profesional de cosecha de soja',
  pricePerHour: 50,
  category: 'Cosecha',
  location: {
    city: 'Montevideo',
    department: 'Montevideo'
  },
  images: ['/test-image.jpg'],
  rating: 4.5,
  reviewCount: 12,
  provider: {
    name: 'Juan Pérez',
    phone: '+59899123456'
  }
};

describe('ServiceCard', () => {
  it('renders service information', () => {
    const mockOnViewDetails = jest.fn();
    const mockOnContact = jest.fn();

    render(
      <ServiceCard
        service={mockService}
        onViewDetails={mockOnViewDetails}
        onContact={mockOnContact}
      />
    );

    expect(screen.getByText('Cosecha de Soja')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('por hora')).toBeInTheDocument();
  });

  it('calls onViewDetails when "Ver detalles" is clicked', () => {
    const mockOnViewDetails = jest.fn();
    const mockOnContact = jest.fn();

    render(
      <ServiceCard
        service={mockService}
        onViewDetails={mockOnViewDetails}
        onContact={mockOnContact}
      />
    );

    fireEvent.click(screen.getByText('Ver detalles'));
    expect(mockOnViewDetails).toHaveBeenCalledWith('1');
  });
});
```

## 📚 Usage Guidelines

### Component Usage Best Practices
1. **Consistent Props**: Always use the same prop structure across similar components
2. **Accessibility**: Include proper ARIA labels and keyboard navigation
3. **Responsive Design**: Ensure components work on all screen sizes
4. **Error Handling**: Include proper error states and loading states
5. **Performance**: Use React.memo for expensive components
6. **Testing**: Write comprehensive tests for all components

### Styling Guidelines
1. **Use Design System**: Always use the established color palette and typography
2. **Consistent Spacing**: Use the 8px grid system for spacing
3. **Hover States**: Include appropriate hover effects
4. **Transitions**: Use consistent transition durations
5. **Mobile-First**: Design for mobile devices first

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
