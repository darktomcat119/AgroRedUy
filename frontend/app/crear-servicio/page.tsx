/**
 * @fileoverview Service creation page
 * Allows users to create new agricultural services
 */

"use client";

import { ServiceCreationForm } from '@/components/forms/ServiceCreationForm';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CrearServicioPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only contractors and admins can create services
    if (!isLoading && isAuthenticated && user?.role !== 'CONTRACTOR' && user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

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

  if (user?.role !== 'CONTRACTOR' && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            Solo los contratistas pueden crear servicios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Servicio</h1>
          <p className="mt-2 text-gray-600">
            Publica tu servicio agrícola y conecta con clientes en toda Uruguay
          </p>
        </div>

        <ServiceCreationForm
          onSuccess={(service) => {
            console.log('Service created:', service);
            // Redirect to service details or services list
            window.location.href = '/my-services';
          }}
          onCancel={() => {
            window.location.href = '/servicios';
          }}
        />
      </div>
    </div>
  );
}
