'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SuperAdminOnly } from '@/components/admin/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Report {
  id: string;
  type: string;
  title: string;
  period: string;
  status: 'pending' | 'completed' | 'failed';
  generatedAt: string;
  generatedBy: string;
  recordCount: number;
  description: string;
}

interface ReportFilters {
  type: string;
  status: string;
  search: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: '',
    period: '',
    startDate: '',
    endDate: '',
    format: 'json'
  });

  const reportTypes = [
    { value: 'user_activity', label: 'Actividad de Usuarios', icon: Users },
    { value: 'service_performance', label: 'Rendimiento de Servicios', icon: TrendingUp },
    { value: 'revenue_analysis', label: 'Análisis de Ingresos', icon: DollarSign },
    { value: 'booking_trends', label: 'Tendencias de Reservas', icon: BarChart3 },
    { value: 'contractor_performance', label: 'Rendimiento de Contratistas', icon: Users }
  ];

  const periods = [
    { value: 'last_7_days', label: 'Últimos 7 días' },
    { value: 'last_30_days', label: 'Últimos 30 días' },
    { value: 'last_90_days', label: 'Últimos 90 días' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const formats = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'pdf', label: 'PDF' }
  ];

  const loadReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await apiClient.getReports({
        page: 1,
        limit: 50,
        type: filters.type === 'all' ? undefined : filters.type,
        status: filters.status === 'all' ? undefined : filters.status
      });
      
      if (response.success && response.data) {
        setReports(response.data.data || []);
      } else {
        console.error('Failed to load reports:', response.error);
        toast.error('Error al cargar reportes');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      
      const reportData = {
        type: generateForm.type as any,
        period: generateForm.period as any,
        startDate: generateForm.period === 'custom' ? generateForm.startDate : undefined,
        endDate: generateForm.period === 'custom' ? generateForm.endDate : undefined,
        format: generateForm.format as any
      };

      const response = await apiClient.generateReport(reportData);
      
      if (response.success) {
        toast.success('Reporte generado exitosamente');
        setIsGenerateDialogOpen(false);
        setGenerateForm({
          type: '',
          period: '',
          startDate: '',
          endDate: '',
          format: 'json'
        });
        loadReports(); // Reload reports
      } else {
        console.error('Failed to generate report:', response.error);
        toast.error('Error al generar reporte');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar reporte');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await apiClient.deleteReport(reportId);
      
      if (response.success) {
        toast.success('Reporte eliminado exitosamente');
        loadReports(); // Reload reports
      } else {
        console.error('Failed to delete report:', response.error);
        toast.error('Error al eliminar reporte');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar reporte');
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const response = await apiClient.getReportDetails(reportId);
      
      if (response.success) {
        // For now, just show the data in console
        // In production, you might want to open a modal or new tab
        console.log('Report details:', response.data);
        toast.success('Detalles del reporte cargados');
      } else {
        console.error('Failed to load report details:', response.error);
        toast.error('Error al cargar detalles del reporte');
      }
    } catch (error) {
      console.error('Error loading report details:', error);
      toast.error('Error al cargar detalles del reporte');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? <reportType.icon className="w-5 h-5" /> : <FileText className="w-5 h-5" />;
  };

  useEffect(() => {
    loadReports();
  }, [filters]);

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-negro-100 font-raleway-bold-24pt">
                Reportes y Análisis
              </h1>
              <p className="text-grisprimario-200 font-raleway-medium-16pt mt-2">
                Genera y gestiona reportes detallados de la plataforma
              </p>
            </div>
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-negro-100 font-raleway-bold-18pt">
                    Generar Nuevo Reporte
                  </DialogTitle>
                  <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                    Selecciona el tipo de reporte y período de tiempo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type" className="text-negro-100 font-raleway-medium-14pt">
                      Tipo de Reporte
                    </Label>
                    <Select value={generateForm.type} onValueChange={(value) => setGenerateForm({...generateForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de reporte" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              <type.icon className="w-4 h-4 mr-2" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="period" className="text-negro-100 font-raleway-medium-14pt">
                      Período
                    </Label>
                    <Select value={generateForm.period} onValueChange={(value) => setGenerateForm({...generateForm, period: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {generateForm.period === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-negro-100 font-raleway-medium-14pt">
                          Fecha Inicio
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={generateForm.startDate}
                          onChange={(e) => setGenerateForm({...generateForm, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-negro-100 font-raleway-medium-14pt">
                          Fecha Fin
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={generateForm.endDate}
                          onChange={(e) => setGenerateForm({...generateForm, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="format" className="text-negro-100 font-raleway-medium-14pt">
                      Formato
                    </Label>
                    <Select value={generateForm.format} onValueChange={(value) => setGenerateForm({...generateForm, format: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona formato" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsGenerateDialogOpen(false)}
                      className="rounded-full"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport || !generateForm.type || !generateForm.period}
                      className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full"
                    >
                      {isGeneratingReport ? 'Generando...' : 'Generar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="bg-blanco-100 border-grisprimario-10">
            <CardHeader>
              <CardTitle className="text-negro-100 font-raleway-bold-18pt">
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-negro-100 font-raleway-medium-14pt">
                    Buscar
                  </Label>
                  <Input
                    id="search"
                    placeholder="Buscar reportes..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-negro-100 font-raleway-medium-14pt">
                    Tipo
                  </Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-negro-100 font-raleway-medium-14pt">
                    Estado
                  </Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="failed">Fallido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => setFilters({type: '', status: '', search: ''})}
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card className="bg-blanco-100 border-grisprimario-10">
            <CardHeader>
              <CardTitle className="text-negro-100 font-raleway-bold-18pt">
                Reportes Generados
              </CardTitle>
              <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                {reports.length} reportes encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="text-center py-8">
                  <div className="text-grisprimario-200 font-raleway-medium-16pt">
                    Cargando reportes...
                  </div>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-grisprimario-200 mx-auto mb-4" />
                  <div className="text-grisprimario-200 font-raleway-medium-16pt">
                    No se encontraron reportes
                  </div>
                  <div className="text-grisprimario-200 font-raleway-medium-14pt mt-2">
                    Genera tu primer reporte para comenzar
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-grisprimario-10 rounded-lg hover:bg-grisprimario-10 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-verdeprimario-100 rounded-lg">
                          {getTypeIcon(report.type)}
                        </div>
                        <div>
                          <h3 className="text-negro-100 font-raleway-bold-16pt">
                            {report.title}
                          </h3>
                          <p className="text-grisprimario-200 font-raleway-medium-14pt">
                            {report.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-grisprimario-200 font-raleway-medium-12pt">
                              {report.period}
                            </span>
                            <span className="text-grisprimario-200 font-raleway-medium-12pt">
                              {report.recordCount} registros
                            </span>
                            <span className="text-grisprimario-200 font-raleway-medium-12pt">
                              {new Date(report.generatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        {getStatusBadge(report.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(report.id)}
                          className="rounded-full"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          className="rounded-full text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}