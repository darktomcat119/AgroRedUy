/**
 * @fileoverview Booking list component
 * Displays a list of bookings with filtering and pagination
 */

'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { BookingCard } from './BookingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

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

interface BookingListProps {
  userId?: string;
  serviceId?: string;
  showActions?: boolean;
  onBookingUpdate?: (bookingId: string, newStatus: string) => void;
  onBookingView?: (bookingId: string) => void;
}

export function BookingList({ 
  userId, 
  serviceId, 
  showActions = true, 
  onBookingUpdate,
  onBookingView 
}: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const statusOptions = [
    { value: 'ALL', label: 'Todos', count: totalBookings },
    { value: 'PENDING', label: 'Pendientes', count: 0 },
    { value: 'CONFIRMED', label: 'Confirmados', count: 0 },
    { value: 'CANCELLED', label: 'Cancelados', count: 0 },
    { value: 'COMPLETED', label: 'Completados', count: 0 }
  ];

  const loadBookings = async (page = 1, search = '', status = 'ALL') => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (serviceId) {
        response = await apiClient.getServiceBookings(serviceId, page, 10);
      } else {
        response = await apiClient.getBookings(page, 10);
      }

      if (response.success && response.data) {
        const { data, total, page: currentPage, totalPages } = response.data;
        
        // Filter bookings based on search and status
        let filteredBookings = data;
        
        if (search) {
          filteredBookings = filteredBookings.filter((booking: Booking) =>
            booking.service.title.toLowerCase().includes(search.toLowerCase()) ||
            booking.contactName.toLowerCase().includes(search.toLowerCase()) ||
            booking.service.city.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (status !== 'ALL') {
          filteredBookings = filteredBookings.filter((booking: Booking) =>
            booking.status === status
          );
        }

        setBookings(filteredBookings);
        setTotalBookings(total);
        setCurrentPage(currentPage);
        setTotalPages(totalPages);
      } else {
        setError(response.error?.message || 'Error al cargar las reservas');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Error inesperado al cargar las reservas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(currentPage, searchTerm, statusFilter);
  }, [currentPage, serviceId]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadBookings(1, value, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    loadBookings(1, searchTerm, status);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateBooking(bookingId, { status: newStatus });
      
      if (response.success) {
        // Update the booking in the local state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: newStatus as any }
              : booking
          )
        );
        onBookingUpdate?.(bookingId, newStatus);
      } else {
        setError(response.error?.message || 'Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Error inesperado al actualizar la reserva');
    }
  };

  const handleRefresh = () => {
    loadBookings(currentPage, searchTerm, statusFilter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
          <p className="text-gray-600">
            {totalBookings} reserva{totalBookings !== 1 ? 's' : ''} encontrada{totalBookings !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por servicio, contacto o ciudad..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(option.value)}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron reservas
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no tienes reservas registradas'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onStatusChange={handleStatusChange}
              onViewDetails={onBookingView}
              showActions={showActions}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
