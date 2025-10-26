/**
 * @fileoverview Booking card component
 * Displays booking information in a card format
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  durationHours: number;
  notes?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  service: {
    id: string;
    title: string;
    description: string;
    pricePerHour: number;
    address: string;
    city: string;
    department: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
    category: {
      id: string;
      name: string;
    };
  };
  availability: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

interface BookingCardProps {
  booking: Booking;
  onStatusChange?: (bookingId: string, newStatus: string) => void;
  onViewDetails?: (bookingId: string) => void;
  showActions?: boolean;
}

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  COMPLETED: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  }
};

export function BookingCard({ 
  booking, 
  onStatusChange, 
  onViewDetails, 
  showActions = true 
}: BookingCardProps) {
  const statusInfo = statusConfig[booking.status];
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds if present
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(booking.id, newStatus);
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {booking.service.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusInfo.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              <Badge variant="outline">
                {booking.service.category.name}
              </Badge>
            </div>
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(booking.id)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{booking.service.address}, {booking.service.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{booking.service.user.firstName} {booking.service.user.lastName}</span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Fecha:</span>
              <span>{formatDate(booking.availability.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Horario:</span>
              <span>{formatTime(booking.availability.startTime)} - {formatTime(booking.availability.endTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Duración:</span>
              <span>{booking.durationHours} horas</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Precio por hora:</span>
              <span>${booking.service.pricePerHour}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Total:</span>
              <span className="font-semibold text-verdeprimario-100">${booking.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Información de Contacto</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{booking.contactName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{booking.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{booking.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </div>
        )}

        {/* Status Actions */}
        {showActions && (
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {booking.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('CONFIRMED')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange('CANCELLED')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              )}
              
              {booking.status === 'CONFIRMED' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('COMPLETED')}
                  className="bg-verdeprimario-100 hover:bg-verdeprimario-100/90"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Marcar Completado
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails?.(booking.id)}
              >
                Ver Detalles
              </Button>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t pt-4 text-xs text-gray-500">
          <div>Creado: {formatDate(booking.createdAt)}</div>
          {booking.confirmedAt && (
            <div>Confirmado: {formatDate(booking.confirmedAt)}</div>
          )}
          {booking.cancelledAt && (
            <div>Cancelado: {formatDate(booking.cancelledAt)}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
