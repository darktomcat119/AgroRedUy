"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { useAuth, useAdminAuth } from "@/lib/auth";
import toast from "react-hot-toast";
import { Calendar, Check, X, User, Phone, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ScheduleRequest {
  id: string;
  serviceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  message?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  service: {
    id: string;
    title: string;
  };
}

export default function AdminScheduleRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ScheduleRequest | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && isAdmin) {
      loadRequests();
    }
  }, [isAuthenticated, isLoading, isAdmin, router, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Optimized: Get all schedule requests in a single API call
      const resp = await apiClient.getAllAdminScheduleRequests(
        statusFilter !== "all" ? statusFilter : undefined
      );
      
      if (resp.success && resp.data) {
        setRequests(resp.data as ScheduleRequest[]);
      } else {
        console.error("Failed to load schedule requests:", resp.error);
        toast.error("Error al cargar solicitudes de horario");
      }
    } catch (error) {
      console.error("Error loading schedule requests:", error);
      toast.error("Error al cargar solicitudes de horario");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const resp = await apiClient.acceptScheduleRequest(requestId);
      if (resp.success) {
        toast.success("Solicitud aceptada correctamente");
        await loadRequests();
      } else {
        toast.error((resp as any).error?.message || "Error al aceptar solicitud");
      }
    } catch (error: any) {
      console.error("Error accepting request:", error);
      toast.error("Error al aceptar solicitud");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      const resp = await apiClient.rejectScheduleRequest(selectedRequest.id, rejectReason || undefined);
      if (resp.success) {
        toast.success("Solicitud rechazada correctamente");
        setIsRejectDialogOpen(false);
        setRejectReason("");
        setSelectedRequest(null);
        await loadRequests();
      } else {
        toast.error((resp as any).error?.message || "Error al rechazar solicitud");
      }
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error("Error al rechazar solicitud");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "default",
      ACCEPTED: "secondary",
      REJECTED: "destructive",
      CANCELLED: "outline",
    };

    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      ACCEPTED: "Aceptada",
      REJECTED: "Rechazada",
      CANCELLED: "Cancelada",
    };

    return (
      <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
    );
  };

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Horario</h1>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
            >
              Pendientes
            </Button>
            <Button
              variant={statusFilter === "ACCEPTED" ? "default" : "outline"}
              onClick={() => setStatusFilter("ACCEPTED")}
            >
              Aceptadas
            </Button>
            <Button
              variant={statusFilter === "REJECTED" ? "default" : "outline"}
              onClick={() => setStatusFilter("REJECTED")}
            >
              Rechazadas
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes de Horario ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay solicitudes de horario
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{request.service.title}</h3>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>
                              {request.user.firstName} {request.user.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{request.user.phone || "No disponible"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(request.startDate).toLocaleDateString("es-UY")} -{" "}
                              {new Date(request.endDate).toLocaleDateString("es-UY")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-gray-400">
                              {new Date(request.createdAt).toLocaleDateString("es-UY", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {request.message && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                            <MessageSquare className="w-4 h-4 mt-0.5" />
                            <p className="italic">{request.message}</p>
                          </div>
                        )}

                        <div className="text-xs text-gray-400">
                          Email: {request.user.email}
                        </div>
                      </div>

                      {request.status === "PENDING" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud de Horario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas rechazar esta solicitud? Puedes agregar una razón
              (opcional).
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="reject-reason">Razón (opcional)</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Agrega una razón para el rechazo..."
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Rechazar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

