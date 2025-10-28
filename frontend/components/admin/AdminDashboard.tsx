/**
 * @fileoverview Admin dashboard component
 * Provides analytics and management tools for administrators
 */

'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalServices: number;
  totalBookings: number;
  activeUsers: number;
  activeServices: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  serviceGrowth: Array<{
    date: string;
    count: number;
  }>;
  bookingGrowth: Array<{
    date: string;
    count: number;
  }>;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    serviceCount: number;
  }>;
  topServices: Array<{
    serviceId: string;
    serviceTitle: string;
    bookingCount: number;
    totalRevenue: number;
  }>;
}

export function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user has admin role
      if (!isAuthenticated || !user) {
        setError('Debes iniciar sesión para acceder a esta página');
        return;
      }

      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        setError(`No tienes permisos de administrador para acceder a esta página. Tu rol actual es: ${user.role}. Necesitas ser ADMIN o SUPERADMIN para acceder al panel de administración.`);
        return;
      }

      const response = await apiClient.getAnalytics();

      if (response.success && response.data) {
        console.log('Analytics data received:', response.data);
        setAnalytics(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error?.message || 'Error al cargar las estadísticas');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Error inesperado al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load analytics if user is authenticated and has admin role
    if (isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
      loadAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleRefresh = () => {
    loadAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-UY').format(num);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          
          {error.includes('No tienes permisos de administrador') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">¿Cómo obtener acceso de administrador?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Contacta al SUPERADMIN para que te asigne el rol de ADMIN</li>
                <li>• O crea una cuenta con rol SUPERADMIN directamente</li>
                <li>• Los roles disponibles son: USER, CONTRACTOR, ADMIN, SUPERADMIN</li>
              </ul>
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-negro-100 font-raleway-bold-20pt">Panel de Administración</h1>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">
            Estadísticas y gestión de la plataforma AgroRedUy
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-grisprimario-200 font-raleway-medium-14pt">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-verdeprimario-100 text-blanco-100 hover:bg-verdeprimario-200 border-verdeprimario-100 rounded-full font-raleway-medium-16pt"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-grisprimario-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{formatNumber(analytics.totalUsers)}</div>
            <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
              {analytics.activeUsers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Servicios Totales</CardTitle>
            <Briefcase className="h-4 w-4 text-grisprimario-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{formatNumber(analytics.totalServices)}</div>
            <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
              {analytics.activeServices} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Reservas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-grisprimario-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{formatNumber(analytics.totalBookings)}</div>
            <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
              {analytics.completedBookings} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-grisprimario-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
              Promedio: {formatCurrency(analytics.totalRevenue / Math.max(analytics.totalBookings, 1))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-naranja-100" />
              <div>
                <p className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Pendientes</p>
                <p className="text-2xl font-bold text-naranja-100 font-raleway-bold-20pt">{analytics.pendingBookings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-verdeprimario-100" />
              <div>
                <p className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Confirmadas</p>
                <p className="text-2xl font-bold text-verdeprimario-100 font-raleway-bold-20pt">{analytics.confirmedBookings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-verdesecundario-100" />
              <div>
                <p className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Completadas</p>
                <p className="text-2xl font-bold text-verdesecundario-100 font-raleway-bold-20pt">{analytics.completedBookings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-negro-100" />
              <div>
                <p className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Canceladas</p>
                <p className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{analytics.cancelledBookings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories and Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-negro-100 font-raleway-bold-16pt">
              <TrendingUp className="h-5 w-5" />
              Categorías Más Populares
            </CardTitle>
            <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
              Categorías con más servicios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics.topCategories || []).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-grisprimario-200 font-raleway-medium-16pt">No hay categorías disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(analytics.topCategories || []).map((category, index) => (
                  <div key={`category-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-negro-100 font-raleway-bold-16pt">{category.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-negro-100 font-raleway-bold-16pt">{category.serviceCount}</p>
                      <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">servicios</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-negro-100 font-raleway-bold-16pt">
              <Star className="h-5 w-5" />
              Servicios Más Reservados
            </CardTitle>
            <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
              Servicios con más reservas y ingresos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics.topServices || []).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-grisprimario-200 font-raleway-medium-16pt">No hay servicios disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(analytics.topServices || []).map((service, index) => (
                  <div key={`service-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm text-negro-100 font-raleway-bold-16pt">{service.serviceTitle}</p>
                        <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">{service.bookingCount} reservas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-negro-100 font-raleway-bold-16pt">{formatCurrency(service.totalRevenue)}</p>
                      <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">ingresos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-negro-100 font-raleway-bold-16pt">
              <TrendingUp className="h-5 w-5" />
              Crecimiento de Usuarios
            </CardTitle>
            <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
              Últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics.userGrowth || []).length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-grisprimario-200 mx-auto mb-4" />
                <p className="text-grisprimario-200 font-raleway-medium-16pt">No hay datos disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-naranja-100 font-raleway-bold-20pt">
                      {analytics.userGrowth[analytics.userGrowth.length - 1]?.count || 0}
                    </p>
                    <p className="text-sm text-grisprimario-200 font-raleway-medium-14pt">Usuarios totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-verdeprimario-100 font-raleway-bold-16pt">
                      +{analytics.userGrowth[analytics.userGrowth.length - 1]?.count - analytics.userGrowth[0]?.count || 0}
                    </p>
                    <p className="text-sm text-grisprimario-200 font-raleway-medium-14pt">Crecimiento</p>
                  </div>
                </div>
                <div className="flex items-end justify-between h-20 gap-2">
                  {analytics.userGrowth.map((point, index) => {
                    const maxCount = Math.max(...analytics.userGrowth.map(p => p.count));
                    const height = (point.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-naranja-100 rounded-t w-full transition-all duration-300 hover:bg-naranja-200"
                          style={{ height: `${height}%` }}
                        />
                        <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt mt-1">
                          {point.count}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                    Últimos {(analytics.userGrowth || []).length} períodos
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-negro-100 font-raleway-bold-16pt">
              <Briefcase className="h-5 w-5" />
              Crecimiento de Servicios
            </CardTitle>
            <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
              Últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics.serviceGrowth || []).length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-grisprimario-200 mx-auto mb-4" />
                <p className="text-grisprimario-200 font-raleway-medium-16pt">No hay datos disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-verdeprimario-100 font-raleway-bold-20pt">
                      {analytics.serviceGrowth[analytics.serviceGrowth.length - 1]?.count || 0}
                    </p>
                    <p className="text-sm text-grisprimario-200 font-raleway-medium-14pt">Servicios totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-verdeprimario-100 font-raleway-bold-16pt">
                      +{analytics.serviceGrowth[analytics.serviceGrowth.length - 1]?.count - analytics.serviceGrowth[0]?.count || 0}
                    </p>
                    <p className="text-sm text-grisprimario-200 font-raleway-medium-14pt">Crecimiento</p>
                  </div>
                </div>
                <div className="flex items-end justify-between h-20 gap-2">
                  {analytics.serviceGrowth.map((point, index) => {
                    const maxCount = Math.max(...analytics.serviceGrowth.map(p => p.count));
                    const height = (point.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-verdeprimario-100 rounded-t w-full transition-all duration-300 hover:bg-verdeprimario-200"
                          style={{ height: `${height}%` }}
                        />
                        <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt mt-1">
                          {point.count}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                    Últimos {(analytics.serviceGrowth || []).length} períodos
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-negro-100 font-raleway-bold-16pt">
              <Calendar className="h-5 w-5" />
              Crecimiento de Reservas
            </CardTitle>
            <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
              Últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics.bookingGrowth || []).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-grisprimario-200 mx-auto mb-4" />
                <p className="text-grisprimario-200 font-raleway-medium-16pt">No hay datos disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-verdesecundario-100 font-raleway-bold-20pt">
                      {analytics.bookingGrowth[analytics.bookingGrowth.length - 1]?.count || 0}
                    </p>
                    <p className="text-sm text-grisprimario-200 font-raleway-medium-14pt">Reservas totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-verdesecundario-100 font-raleway-bold-16pt">
                      +{analytics.bookingGrowth[analytics.bookingGrowth.length - 1]?.count - analytics.bookingGrowth[0]?.count || 0}
                    </p>
                    <p className="text-sm text-grisprimario-200 font-raleway-medium-14pt">Crecimiento</p>
                  </div>
                </div>
                <div className="flex items-end justify-between h-20 gap-2">
                  {analytics.bookingGrowth.map((point, index) => {
                    const maxCount = Math.max(...analytics.bookingGrowth.map(p => p.count));
                    const height = (point.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-verdesecundario-100 rounded-t w-full transition-all duration-300 hover:bg-verdesecundario-200"
                          style={{ height: `${height}%` }}
                        />
                        <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt mt-1">
                          {point.count}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                    Últimos {(analytics.bookingGrowth || []).length} períodos
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-negro-100 font-raleway-bold-16pt">Acciones Rápidas</CardTitle>
          <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
            Herramientas de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-blanco-100 text-negro-100 border-grisprimario-10 hover:bg-grisprimario-10 hover:text-negro-100 rounded-full font-raleway-medium-16pt">
              <Users className="h-6 w-6" />
              <span>Gestionar Usuarios</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-blanco-100 text-negro-100 border-grisprimario-10 hover:bg-grisprimario-10 hover:text-negro-100 rounded-full font-raleway-medium-16pt">
              <Briefcase className="h-6 w-6" />
              <span>Gestionar Servicios</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-blanco-100 text-negro-100 border-grisprimario-10 hover:bg-grisprimario-10 hover:text-negro-100 rounded-full font-raleway-medium-16pt">
              <Calendar className="h-6 w-6" />
              <span>Gestionar Reservas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
