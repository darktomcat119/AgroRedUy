
"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminOrSuperAdmin } from '@/components/admin/RoleGuard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Briefcase, Plus, Search, Edit, Trash2, Eye, MapPin, Calendar, DollarSign, Star, Images } from 'lucide-react';
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
import { fileUploadService } from '@/lib/fileUpload';
import { MultiImageDropzone } from '@/components/MultiImageDropzone';
import { SubBadgeManager } from '@/components/SubBadgeManager';
import { ServiceMap } from '@/components/maps/ServiceMap';
import { ConfirmDialog, ConfirmDialogs } from '@/components/ui/confirm-dialog';
import { AdminDateRangePicker } from '@/components/admin/AdminDateRangePicker';
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
  price?: any; // Prisma Decimal type
  priceCurrency?: string;
  priceMin?: number;
  priceMax?: number;
  latitude: number;
  longitude: number;
  mapZoom?: number;
  radius?: number;
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
  subBadges?: Array<{
    id: string;
    name: string;
    iconUrl?: string;
    sortOrder: number;
  }>;
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
  const getServicePrice = (s: any): number => {
    const val = s?.pricePerHour ?? s?.price;
    const num = typeof val === 'string' ? parseFloat(val) : Number(val);
    return isNaN(num) ? 0 : num;
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
    unit_id: '',
    price: 0,
    priceCurrency: 'UYU',
    priceMin: 0,
    priceMax: 0,
    address: '',
    city: '',
    department: '',
    latitude: 0,
    longitude: 0,
    mapZoom: 6,
    radius: 0,
    isActive: true
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [subBadges, setSubBadges] = useState<Array<{ name: string; iconUrl?: string }>>([]);
  const [editSubBadges, setEditSubBadges] = useState<Array<{ name: string; iconUrl?: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; name: string; symbol: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [mapZoom, setMapZoom] = useState<number>(formData.mapZoom);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<Array<{ id: string; imageUrl: string }>>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'destructive' | 'warning' | 'info';
    icon: 'delete' | 'edit' | 'add' | 'remove' | 'block' | 'unblock' | 'warning';
    isLoading: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    variant: 'info',
    icon: 'warning',
    isLoading: false,
    onConfirm: () => {},
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
      loadUnits();
      loadCategories();
    }
  }, [isAuthenticated, isAdmin]);

  // Initialize mapZoom from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZoom = localStorage.getItem('serviceMapZoom:new');
      if (savedZoom) {
        const zoomValue = Number(savedZoom);
        if (!isNaN(zoomValue)) {
          setMapZoom(zoomValue);
        }
      }
    }
  }, []);

  // Initialize map position by user's IP when opening create dialog
  useEffect(() => {
    const initByIP = async () => {
      try {
        // Prefer browser geolocation if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setFormData((prev) => ({ ...prev, latitude: Number(latitude), longitude: Number(longitude) }));
            },
            async () => {
              // Fallback to IP-based service
              const res = await fetch('https://ipapi.co/json/');
              const data = await res.json();
              if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
                setFormData((prev) => ({ ...prev, latitude: Number(data.latitude), longitude: Number(data.longitude) }));
              }
            },
            { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
          );
        } else {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            setFormData((prev) => ({ ...prev, latitude: Number(data.latitude), longitude: Number(data.longitude) }));
          }
        }
      } catch {
        // Ignore; keep defaults
      }
    };

    if (isCreateDialogOpen && formData.latitude === 0 && formData.longitude === 0) {
      initByIP();
    }
  }, [isCreateDialogOpen, formData.latitude, formData.longitude]);

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
        // Normalize services: convert price (Decimal) to pricePerHour (number)
        const normalizedServices = (response.data.services || []).map((service: any) => ({
          ...service,
          pricePerHour: service.pricePerHour ?? (typeof service.price === 'number' 
            ? service.price 
            : typeof service.price === 'string' 
            ? parseFloat(service.price) 
            : service.price?.toNumber ? service.price.toNumber() : 0),
          price: service.price // Keep original for reference
        }));
        setServices(normalizedServices);
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

  const loadUnits = async () => {
    try {
      const res = await apiClient.getUnits();
      if ((res as any).success && (res as any).data) setUnits((res as any).data);
    } catch (e) {
      console.error('Error loading units', e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await apiClient.getCategories();
      if ((res as any).success && (res as any).data) setCategories(((res as any).data || []).map((c: any) => ({ id: c.id, name: c.name })));
    } catch (e) {
      console.error('Error loading categories', e);
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
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      const payload: any = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        priceCurrency: formData.priceCurrency,
        priceMin: formData.priceMin ? Number(formData.priceMin) : undefined,
        priceMax: formData.priceMax ? Number(formData.priceMax) : undefined,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        mapZoom: Number(formData.mapZoom) || 6,
        radius: formData.radius || undefined,
        address: formData.address,
        city: formData.city,
        department: formData.department,
        categoryId: formData.categoryId,
        unit_id: formData.unit_id,
      };

      if (startDate && endDate) {
        payload.schedule = { startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() };
      }

      // Always include subBadges array, even if empty
      payload.subBadges = subBadges.filter(b => b.name.trim() !== '');

      const resp = await apiClient.createAdminService(payload);
      if ((resp as any).success && (resp as any).data) {
        const newService = (resp as any).data;
        for (let i = 0; i < imageFiles.length; i++) {
          try {
            await fileUploadService.uploadServiceImage(imageFiles[i], newService.id, localStorage.getItem('accessToken') || '', i);
          } catch (err) {
            console.warn('Image upload failed', err);
          }
        }
        await loadServices();
        toast.success('Servicio creado exitosamente');
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error((resp as any).error?.message || 'Error al crear servicio');
      }
    } catch (error) {
      toast.error('Error al crear servicio');
      console.error('Error creating service:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const showCreateServiceConfirm = () => {
    // Validate required fields before showing confirmation
    if (!formData.title || !formData.categoryId || !formData.unit_id) {
      toast.error('Complete título, categoría y unidad');
      return;
    }
    
    const config = ConfirmDialogs.createService();
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleCreateService,
      isLoading: false
    });
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      const payload: any = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        priceCurrency: formData.priceCurrency,
        priceMin: formData.priceMin ? Number(formData.priceMin) : undefined,
        priceMax: formData.priceMax ? Number(formData.priceMax) : undefined,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        mapZoom: Number(formData.mapZoom) || 6,
        radius: formData.radius || undefined,
        address: formData.address,
        city: formData.city,
        department: formData.department,
        categoryId: formData.categoryId || undefined,
        unit_id: formData.unit_id || undefined,
        isActive: formData.isActive,
      };

      if (editStartDate && editEndDate) {
        payload.schedule = { startDate: new Date(editStartDate).toISOString(), endDate: new Date(editEndDate).toISOString() };
      }

      // Always include subBadges array, even if empty
      payload.subBadges = editSubBadges.filter(b => b.name.trim() !== '');
      console.log('Updating service with subBadges:', payload.subBadges);

      const resp = await apiClient.updateAdminService(selectedService.id, payload);
      if (!(resp as any).success) {
        toast.error((resp as any).error?.message || 'Error al actualizar servicio');
        return;
      }

      // Delete removed existing images
      for (const imgId of removedImageIds) {
        try {
          await apiClient.deleteAdminServiceImage(selectedService.id, imgId);
        } catch (e) {
          console.warn('Failed to delete image', imgId, e);
        }
      }

      // Upload any newly added images
      for (let i = 0; i < editImageFiles.length; i++) {
        try {
          await fileUploadService.uploadServiceImage(editImageFiles[i], selectedService.id, localStorage.getItem('accessToken') || '', i);
        } catch (e) {
          console.warn('Image upload failed', e);
        }
      }

      await loadServices();
      
      toast.success('Servicio actualizado exitosamente');
      setIsEditDialogOpen(false);
      setSelectedService(null);
      resetForm();
      setRemovedImageIds([]);
      setEditExistingImages([]);
      setEditImageFiles([]);
      setEditImagePreviews([]);
    } catch (error) {
      toast.error('Error al actualizar servicio');
      console.error('Error updating service:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const showUpdateServiceConfirm = () => {
    if (!selectedService) return;
    
    // Validate date range consistency before showing confirmation
    if ((editStartDate && !editEndDate) || (!editStartDate && editEndDate)) {
      toast.error('Seleccione ambas fechas (inicio y fin)');
      return;
    }
    
    const config = ConfirmDialogs.editService(formData.title || selectedService.title);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleUpdateService,
      isLoading: false
    });
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.deleteAdminService(serviceId);
      
      if ((response as any).success) {
        // Refresh services list from server
        await loadServices();
        toast.success('Servicio eliminado exitosamente');
      } else {
        toast.error((response as any).error?.message || 'Error al eliminar servicio');
      }
    } catch (error: any) {
      toast.error(`Error al eliminar servicio: ${error.message || 'Error de conexión'}`);
      console.error('Error deleting service:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const showDeleteServiceConfirm = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    const config = ConfirmDialogs.deleteService(service.title);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: () => handleDeleteService(serviceId),
      isLoading: false
    });
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
      unit_id: '',
      price: 0,
      priceCurrency: 'UYU',
      priceMin: 0,
      priceMax: 0,
      address: '',
      city: '',
      department: '',
      latitude: 0,
      longitude: 0,
      mapZoom: 6,
      radius: 0,
      isActive: true
    });
    setStartDate('');
    setEndDate('');
    setImageFiles([]);
    setImagePreviews([]);
    setSubBadges([]);
    setEditSubBadges([]);
  };

  const openEditDialog = async (service: Service) => {
    setSelectedService(service);
    try {
      const resp = await apiClient.getAdminServiceDetails(service.id);
      if ((resp as any).success && (resp as any).data) {
        const s = (resp as any).data;
        console.log('Service details loaded for edit:', s);
        console.log('SubBadges from API:', s.subBadges);
        setFormData(prev => ({
          ...prev,
          title: s.title,
          description: s.description,
          categoryId: s.categoryId,
          unit_id: s.unit_id || s.units?.id || '',
          price: Number(s.price) || 0,
          priceCurrency: s.priceCurrency || 'UYU',
          priceMin: s.priceMin ? Number(s.priceMin) : 0,
          priceMax: s.priceMax ? Number(s.priceMax) : 0,
          address: s.address,
          city: s.city,
          department: s.department,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          mapZoom: typeof s.mapZoom === 'number' ? s.mapZoom : (s.mapZoom ? Number(s.mapZoom) : 6),
          radius: s.radius !== undefined && s.radius !== null ? Number(s.radius) : 0,
          isActive: s.isActive,
        }));
        const ex = (s.images || []).map((img: any) => ({ id: img.id, imageUrl: img.imageUrl }));
        setEditExistingImages(ex);
        const subBadgesData = (s.subBadges || []).map((badge: any) => ({ name: badge.name, iconUrl: badge.iconUrl || '' }));
        console.log('Setting editSubBadges to:', subBadgesData);
        setEditSubBadges(subBadgesData);
        if (Array.isArray(s.availability) && s.availability.length > 0) {
          const dates = s.availability.map((a: any) => new Date(a.date));
          const min = new Date(Math.min.apply(null, dates as any));
          const max = new Date(Math.max.apply(null, dates as any));
          setEditStartDate(`${min.getFullYear()}-${String(min.getMonth()+1).padStart(2,'0')}-${String(min.getDate()).padStart(2,'0')}`);
          setEditEndDate(`${max.getFullYear()}-${String(max.getMonth()+1).padStart(2,'0')}-${String(max.getDate()).padStart(2,'0')}`);
        } else {
          setEditStartDate('');
          setEditEndDate('');
        }
      } else {
        // fallback to list data
        setFormData(prev => ({
          ...prev,
          title: service.title,
          description: service.description,
          categoryId: service.categoryId,
          price: service.pricePerHour || 0,
          priceMin: service.priceMin || 0,
          priceMax: service.priceMax || 0,
          address: service.address,
          city: service.city,
          department: service.department,
          latitude: service.latitude,
          longitude: service.longitude,
          mapZoom: service.mapZoom ?? 6,
          radius: (service as any).radius !== undefined && (service as any).radius !== null ? Number((service as any).radius) : 0,
          isActive: service.isActive
        }));
        // Try to get subBadges from service object if available
        if ((service as any).subBadges) {
          const subBadgesData = ((service as any).subBadges || []).map((badge: any) => ({ name: badge.name, iconUrl: badge.iconUrl || '' }));
          setEditSubBadges(subBadgesData);
        } else {
          setEditSubBadges([]);
        }
      }
    } catch (e) {
      console.error('Error loading service details', e);
    } finally {
      setIsEditDialogOpen(true);
    }
  };

  const openViewDialog = async (service: Service) => {
    setSelectedService(service);
    try {
      const resp = await apiClient.getAdminServiceDetails(service.id);
      if ((resp as any).success && (resp as any).data) {
        const serviceData = (resp as any).data;
        // Normalize price: convert price (Decimal) to pricePerHour (number)
        // Normalize mapZoom: ensure it's a number
        // Include images array from API response
        const normalizedService = {
          ...serviceData,
          pricePerHour: serviceData.pricePerHour ?? (typeof serviceData.price === 'number' 
            ? serviceData.price 
            : typeof serviceData.price === 'string' 
            ? parseFloat(serviceData.price) 
            : serviceData.price?.toNumber ? serviceData.price.toNumber() : 0),
          mapZoom: typeof serviceData.mapZoom === 'number' ? serviceData.mapZoom : (serviceData.mapZoom ? Number(serviceData.mapZoom) : 6),
          radius: serviceData.radius !== undefined && serviceData.radius !== null ? Number(serviceData.radius) : undefined,
          images: serviceData.images || [], // Ensure images array is included
          subBadges: serviceData.subBadges || [], // Ensure subBadges array is included
          price: serviceData.price // Keep original for reference
        };
        setSelectedService(normalizedService);
      }
    } catch (e) {
      console.error('Error loading service details', e);
    } finally {
      setIsViewDialogOpen(true);
    }
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
                {services.length > 0 ? formatPrice(services.reduce((sum, s) => sum + getServicePrice(s), 0) / services.length) : '$0'}
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
                {formatPrice(services.reduce((sum, s) => sum + getServicePrice(s), 0))}
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
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Crear Nuevo Servicio</DialogTitle>
                  <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                    Completa la información del nuevo servicio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-negro-100 font-raleway-medium-14pt flex items-center gap-2"><Images className="w-4 h-4"/> Imágenes del Servicio</Label>
                        <MultiImageDropzone files={imageFiles} previews={imagePreviews} onChange={(f,p)=>{setImageFiles(f);setImagePreviews(p);}} className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-negro-100 font-raleway-medium-14pt">Descripción</Label>
                        <Textarea id="description" value={formData.description} onChange={(e)=> setFormData(prev=>({...prev, description: e.target.value}))} className="border-grisprimario-10 focus:border-verdeprimario-100" rows={6} />
                      </div>
                      <div>
                        <SubBadgeManager badges={subBadges} onChange={setSubBadges} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <AdminDateRangePicker
                        label="Rango de fechas"
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={(start, end) => {
                          setStartDate(start);
                          setEndDate(end);
                        }}
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-negro-100 font-raleway-medium-14pt">Precio</Label>
                          <Input type="number" step="0.01" value={formData.price} onChange={(e)=> setFormData(prev=>({...prev, price: Number(e.target.value)}))} className="border-grisprimario-10 focus:border-verdeprimario-100" />
                        </div>
                        <div>
                          <Label className="text-negro-100 font-raleway-medium-14pt">Moneda</Label>
                          <Select value={formData.priceCurrency} onValueChange={(v)=> setFormData(prev=>({...prev, priceCurrency: v}))}>
                            <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UYU">UYU</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-negro-100 font-raleway-medium-14pt">Unidad</Label>
                          <Select value={formData.unit_id} onValueChange={(v)=> setFormData(prev=>({...prev, unit_id: v}))}>
                            <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100"><SelectValue placeholder="Unidad" /></SelectTrigger>
                            <SelectContent>
                              {units.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-negro-100 font-raleway-medium-14pt">Mínimo</Label>
                          <Input type="number" step="0.01" value={formData.priceMin} onChange={(e)=> setFormData(prev=>({...prev, priceMin: Number(e.target.value)}))} className="border-grisprimario-10 focus:border-verdeprimario-100" />
                        </div>
                        <div>
                          <Label className="text-negro-100 font-raleway-medium-14pt">Máximo</Label>
                          <Input type="number" step="0.01" value={formData.priceMax} onChange={(e)=> setFormData(prev=>({...prev, priceMax: Number(e.target.value)}))} className="border-grisprimario-10 focus:border-verdeprimario-100" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <ServiceMap
                        initialLat={formData.latitude || -32.5228}
                        initialLng={formData.longitude || -55.7658}
                        zoom={mapZoom}
                        height={300}
                        className="rounded-md overflow-hidden border border-grisprimario-10"
                        onPositionChange={(lat,lng)=> setFormData(prev=>({...prev, latitude: lat, longitude: lng}))}
                        onZoomChange={(z)=> { setMapZoom(z); localStorage.setItem('serviceMapZoom:new', String(z)); }}
                      />
                      <div className="text-xs text-grisprimario-200 mt-2">Zoom actual: {mapZoom}</div>
                    </div>
                    <div>
                      <Label htmlFor="radius" className="text-negro-100 font-raleway-medium-14pt">Radio (KM)</Label>
                      <Input
                        id="radius"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.radius}
                        onChange={(e) => setFormData(prev => ({ ...prev, radius: Number(e.target.value) || 0 }))}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                        placeholder="Ej: 50"
                      />
                    </div>
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
                      onClick={showCreateServiceConfirm}
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
                        onClick={() => showDeleteServiceConfirm(service.id)}
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
                      {formatPrice(getServicePrice(service))}/hora
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
                    {((selectedService as any).subBadges && (selectedService as any).subBadges.length > 0) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(selectedService as any).subBadges.map((badge: any) => (
                          <Badge key={badge.id} variant="secondary" className="bg-verdesecundario-100 text-blanco-100 font-raleway-medium-14pt">
                            {badge.iconUrl && (
                              <img src={badge.iconUrl || "/figmaAssets/subBadge.svg"} alt={badge.name} className="w-4 h-4 mr-1" />
                            )}
                            {!badge.iconUrl && (
                              <img src="/figmaAssets/subBadge.svg" alt={badge.name} className="w-4 h-4 mr-1" />
                            )}
                            {badge.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-grisprimario-200 font-raleway-medium-14pt mb-4">
                      {selectedService.description}
                    </p>
                  <div className="grid grid-cols-2 gap-3 text-grisprimario-200 font-raleway-medium-14pt">
                    <div className="flex items-center"><DollarSign className="w-4 h-4 mr-2"/>Precio: {formatPrice(getServicePrice(selectedService))} {selectedService.priceCurrency || 'UYU'}</div>
                    <div>Min: {formData.priceMin || '-'} {formData.priceMin ? formData.priceCurrency : ''}</div>
                    <div>Max: {formData.priceMax || '-'} {formData.priceMax ? formData.priceCurrency : ''}</div>
                    <div>Unidad: {units.find(u=>u.id===formData.unit_id)?.name || '-'}</div>
                    <div>Radio: {selectedService.radius ? `${selectedService.radius} KM` : '-'}</div>
                    <div>Fechas: {(editStartDate||'')}{editStartDate&&editEndDate?' - ':''}{(editEndDate||'')}</div>
                  </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="font-raleway-bold-14pt text-negro-100">Ubicación:</span>
                      <span className="ml-2">{selectedService.address}, {selectedService.city}, {selectedService.department}</span>
                    </div>
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                    <ServiceMap
                      initialLat={selectedService.latitude}
                      initialLng={selectedService.longitude}
                      zoom={selectedService.mapZoom ?? 6}
                      height={200}
                      className="w-full rounded-md overflow-hidden border border-grisprimario-10"
                    />
                    </div>
                    <div className="text-xs text-grisprimario-200 mt-2">Zoom: {selectedService.mapZoom ?? 6}</div>
                    <div className="flex items-center text-grisprimario-200 font-raleway-medium-14pt">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-raleway-bold-14pt text-negro-100">Actualizado:</span>
                      <span className="ml-2">{formatDate(selectedService.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              {((selectedService as any).images && (selectedService as any).images.length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-md font-bold text-negro-100 font-raleway-bold-16pt mb-2">Imágenes del Servicio</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(selectedService as any).images.map((img: any) => (
                      <img 
                        key={img.id} 
                        src={img.imageUrl} 
                        alt="Service image" 
                        className="w-full h-28 object-cover rounded-md border border-grisprimario-10" 
                      />
                    ))}
                  </div>
                </div>
              )}
                
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
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Editar Servicio</DialogTitle>
              <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                Modifica la información del servicio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-negro-100 font-raleway-medium-14pt flex items-center gap-2"><Images className="w-4 h-4"/> Imágenes del Servicio</Label>
                    <MultiImageDropzone
                      files={editImageFiles}
                      previews={editImagePreviews}
                      onChange={(f,p)=>{setEditImageFiles(f);setEditImagePreviews(p);}}
                      existing={editExistingImages}
                      onRemoveExisting={(id)=> setRemovedImageIds(prev => Array.from(new Set([...prev, id])))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description" className="text-negro-100 font-raleway-medium-14pt">Descripción</Label>
                    <Textarea id="edit-description" value={formData.description} onChange={(e)=> setFormData(prev=>({...prev, description: e.target.value}))} className="border-grisprimario-10 focus:border-verdeprimario-100" rows={6} />
                  </div>
                  <div>
                    <SubBadgeManager badges={editSubBadges} onChange={setEditSubBadges} />
                  </div>
                </div>
                <div className="space-y-4">
                  <AdminDateRangePicker
                    label="Rango de fechas"
                    startDate={editStartDate}
                    endDate={editEndDate}
                    onDateChange={(start, end) => {
                      setEditStartDate(start);
                      setEditEndDate(end);
                    }}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-negro-100 font-raleway-medium-14pt">Precio</Label>
                      <Input type="number" step="0.01" value={formData.price} onChange={(e)=> setFormData(prev=>({...prev, price: Number(e.target.value)}))} className="border-grisprimario-10 focus:border-verdeprimario-100" />
                    </div>
                    <div>
                      <Label className="text-negro-100 font-raleway-medium-14pt">Moneda</Label>
                      <Select value={formData.priceCurrency} onValueChange={(v)=> setFormData(prev=>({...prev, priceCurrency: v}))}>
                        <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UYU">UYU</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-negro-100 font-raleway-medium-14pt">Unidad</Label>
                      <Select value={formData.unit_id} onValueChange={(v)=> setFormData(prev=>({...prev, unit_id: v}))}>
                        <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100"><SelectValue placeholder="Unidad" /></SelectTrigger>
                        <SelectContent>
                          {units.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-negro-100 font-raleway-medium-14pt">Mínimo</Label>
                      <Input type="number" step="0.01" value={formData.priceMin} onChange={(e)=> setFormData(prev=>({...prev, priceMin: Number(e.target.value)}))} className="border-grisprimario-10 focus:border-verdeprimario-100" />
                    </div>
                    <div>
                      <Label className="text-negro-100 font-raleway-medium-14pt">Máximo</Label>
                      <Input type="number" step="0.01" value={formData.priceMax} onChange={(e)=> setFormData(prev=>({...prev, priceMax: Number(e.target.value)}))} className="border-grisprimario-10 focus:border-verdeprimario-100" />
                    </div>
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="text-negro-100 font-raleway-medium-14pt">Precio</Label>
                  <Input id="edit-price" type="number" value={formData.price} onChange={(e)=> setFormData(prev=>({...prev, price: Number(e.target.value)}))} className="border-grisprimario-10 focus:border-verdeprimario-100" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="md:col-span-2">
                <ServiceMap
                  initialLat={formData.latitude || -32.5228}
                  initialLng={formData.longitude || -55.7658}
                        zoom={formData.mapZoom}
                  height={300}
                  className="rounded-md overflow-hidden border border-grisprimario-10"
                        onPositionChange={(lat,lng)=> setFormData(prev=>({...prev, latitude: lat, longitude: lng}))}
                        onZoomChange={(z)=> { setFormData(prev=>({...prev, mapZoom: z})); if (selectedService?.id) { localStorage.setItem(`serviceMapZoom:${selectedService.id}`, String(z)); } else { localStorage.setItem('serviceMapZoom:new', String(z)); } }}
                />
                <div className="text-xs text-grisprimario-200 mt-2">Zoom actual: {formData.mapZoom}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-radius" className="text-negro-100 font-raleway-medium-14pt">Radio (KM)</Label>
                  <Input
                    id="edit-radius"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.radius}
                    onChange={(e) => setFormData(prev => ({ ...prev, radius: Number(e.target.value) || 0 }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                    placeholder="Ej: 50"
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
                  onClick={showUpdateServiceConfirm}
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
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        icon={confirmDialog.icon}
        isLoading={confirmDialog.isLoading}
      />
    </AdminOrSuperAdmin>
  );
}