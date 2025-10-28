"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { SuperAdminOnly } from '@/components/admin/RoleGuard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Eye, Lock, Users, Activity, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: string;
  resolved: boolean;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeSessions: number;
}

export default function AdminSecurityPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highEvents: 0,
    mediumEvents: 0,
    lowEvents: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    blockedIPs: 0,
    activeSessions: 0
  });
  
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadSecurityEvents();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    filterEvents();
  }, [securityEvents, severityFilter, typeFilter, searchTerm]);

  const loadSecurityEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await apiClient.getSecurityLogs({
        page: 1,
        limit: 50,
        level: severityFilter !== 'all' ? severityFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      });
      
      if (response.success && response.data) {
        const logs = response.data.logs || [];
        
        // Transform logs to SecurityEvent format
        const events: SecurityEvent[] = logs.map((log: any) => ({
          id: log.id,
          type: log.type as SecurityEvent['type'],
          severity: log.level === 'error' ? 'critical' : log.level === 'warning' ? 'high' : 'low',
          description: log.message,
          userId: log.userId,
          userEmail: log.details?.email,
          ipAddress: log.ipAddress,
          userAgent: log.details?.userAgent || 'Unknown',
          location: log.details?.location,
          timestamp: log.timestamp,
          resolved: log.resolved
        }));
        
        setSecurityEvents(events);
        
        // Calculate stats from response
        const stats: SecurityStats = {
          totalEvents: response.data.summary?.totalLogs || 0,
          criticalEvents: response.data.summary?.criticalLogs || 0,
          highEvents: response.data.summary?.warningLogs || 0,
          mediumEvents: 0,
          lowEvents: 0,
          failedLogins: events.filter(e => e.type === 'failed_login').length,
          suspiciousActivities: events.filter(e => e.type === 'suspicious_activity').length,
          blockedIPs: 0, // Would come from separate API
          activeSessions: 0 // Would come from separate API
        };
        
        setSecurityStats(stats);
      } else {
        console.error('Failed to load security events:', response.error);
        toast.error('Error al cargar eventos de seguridad');
      }
    } catch (error) {
      toast.error('Error al cargar eventos de seguridad');
      console.error('Error loading security events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const filterEvents = () => {
    let filtered = securityEvents;

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleResolveEvent = async (eventId: string) => {
    try {
      const response = await apiClient.resolveSecurityLog(
        eventId,
        'Evento resuelto por administrador',
        'Resuelto desde el panel de administración'
      );
      
      if (response.success) {
        toast.success('Evento marcado como resuelto');
        loadSecurityEvents(); // Reload events
      } else {
        console.error('Failed to resolve event:', response.error);
        toast.error('Error al resolver evento');
      }
    } catch (error) {
      toast.error('Error al resolver evento');
      console.error('Error resolving event:', error);
    }
  };

  const handleBlockIP = async (ipAddress: string) => {
    try {
      const response = await apiClient.blockIpAddress(
        ipAddress,
        'IP bloqueada desde panel de seguridad',
        'permanent'
      );
      
      if (response.success) {
        toast.success(`IP ${ipAddress} bloqueada exitosamente`);
      } else {
        console.error('Failed to block IP:', response.error);
        toast.error('Error al bloquear IP');
      }
    } catch (error) {
      toast.error('Error al bloquear IP');
      console.error('Error blocking IP:', error);
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login': return Users;
      case 'failed_login': return Lock;
      case 'suspicious_activity': return AlertTriangle;
      case 'data_access': return Eye;
      case 'system_change': return Shield;
      default: return Activity;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-UY');
  };

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

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-verdeprimario-100" />
            <h1 className="text-3xl font-bold text-negro-100 font-raleway-bold-20pt">Monitoreo de Seguridad</h1>
          </div>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">Supervisa eventos de seguridad y amenazas en tiempo real</p>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Eventos Totales</CardTitle>
              <Activity className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{securityStats.totalEvents}</div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 font-raleway-bold-20pt">{securityStats.criticalEvents}</div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Requieren atención inmediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Sesiones Activas</CardTitle>
              <Users className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{securityStats.activeSessions}</div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Usuarios conectados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">IPs Bloqueadas</CardTitle>
              <Lock className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{securityStats.blockedIPs}</div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Direcciones bloqueadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-blanco-100 rounded-lg shadow-sm border border-grisprimario-10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-grisprimario-10 focus:border-verdeprimario-100"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40 border-grisprimario-10 focus:border-verdeprimario-100">
                    <SelectValue placeholder="Severidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="low">Bajo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 border-grisprimario-10 focus:border-verdeprimario-100">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="failed_login">Login Fallido</SelectItem>
                    <SelectItem value="suspicious_activity">Actividad Sospechosa</SelectItem>
                    <SelectItem value="data_access">Acceso a Datos</SelectItem>
                    <SelectItem value="system_change">Cambio del Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-negro-100 font-raleway-bold-16pt">Eventos de Seguridad</CardTitle>
            <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
              Registro de actividades de seguridad y amenazas detectadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
                <p className="text-grisprimario-200 font-raleway-medium-16pt">Cargando eventos...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-grisprimario-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-negro-100 mb-2 font-raleway-bold-16pt">
                  No se encontraron eventos
                </h3>
                <p className="text-grisprimario-200 font-raleway-medium-16pt">
                  {searchTerm || severityFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay eventos de seguridad registrados'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const TypeIcon = getTypeIcon(event.type);
                  return (
                    <div key={event.id} className="border border-grisprimario-10 rounded-lg p-4 hover:bg-grisprimario-10/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0">
                            <TypeIcon className="w-5 h-5 text-grisprimario-200" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getSeverityColor(event.severity)} font-raleway-medium-14pt`}>
                                {event.severity.toUpperCase()}
                              </Badge>
                              {event.resolved && (
                                <Badge className="bg-green-100 text-green-800 font-raleway-medium-14pt">
                                  Resuelto
                                </Badge>
                              )}
                            </div>
                            <p className="text-negro-100 font-raleway-bold-16pt mb-2">{event.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                {event.userEmail && (
                                  <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                                    <Users className="w-3 h-3 mr-2" />
                                    {event.userEmail}
                                  </div>
                                )}
                                <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                                  <MapPin className="w-3 h-3 mr-2" />
                                  {event.ipAddress} {event.location && `(${event.location})`}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                                  <Clock className="w-3 h-3 mr-2" />
                                  {formatDate(event.timestamp)}
                                </div>
                                <div className="text-grisprimario-200 font-raleway-medium-14pt truncate">
                                  {event.userAgent}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!event.resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveEvent(event.id)}
                              className="border-grisprimario-10 text-green-600 hover:bg-green-50 rounded-full"
                            >
                              Resolver
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockIP(event.ipAddress)}
                            className="border-grisprimario-10 text-red-600 hover:bg-red-50 rounded-full"
                          >
                            Bloquear IP
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  </SuperAdminOnly>
  );
}