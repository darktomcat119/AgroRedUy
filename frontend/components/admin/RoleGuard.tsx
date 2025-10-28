"use client";

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, Crown, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'SUPERADMIN')[];
  superAdminOnly?: boolean;
  fallbackComponent?: React.ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  superAdminOnly = false, 
  fallbackComponent 
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-grisprimario-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check if user has required role
  const userRole = user?.role;
  const hasAccess = allowedRoles.includes(userRole as 'ADMIN' | 'SUPERADMIN');

  // Super Admin only check
  if (superAdminOnly && userRole !== 'SUPERADMIN') {
    return fallbackComponent || (
      <div className="min-h-screen bg-grisprimario-10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-negro-100 mb-4 font-raleway-bold-20pt">
            Acceso Restringido
          </h1>
          <p className="text-grisprimario-200 font-raleway-medium-16pt mb-6">
            Esta sección es exclusiva para Super Administradores. 
            Solo los Super Admins pueden acceder a esta funcionalidad.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-800 font-raleway-bold-16pt">Permisos Requeridos:</span>
            </div>
            <ul className="text-sm text-yellow-700 font-raleway-medium-14pt space-y-1">
              <li>• Gestión completa de usuarios</li>
              <li>• Monitoreo de seguridad</li>
              <li>• Configuración del sistema</li>
              <li>• Reportes avanzados</li>
            </ul>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 px-6 py-2 rounded-full font-raleway-medium-16pt"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // General role check
  if (!hasAccess) {
    return fallbackComponent || (
      <div className="min-h-screen bg-grisprimario-10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-negro-100 mb-4 font-raleway-bold-20pt">
            Acceso Denegado
          </h1>
          <p className="text-grisprimario-200 font-raleway-medium-16pt mb-6">
            No tienes los permisos necesarios para acceder a esta sección.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-800 font-raleway-bold-16pt">Tu Rol Actual:</span>
            </div>
            <p className="text-sm text-blue-700 font-raleway-medium-14pt">
              {userRole === 'ADMIN' ? 'Administrador' : 
               userRole === 'SUPERADMIN' ? 'Super Administrador' : 
               userRole === 'CONTRACTOR' ? 'Contratista' : 'Usuario'}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 px-6 py-2 rounded-full font-raleway-medium-16pt"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
}

// Convenience components for specific role checks
export function SuperAdminOnly({ children, fallbackComponent }: { children: React.ReactNode; fallbackComponent?: React.ReactNode }) {
  return (
    <RoleGuard 
      allowedRoles={['SUPERADMIN']} 
      superAdminOnly={true}
      fallbackComponent={fallbackComponent}
    >
      {children}
    </RoleGuard>
  );
}

export function AdminOrSuperAdmin({ children, fallbackComponent }: { children: React.ReactNode; fallbackComponent?: React.ReactNode }) {
  return (
    <RoleGuard 
      allowedRoles={['ADMIN', 'SUPERADMIN']}
      fallbackComponent={fallbackComponent}
    >
      {children}
    </RoleGuard>
  );
}
