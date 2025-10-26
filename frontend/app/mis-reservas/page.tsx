/**
 * @fileoverview User bookings page
 * Displays user's bookings with management options
 */

"use client";

import { BookingList } from '@/components/booking/BookingList';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MisReservasPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
          <p className="mt-2 text-gray-600">
            Gestiona todas tus reservas de servicios agrícolas
          </p>
        </div>

        <BookingList
          showActions={true}
          onBookingUpdate={(bookingId, newStatus) => {
            console.log('Booking updated:', bookingId, newStatus);
            // Handle booking status update
          }}
          onBookingView={(bookingId) => {
            console.log('View booking:', bookingId);
            // Navigate to booking details
          }}
        />
      </div>
    </div>
  );
}
