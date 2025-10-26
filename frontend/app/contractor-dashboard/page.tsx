"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicNavigation } from "@/components/DynamicNavigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface ContractorStats {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export default function ContractorDashboardPage(): JSX.Element {
  const [stats, setStats] = useState<ContractorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In a real implementation, you would fetch contractor-specific data
      // For now, we'll use mock data
      setStats({
        totalServices: 3,
        activeServices: 2,
        totalBookings: 15,
        pendingBookings: 2,
        confirmedBookings: 8,
        completedBookings: 5,
        totalRevenue: 25000,
        averageRating: 4.8
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blanco-100 flex items-center justify-center">
        <div className="text-verdeprimario-100">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blanco-100">
      <DynamicNavigation 
        leftItems={[
          { label: "Inicio", active: false, href: "/" },
          { label: "Servicios", active: false, href: "/servicios" },
        ]}
        variant="service"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-verdeprimario-100 mb-2">
            Panel de Contratista
          </h1>
          <p className="text-gray-600">
            Gestiona tus servicios y reservas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-verdeprimario-100">
                {stats?.activeServices || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                de {stats?.totalServices || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.pendingBookings || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren confirmación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats?.totalRevenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.averageRating || 0} ⭐
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio de clientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-verdeprimario-100">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/crear-servicio">
                <Button className="w-full bg-verdeprimario-100 hover:bg-verdeprimario-60 text-white rounded-[22px] h-12 transition-all duration-200">
                  Crear Nuevo Servicio
                </Button>
              </Link>
              <Link href="/servicios/lista">
                <Button variant="outline" className="w-full border-verdeprimario-100 text-verdeprimario-100 hover:bg-verdeprimario-60 hover:text-verdeprimario-100 rounded-[22px] h-12 transition-all duration-200">
                  Ver Mis Servicios
                </Button>
              </Link>
              <Link href="/mis-reservas">
                <Button variant="outline" className="w-full border-verdeprimario-100 text-verdeprimario-100 hover:bg-verdeprimario-60 hover:text-verdeprimario-100 rounded-[22px] h-12 transition-all duration-200">
                  Ver Reservas
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-verdeprimario-100">Estado de Reservas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pendientes</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {stats?.pendingBookings || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmadas</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {stats?.confirmedBookings || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completadas</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats?.completedBookings || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-verdeprimario-100">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Nueva reserva recibida</p>
                  <p className="text-sm text-gray-600">Servicio: Siembra de Maíz</p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Pendiente
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Reserva confirmada</p>
                  <p className="text-sm text-gray-600">Servicio: Cosecha de Soja</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Confirmada
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Nueva reseña recibida</p>
                  <p className="text-sm text-gray-600">5 estrellas - Excelente trabajo</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Reseña
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
