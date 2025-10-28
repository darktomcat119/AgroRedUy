/**
 * @fileoverview Admin dashboard page
 * Provides administrative tools and analytics
 */

"use client";

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminOrSuperAdmin } from '@/components/admin/RoleGuard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();

  // Debug logging
  console.log('AdminPage - isAuthenticated:', isAuthenticated);
  console.log('AdminPage - isLoading:', isLoading);
  console.log('AdminPage - user:', user);
  console.log('AdminPage - user.role:', user?.role);
  console.log('AdminPage - isAdmin:', isAdmin);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grisprimario-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-grisprimario-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-negro-100 mb-4 font-raleway-bold-20pt">
            Acceso Denegado
          </h1>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminOrSuperAdmin>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <AdminDashboard />
        </div>
      </AdminLayout>
    </AdminOrSuperAdmin>
  );
}
