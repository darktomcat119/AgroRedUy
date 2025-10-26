/**
 * @fileoverview Admin dashboard component
 * Provides analytics and management tools for administrators
 */

'use client';

import React, { useState, useEffect } from 'react';
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getAnalytics();

      if (response.success && response.data) {
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
    loadAnalytics();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">
            Estadísticas y gestión de la plataforma AgroRedUy
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
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
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeUsers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Totales</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalServices)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeServices} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalBookings)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedBookings} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
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
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.pendingBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.confirmedBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{analytics.completedBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">{analytics.cancelledBookings}</p>
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Categorías Más Populares
            </CardTitle>
            <CardDescription>
              Categorías con más servicios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={category.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{category.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{category.serviceCount}</p>
                    <p className="text-xs text-gray-500">servicios</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Servicios Más Reservados
            </CardTitle>
            <CardDescription>
              Servicios con más reservas y ingresos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topServices.map((service, index) => (
                <div key={service.serviceId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{service.serviceTitle}</p>
                      <p className="text-xs text-gray-500">{service.bookingCount} reservas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(service.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crecimiento de Usuarios
            </CardTitle>
            <CardDescription>
              Últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gráfico de crecimiento</p>
              <p className="text-sm text-gray-500">
                {analytics.userGrowth.length} puntos de datos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Crecimiento de Servicios
            </CardTitle>
            <CardDescription>
              Últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gráfico de servicios</p>
              <p className="text-sm text-gray-500">
                {analytics.serviceGrowth.length} puntos de datos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Crecimiento de Reservas
            </CardTitle>
            <CardDescription>
              Últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gráfico de reservas</p>
              <p className="text-sm text-gray-500">
                {analytics.bookingGrowth.length} puntos de datos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Herramientas de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Gestionar Usuarios</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Briefcase className="h-6 w-6" />
              <span>Gestionar Servicios</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Gestionar Reservas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
