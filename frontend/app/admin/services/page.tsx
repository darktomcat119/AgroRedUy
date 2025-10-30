
"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminOrSuperAdmin } from '@/components/admin/RoleGuard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Briefcase, Plus, Search, Edit, Trash2, Eye, MapPin, Calendar, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  pricePerHour: number;
  priceMin?: number;
  priceMax?: number;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  department: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

 

export default function AdminServicesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  
  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Check if user is Super Admin
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    pricePerHour: 0,
    priceMin: 0,
    priceMax: 0,
    address: '',
    city: '',
    department: '',
    latitude: 0,
    longitude: 0,
    isActive: true
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadServices();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter, statusFilter]);

  

  const loadServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await apiClient.getAdminServices({
        page: 1,
        limit: 50,
        search: searchTerm,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
      });
      
      if (response.success && response.data) {
        setServices(response.data.services || []);
      } else {
        console.error('Failed to load services:', response.error);
        toast.error('Error al cargar servicios');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setIsLoadingServices(false);
    }
  };

  

  const filterServices = () => {
    let filtered = services;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${service.user.firstName} ${service.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.categoryId === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => 
        statusFilter === 'active' ? service.isActive : !service.isActive
      );
    }

    setFilteredServices(filtered);
  };

  const handleCreateService = async () => {
    try {
      // TODO: Implement actual API call to create service
      // const response = await apiClient.createService(formData);
      // if (response.success) {
      //   setServices(prev => [...prev, response.data]);
      //   setIsCreateDialogOpen(false);
      //   resetForm();
      //   toast.success('Servicio creado exitosamente');
      // }
      toast.success('Funcionalidad de creación de servicios próximamente');
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al crear servicio');
      console.error('Error creating service:', error);
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    try {
      // TODO: Implement actual API call to update service
      // const response = await apiClient.updateService(selectedService.id, formData);
      // if (response.success) {
      //   setServices(prev => prev.map(service => 
      //     service.id === selectedService.id ? response.data : service
      //   ));
      //   setIsEditDialogOpen(false);
      //   setSelectedService(null);
      //   resetForm();
      //   toast.success('Servicio actualizado exitosamente');
      // }
      toast.success('Funcionalidad de actualización de servicios próximamente');
      setIsEditDialogOpen(false);
      setSelectedService(null);
      resetForm();
    } catch (error) {
      toast.error('Error al actualizar servicio');
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;

    try {
      // TODO: Implement actual API call to delete service
      // const response = await apiClient.deleteService(serviceId);
      // if (response.success) {
      //   setServices(prev => prev.filter(service => service.id !== serviceId));
      //   toast.success('Servicio eliminado exitosamente');
      // }
      toast.success('Funcionalidad de eliminación de servicios próximamente');
    } catch (error) {
      toast.error('Error al eliminar servicio');
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleServiceStatus = async (serviceId: string) => {
    try {
      // TODO: Implement actual API call to toggle service status
      // const service = services.find(s => s.id === serviceId);
      // if (service) {
      //   const response = await apiClient.updateService(serviceId, { isActive: !service.isActive });
      //   if (response.success) {
      //     setServices(prev => prev.map(s => s.id === serviceId ? response.data : s));
      //     toast.success('Estado del servicio actualizado');
      //   }
      // }
      toast.success('Funcionalidad de cambio de estado próximamente');
    } catch (error) {
      toast.error('Error al actualizar estado del servicio');
      console.error('Error toggling service status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      pricePerHour: 0,
      priceMin: 0,
      priceMax: 0,
      address: '',
      city: '',
      department: '',
      latitude: 0,
      longitude: 0,
      isActive: true
    });
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      title: service.title,
      description: service.description,
      categoryId: service.categoryId,
      pricePerHour: service.pricePerHour,
      priceMin: service.priceMin || 0,
      priceMax: service.priceMax || 0,
      address: service.address,
      city: service.city,
      department: service.department,
      latitude: service.latitude,
      longitude: service.longitude,
      isActive: service.isActive
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (service: Service) => {
    setSelectedService(service);
    setIsViewDialogOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Cosecha': return 'bg-green-100 text-green-800';
      case 'Siembra': return 'bg-blue-100 text-blue-800';
      case 'Fertilización': return 'bg-yellow-100 text-yellow-800';
      case 'Riego': return 'bg-cyan-100 text-cyan-800';
      case 'Pulverización': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-UY');
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
    <AdminOrSuperAdmin>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-8 h-8 text-verdeprimario-100" />
            <h1 className="text-3xl font-bold text-negro-100 font-raleway-bold-20pt">
              {isSuperAdmin ? 'Gestión de Servicios' : 'Mis Servicios'}
            </h1>
          </div>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">
            {isSuperAdmin ? 'Administra todos los servicios del sistema' : 'Gestiona tus servicios agrícolas'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">
                {isSuperAdmin ? 'Total Servicios' : 'Mis Servicios'}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{services.length}</div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                {services.filter(s => s.isActive).length} activos
              </p>
            </CardContent>
          </Card>
          
          {isSuperAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Servicios Inactivos</CardTitle>
                <Star className="h-4 w-4 text-grisprimario-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">
                  {services.filter(s => !s.isActive).length}
                </div>
                <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Precio Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">
                {services.length > 0 ? formatPrice(services.reduce((sum, s) => sum + s.pricePerHour, 0) / services.length) : '$0'}
              </div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Por hora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">
                {isSuperAdmin ? 'Ingresos Totales' : 'Mis Ingresos'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">
                {formatPrice(services.reduce((sum, s) => sum + s.pricePerHour, 0))}
              </div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                {isSuperAdmin ? 'Valor total servicios' : 'Valor mis servicios'}
              </p>
            </CardContent>
          </Card>
        </div>

        

        {/* Actions Bar */}
        <div className="bg-blanco-100 rounded-lg shadow-sm border border-grisprimario-10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grisprimario-200 w-4 h-4" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-grisprimario-10 focus:border-verdeprimario-100"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 border-grisprimario-10 focus:border-verdeprimario-100">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="Cosecha">Cosecha</SelectItem>
                    <SelectItem value="Siembra">Siembra</SelectItem>
                    <SelectItem value="Fertilización">Fertilización</SelectItem>
                    <SelectItem value="Riego">Riego</SelectItem>
                    <SelectItem value="Pulverización">Pulverización</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-grisprimario-10 focus:border-verdeprimario-100">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2 font-raleway-medium-16pt">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Servicio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Crear Nuevo Servicio</DialogTitle>
                  <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                    Completa la información del nuevo servicio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-negro-100 font-raleway-medium-14pt">Título del Servicio</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-negro-100 font-raleway-medium-14pt">Categoría</Label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                        <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cosecha">Cosecha</SelectItem>
                          <SelectItem value="Siembra">Siembra</SelectItem>
                          <SelectItem value="Fertilización">Fertilización</SelectItem>
                          <SelectItem value="Riego">Riego</SelectItem>
                          <SelectItem value="Pulverización">Pulverización</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-negro-100 font-raleway-medium-14pt">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="border-grisprimario-10 focus:border-verdeprimario-100"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-negro-100 font-raleway-medium-14pt">Precio (UYU)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.pricePerHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: Number(e.target.value) }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-negro-100 font-raleway-medium-14pt">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-negro-100 font-raleway-medium-14pt">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department" className="text-negro-100 font-raleway-medium-14pt">Departamento</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude" className="text-negro-100 font-raleway-medium-14pt">Latitud</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="text-negro-100 font-raleway-medium-14pt">Longitud</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive" className="text-negro-100 font-raleway-medium-14pt">Activo</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateService}
                      className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full"
                    >
                      Crear Servicio
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingServices ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
              <p className="text-grisprimario-200 font-raleway-medium-16pt">Cargando servicios...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Briefcase className="w-16 h-16 text-grisprimario-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-negro-100 mb-2 font-raleway-bold-16pt">
                No se encontraron servicios
              </h3>
              <p className="text-grisprimario-200 font-raleway-medium-16pt">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay servicios registrados en el sistema'
                }
              </p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-negro-100 font-raleway-bold-16pt mb-2">
                        {service.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getCategoryBadgeColor(service.category.name)} font-raleway-medium-14pt`}>
                          {service.category.name}
                        </Badge>
                        <Badge className={`${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} font-raleway-medium-14pt`}>
                          {service.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(service)}
                        className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full p-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(service)}
                        className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="border-grisprimario-10 text-red-600 hover:bg-red-50 rounded-full p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-grisprimario-200 font-raleway-medium-14pt mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <MapPin className="w-4 h-4 mr-2" />
                      {service.address}, {service.city}, {service.department}
                    </div>
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {formatPrice(service.pricePerHour)}/hora
                    </div>
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <Calendar className="w-4 h-4 mr-2" />
                      Creado: {formatDate(service.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={() => handleToggleServiceStatus(service.id)}
                        className="data-[state=checked]:bg-verdeprimario-100"
                      />
                      <span className={`text-sm font-raleway-medium-14pt ${service.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {service.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                      {formatDate(service.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Service Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Detalles del Servicio</DialogTitle>
              <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                Información completa del servicio
              </DialogDescription>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-negro-100 font-raleway-bold-16pt mb-2">
                      {selectedService.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`${getCategoryBadgeColor(selectedService.category.name)} font-raleway-medium-14pt`}>
                        {selectedService.category.name}
                      </Badge>
                      <Badge className={`${selectedService.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} font-raleway-medium-14pt`}>
                        {selectedService.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-grisprimario-200 font-raleway-medium-14pt mb-4">
                      {selectedService.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="font-raleway-bold-14pt text-negro-100">Ubicación:</span>
                      <span className="ml-2">{selectedService.address}, {selectedService.city}, {selectedService.department}</span>
                    </div>
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="font-raleway-bold-14pt text-negro-100">Precio:</span>
                      <span className="ml-2">{formatPrice(selectedService.pricePerHour)}/hora</span>
                    </div>
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-raleway-bold-14pt text-negro-100">Actualizado:</span>
                      <span className="ml-2">{formatDate(selectedService.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-bold text-negro-100 font-raleway-bold-16pt mb-2">Contratista</h4>
                  <p className="text-grisprimario-200 font-raleway-medium-14pt">
                    {selectedService.user.firstName} {selectedService.user.lastName} ({selectedService.user.email})
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setIsViewDialogOpen(false)}
                    className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Service Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Editar Servicio</DialogTitle>
              <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                Modifica la información del servicio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title" className="text-negro-100 font-raleway-medium-14pt">Título del Servicio</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category" className="text-negro-100 font-raleway-medium-14pt">Categoría</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cosecha">Cosecha</SelectItem>
                      <SelectItem value="Siembra">Siembra</SelectItem>
                      <SelectItem value="Fertilización">Fertilización</SelectItem>
                      <SelectItem value="Riego">Riego</SelectItem>
                      <SelectItem value="Pulverización">Pulverización</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description" className="text-negro-100 font-raleway-medium-14pt">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="border-grisprimario-10 focus:border-verdeprimario-100"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="text-negro-100 font-raleway-medium-14pt">Precio (UYU)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: Number(e.target.value) }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address" className="text-negro-100 font-raleway-medium-14pt">Dirección</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-city" className="text-negro-100 font-raleway-medium-14pt">Ciudad</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-department" className="text-negro-100 font-raleway-medium-14pt">Departamento</Label>
                  <Input
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-latitude" className="text-negro-100 font-raleway-medium-14pt">Latitud</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitude" className="text-negro-100 font-raleway-medium-14pt">Longitud</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="edit-isActive" className="text-negro-100 font-raleway-medium-14pt">Activo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateService}
                  className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        
        </div>
      </AdminLayout>
    </AdminOrSuperAdmin>
  );
}