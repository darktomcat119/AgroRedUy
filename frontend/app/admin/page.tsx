/**
 * @fileoverview Admin dashboard page
 * Provides administrative tools and analytics
 */

"use client";

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DynamicNavigation } from '@/components/DynamicNavigation';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin } = useAdminAuth();
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavigation 
        leftItems={[
          { label: "Inicio", active: false, href: "/" },
          { label: "Servicios", active: false, href: "/servicios" },
        ]}
        variant="service"
      />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}
