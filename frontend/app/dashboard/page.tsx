"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicNavigation } from '@/components/DynamicNavigation';
import { 
  User, 
  Building, 
  Settings, 
  BarChart3, 
  Calendar,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      // Redirect based on user role
      if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        router.push('/admin');
      } else if (user.role === 'CONTRACTOR') {
        router.push('/contractor-dashboard');
      } else {
        // Regular user - show homepage with user-specific content
        router.push('/');
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // This should not be reached due to the redirects above, but just in case
  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavigation 
        leftItems={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/services/list" },
        ]}
        variant="service"
      />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido a AgroRed Uy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <User className="w-8 h-8 text-verdeprimario-100" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Mi Perfil</h3>
                  <p className="text-gray-600 text-sm">Gestiona tu información personal</p>
                </div>
              </div>
              <Link href="/profile">
                <Button className="w-full mt-4">Ver Perfil</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Settings className="w-8 h-8 text-verdeprimario-100" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                  <p className="text-gray-600 text-sm">Ajusta tus preferencias</p>
                </div>
              </div>
              <Link href="/settings">
                <Button className="w-full mt-4">Configurar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-verdeprimario-100" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Mis Reservas</h3>
                  <p className="text-gray-600 text-sm">Gestiona tus reservas</p>
                </div>
              </div>
              <Link href="/mis-reservas">
                <Button className="w-full mt-4">Ver Reservas</Button>
              </Link>
            </CardContent>
          </Card>

          {user.role === 'CONTRACTOR' && (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Building className="w-8 h-8 text-verdeprimario-100" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Mis Servicios</h3>
                      <p className="text-gray-600 text-sm">Gestiona tus servicios</p>
                    </div>
                  </div>
                  <Link href="/my-services">
                    <Button className="w-full mt-4">Ver Servicios</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <BarChart3 className="w-8 h-8 text-verdeprimario-100" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
                      <p className="text-gray-600 text-sm">Ve tu rendimiento</p>
                    </div>
                  </div>
                  <Link href="/contractor-dashboard">
                    <Button className="w-full mt-4">Ver Estadísticas</Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'ADMIN' && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-8 h-8 text-verdeprimario-100" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Panel de Admin</h3>
                    <p className="text-gray-600 text-sm">Gestiona la plataforma</p>
                  </div>
                </div>
                <Link href="/admin">
                  <Button className="w-full mt-4">Ir al Panel</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
