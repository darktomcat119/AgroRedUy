"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { SuperAdminOnly } from '@/components/admin/RoleGuard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FolderPlus, Search, Edit, Trash2, Plus, Folder, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { ConfirmDialog, ConfirmDialogs } from '@/components/ui/confirm-dialog';
import { customToast, toastMessages } from '@/lib/toast';
import { fileUploadService } from '@/lib/fileUpload';

interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  services?: any[];
}

interface SubBadge {
  id: string;
  name: string;
  iconUrl?: string;
  sortOrder: number;
  serviceId: string;
  service?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'categories' | 'subBadges'>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Sub-badges state
  const [subBadges, setSubBadges] = useState<SubBadge[]>([]);
  const [filteredSubBadges, setFilteredSubBadges] = useState<SubBadge[]>([]);
  const [subBadgeSearchTerm, setSubBadgeSearchTerm] = useState('');
  const [isCreateSubBadgeDialogOpen, setIsCreateSubBadgeDialogOpen] = useState(false);
  const [isEditSubBadgeDialogOpen, setIsEditSubBadgeDialogOpen] = useState(false);
  const [selectedSubBadge, setSelectedSubBadge] = useState<SubBadge | null>(null);
  const [isLoadingSubBadges, setIsLoadingSubBadges] = useState(true);
  const [services, setServices] = useState<Array<{ id: string; title: string }>>([]);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'destructive' | 'warning' | 'info';
    icon: 'delete' | 'edit' | 'add' | 'remove' | 'block' | 'unblock' | 'warning';
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'destructive',
    icon: 'warning',
    onConfirm: () => {},
    isLoading: false
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: ''
  });

  const [subBadgeFormData, setSubBadgeFormData] = useState({
    name: '',
    iconUrl: '',
    serviceId: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadCategories();
      loadSubBadges();
      loadServices();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    filterCategories();
  }, [categories, categorySearchTerm]);

  useEffect(() => {
    filterSubBadges();
  }, [subBadges, subBadgeSearchTerm]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await apiClient.getCategories();

      if (response.success && response.data) {
        setCategories(response.data || []);
      } else {
        console.error('Failed to load categories:', response.error);
        customToast.error('Error al cargar categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      customToast.error('Error al cargar categorías');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await apiClient.getAdminServices({ page: 1, limit: 1000 });
      if (response.success && response.data) {
        const servicesList = (response.data.services || []).map((s: any) => ({
          id: s.id,
          title: s.title
        }));
        setServices(servicesList);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadSubBadges = async () => {
    try {
      setIsLoadingSubBadges(true);
      const response = await apiClient.getSubBadges();

      if (response.success && response.data) {
        setSubBadges(response.data || []);
      } else {
        console.error('Failed to load sub-badges:', response.error);
        customToast.error('Error al cargar sub-badges');
      }
    } catch (error) {
      console.error('Error loading sub-badges:', error);
      customToast.error('Error al cargar sub-badges');
    } finally {
      setIsLoadingSubBadges(false);
    }
  };

  const filterCategories = () => {
    if (!categorySearchTerm) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
    );

    setFilteredCategories(filtered);
  };

  const filterSubBadges = () => {
    if (!subBadgeSearchTerm) {
      setFilteredSubBadges(subBadges);
      return;
    }

    const filtered = subBadges.filter(badge =>
      badge.name.toLowerCase().includes(subBadgeSearchTerm.toLowerCase()) ||
      (badge.service?.title && badge.service.title.toLowerCase().includes(subBadgeSearchTerm.toLowerCase()))
    );

    setFilteredSubBadges(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      iconUrl: ''
    });
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      iconUrl: category.iconUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  const showCreateCategoryConfirm = () => {
    const config = ConfirmDialogs.createUser();
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleCreateCategory,
      isLoading: false,
      icon: 'add' as const
    });
  };

  const showUpdateCategoryConfirm = () => {
    const config = ConfirmDialogs.editUser(formData.name);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleUpdateCategory,
      isLoading: false,
      icon: 'edit' as const
    });
  };

  const showDeleteCategoryConfirm = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const config = ConfirmDialogs.deleteUser(category.name);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: () => handleDeleteCategory(categoryId),
      isLoading: false,
      icon: 'delete' as const
    });
  };

  const handleCreateCategory = async () => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.createCategory(formData);

      if (response.success) {
        customToast.success(toastMessages.serviceCreated(formData.name));
        setIsCreateDialogOpen(false);
        resetForm();
        loadCategories();
      } else {
        customToast.error(response.error?.message || 'Error al crear categoría');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      customToast.error('Error al crear categoría');
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.updateCategory(selectedCategory.id, formData);

      if (response.success) {
        customToast.success(toastMessages.serviceUpdated(formData.name));
        setIsEditDialogOpen(false);
        resetForm();
        loadCategories();
      } else {
        customToast.error(response.error?.message || 'Error al actualizar categoría');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      customToast.error('Error al actualizar categoría');
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.deleteCategory(categoryId);

      if (response.success) {
        customToast.success(toastMessages.serviceDeleted('Categoría'));
        loadCategories();
      } else {
        customToast.error(response.error?.message || 'Error al eliminar categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      customToast.error('Error al eliminar categoría');
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  // Sub-badge handlers
  const resetSubBadgeForm = () => {
    setSubBadgeFormData({
      name: '',
      iconUrl: '',
      serviceId: ''
    });
  };

  const openEditSubBadgeDialog = (subBadge: SubBadge) => {
    setSelectedSubBadge(subBadge);
    setSubBadgeFormData({
      name: subBadge.name,
      iconUrl: subBadge.iconUrl || '',
      serviceId: subBadge.serviceId
    });
    setIsEditSubBadgeDialogOpen(true);
  };

  const showCreateSubBadgeConfirm = () => {
    const config = ConfirmDialogs.createUser();
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleCreateSubBadge,
      isLoading: false,
      icon: 'add' as const
    });
  };

  const showUpdateSubBadgeConfirm = () => {
    const config = ConfirmDialogs.editUser(subBadgeFormData.name);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleUpdateSubBadge,
      isLoading: false,
      icon: 'edit' as const
    });
  };

  const showDeleteSubBadgeConfirm = (subBadgeId: string) => {
    const subBadge = subBadges.find(b => b.id === subBadgeId);
    if (!subBadge) return;

    const config = ConfirmDialogs.deleteUser(subBadge.name);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: () => handleDeleteSubBadge(subBadgeId),
      isLoading: false,
      icon: 'delete' as const
    });
  };

  const handleCreateSubBadge = async () => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      if (!subBadgeFormData.name || !subBadgeFormData.serviceId) {
        customToast.error('Nombre y servicio son requeridos');
        return;
      }

      const response = await apiClient.createSubBadge({
        name: subBadgeFormData.name,
        iconUrl: subBadgeFormData.iconUrl || undefined,
        serviceId: subBadgeFormData.serviceId
      });

      if (response.success) {
        customToast.success(toastMessages.serviceCreated(subBadgeFormData.name));
        setIsCreateSubBadgeDialogOpen(false);
        resetSubBadgeForm();
        loadSubBadges();
      } else {
        customToast.error(response.error?.message || 'Error al crear sub-badge');
      }
    } catch (error) {
      console.error('Error creating sub-badge:', error);
      customToast.error('Error al crear sub-badge');
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const handleUpdateSubBadge = async () => {
    if (!selectedSubBadge) return;

    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.updateSubBadge(selectedSubBadge.id, {
        name: subBadgeFormData.name,
        iconUrl: subBadgeFormData.iconUrl || undefined
      });

      if (response.success) {
        customToast.success(toastMessages.serviceUpdated(subBadgeFormData.name));
        setIsEditSubBadgeDialogOpen(false);
        resetSubBadgeForm();
        loadSubBadges();
      } else {
        customToast.error(response.error?.message || 'Error al actualizar sub-badge');
      }
    } catch (error) {
      console.error('Error updating sub-badge:', error);
      customToast.error('Error al actualizar sub-badge');
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const handleDeleteSubBadge = async (subBadgeId: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.deleteSubBadge(subBadgeId);

      if (response.success) {
        customToast.success(toastMessages.serviceDeleted('Sub-badge'));
        loadSubBadges();
      } else {
        customToast.error(response.error?.message || 'Error al eliminar sub-badge');
      }
    } catch (error) {
      console.error('Error deleting sub-badge:', error);
      customToast.error('Error al eliminar sub-badge');
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-verdeprimario-100 mx-auto"></div>
            <p className="mt-4 text-grisprimario-200 font-raleway-medium-16pt">Cargando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-raleway-bold-24pt text-negro-100 mb-4">Acceso Denegado</h1>
            <p className="text-grisprimario-200 font-raleway-medium-16pt">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <p className="text-grisprimario-200 font-raleway-medium-14pt mt-2">
              Tu rol actual: {user?.role}
            </p>
            <p className="text-grisprimario-200 font-raleway-medium-14pt">
              Contacta al Super Admin para obtener acceso.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SuperAdminOnly>
        <div className="container mx-auto py-8 px-4">
          <Card className="bg-blanco-100 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-raleway-bold-24pt text-negro-100">Datos Base</CardTitle>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'categories' | 'subBadges')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="categories" className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Categorías
                  </TabsTrigger>
                  <TabsTrigger value="subBadges" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Sub-Badges
                  </TabsTrigger>
                </TabsList>

                {/* Categories Tab */}
                <TabsContent value="categories">
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grisprimario-200 w-4 h-4" />
                      <Input
                        placeholder="Buscar categorías..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="pl-10 border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2 font-raleway-medium-16pt">
                          <FolderPlus className="w-4 h-4 mr-2" />
                          Nueva Categoría
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Crear Nueva Categoría</DialogTitle>
                          <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                            Completa la información de la nueva categoría
                          </DialogDescription>
                        </DialogHeader>

                        {/* Icon Upload Section */}
                        <div className="space-y-4 py-4 border-b border-grisprimario-10">
                          <Label className="text-negro-100 font-raleway-medium-14pt">Icono de la Categoría</Label>
                          
                          {/* URL Input */}
                          <div>
                            <Label htmlFor="iconUrl" className="text-negro-100 font-raleway-medium-14pt">URL del Icono</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="iconUrl"
                                value={formData.iconUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                                className="border-grisprimario-10 focus:border-verdeprimario-100"
                                placeholder="https://ejemplo.com/icono.png"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('file-upload-create')?.click()}
                                className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full px-4 py-2"
                              >
                                📁 Subir Archivo
                              </Button>
                            </div>
                            <input
                              id="file-upload-create"
                              type="file"
                              accept="image/*,.svg"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const result = await fileUploadService.uploadFile(file, 'category-icon');
                                    if (result.success) {
                                      setFormData(prev => ({ ...prev, iconUrl: result.url || '' }));
                                      customToast.success('Icono subido exitosamente');
                                    } else {
                                      customToast.error(result.error || 'Error al subir icono');
                                    }
                                  } catch (error) {
                                    customToast.error('Error al subir archivo');
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </div>

                          {/* Icon Preview */}
                          {formData.iconUrl && (
                            <div className="flex flex-col items-center space-y-2">
                              <Label className="text-negro-100 font-raleway-medium-14pt">Vista Previa</Label>
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-grisprimario-10 flex items-center justify-center border-2 border-grisprimario-10">
                                <img
                                  src={formData.iconUrl}
                                  alt="Icon preview"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    target.style.display = 'none';
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                                  <span className="text-grisprimario-200 text-xs">Error</span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFormData(prev => ({ ...prev, iconUrl: '' }))}
                                className="border-red-200 text-red-500 hover:bg-red-50 rounded-full px-3 py-1 text-xs"
                              >
                                ✕ Eliminar
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-negro-100 font-raleway-medium-14pt">Nombre</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="border-grisprimario-10 focus:border-verdeprimario-100"
                              placeholder="Ej: Fumigación"
                            />
                          </div>

                          <div>
                            <Label htmlFor="description" className="text-negro-100 font-raleway-medium-14pt">Descripción</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="border-grisprimario-10 focus:border-verdeprimario-100"
                              placeholder="Describe la categoría..."
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setIsCreateDialogOpen(false)}
                              className="rounded-full px-6 py-2 font-raleway-medium-16pt text-grisprimario-200 border-grisprimario-10 hover:bg-grisprimario-10"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={showCreateCategoryConfirm}
                              className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2 font-raleway-medium-16pt"
                            >
                              Crear Categoría
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Categories List */}
                  {isLoadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100"></div>
                  <span className="ml-2 text-grisprimario-200 font-raleway-medium-14pt">Cargando categorías...</span>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-16 h-16 text-grisprimario-200 mx-auto mb-4" />
                  <h3 className="text-lg font-raleway-bold-16pt text-negro-100 mb-2">No hay categorías</h3>
                  <p className="text-grisprimario-200 font-raleway-medium-14pt">
                    {categorySearchTerm ? 'No se encontraron categorías con ese criterio.' : 'Crea tu primera categoría para comenzar.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <Card key={category.id} className="border border-grisprimario-10 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {category.iconUrl ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-grisprimario-10 flex items-center justify-center">
                                <img
                                  src={category.iconUrl}
                                  alt={category.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    target.style.display = 'none';
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="w-12 h-12 bg-verdeprimario-100 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                                  <Folder className="w-6 h-6 text-blanco-100" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-verdeprimario-100 rounded-lg flex items-center justify-center">
                                <Folder className="w-6 h-6 text-blanco-100" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-negro-100 font-raleway-bold-16pt">{category.name}</h3>
                              <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                                {category.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(category)}
                              className="h-8 w-8 p-0 hover:bg-grisprimario-10"
                            >
                              <Edit className="w-4 h-4 text-grisprimario-200" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showDeleteCategoryConfirm(category.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        {category.description && (
                          <p className="text-grisprimario-200 font-raleway-medium-14pt text-sm line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        <div className="mt-3 text-xs text-grisprimario-200">
                          Creada: {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
                </TabsContent>

                {/* Sub-Badges Tab */}
                <TabsContent value="subBadges">
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grisprimario-200 w-4 h-4" />
                      <Input
                        placeholder="Buscar sub-badges..."
                        value={subBadgeSearchTerm}
                        onChange={(e) => setSubBadgeSearchTerm(e.target.value)}
                        className="pl-10 border-grisprimario-10 focus:border-verdeprimario-100"
                      />
                    </div>
                    <Dialog open={isCreateSubBadgeDialogOpen} onOpenChange={setIsCreateSubBadgeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2 font-raleway-medium-16pt">
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Sub-Badge
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Crear Nuevo Sub-Badge</DialogTitle>
                          <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                            Completa la información del nuevo sub-badge
                          </DialogDescription>
                        </DialogHeader>

                        {/* Icon Upload Section */}
                        <div className="space-y-4 py-4 border-b border-grisprimario-10">
                          <Label className="text-negro-100 font-raleway-medium-14pt">Icono del Sub-Badge</Label>
                          
                          <div>
                            <Label htmlFor="subBadge-iconUrl" className="text-negro-100 font-raleway-medium-14pt">URL del Icono</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="subBadge-iconUrl"
                                value={subBadgeFormData.iconUrl}
                                onChange={(e) => setSubBadgeFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                                className="border-grisprimario-10 focus:border-verdeprimario-100"
                                placeholder="https://ejemplo.com/icono.png"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('file-upload-subBadge-create')?.click()}
                                className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full px-4 py-2"
                              >
                                📁 Subir Archivo
                              </Button>
                            </div>
                            <input
                              id="file-upload-subBadge-create"
                              type="file"
                              accept="image/*,.svg"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const result = await fileUploadService.uploadFile(file, 'category-icon');
                                    if (result.success) {
                                      setSubBadgeFormData(prev => ({ ...prev, iconUrl: result.url || '' }));
                                      customToast.success('Icono subido exitosamente');
                                    } else {
                                      customToast.error(result.error || 'Error al subir icono');
                                    }
                                  } catch (error) {
                                    customToast.error('Error al subir archivo');
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </div>

                          {subBadgeFormData.iconUrl && (
                            <div className="flex flex-col items-center space-y-2">
                              <Label className="text-negro-100 font-raleway-medium-14pt">Vista Previa</Label>
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-grisprimario-10 flex items-center justify-center border-2 border-grisprimario-10">
                                <img
                                  src={subBadgeFormData.iconUrl}
                                  alt="Icon preview"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSubBadgeFormData(prev => ({ ...prev, iconUrl: '' }))}
                                className="border-red-200 text-red-500 hover:bg-red-50 rounded-full px-3 py-1 text-xs"
                              >
                                ✕ Eliminar
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="subBadge-name" className="text-negro-100 font-raleway-medium-14pt">Nombre</Label>
                            <Input
                              id="subBadge-name"
                              value={subBadgeFormData.name}
                              onChange={(e) => setSubBadgeFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="border-grisprimario-10 focus:border-verdeprimario-100"
                              placeholder="Ej: Soja"
                            />
                          </div>

                          <div>
                            <Label htmlFor="subBadge-service" className="text-negro-100 font-raleway-medium-14pt">Servicio</Label>
                            <Select value={subBadgeFormData.serviceId} onValueChange={(value) => setSubBadgeFormData(prev => ({ ...prev, serviceId: value }))}>
                              <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                                <SelectValue placeholder="Seleccionar servicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map(service => (
                                  <SelectItem key={service.id} value={service.id}>{service.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setIsCreateSubBadgeDialogOpen(false)}
                              className="rounded-full px-6 py-2 font-raleway-medium-16pt text-grisprimario-200 border-grisprimario-10 hover:bg-grisprimario-10"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={showCreateSubBadgeConfirm}
                              className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2 font-raleway-medium-16pt"
                            >
                              Crear Sub-Badge
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Sub-Badges List */}
                  {isLoadingSubBadges ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100"></div>
                      <span className="ml-2 text-grisprimario-200 font-raleway-medium-14pt">Cargando sub-badges...</span>
                    </div>
                  ) : filteredSubBadges.length === 0 ? (
                    <div className="text-center py-8">
                      <Tag className="w-16 h-16 text-grisprimario-200 mx-auto mb-4" />
                      <h3 className="text-lg font-raleway-bold-16pt text-negro-100 mb-2">No hay sub-badges</h3>
                      <p className="text-grisprimario-200 font-raleway-medium-14pt">
                        {subBadgeSearchTerm ? 'No se encontraron sub-badges con ese criterio.' : 'Crea tu primer sub-badge para comenzar.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSubBadges.map((subBadge) => (
                        <Card key={subBadge.id} className="border border-grisprimario-10 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-grisprimario-10 flex items-center justify-center">
                                  <img
                                    src={subBadge.iconUrl || "/figmaAssets/subBadge.svg"}
                                    alt={subBadge.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      // Fallback to default if custom icon fails to load
                                      const target = e.currentTarget as HTMLImageElement;
                                      const defaultIcon = "/figmaAssets/subBadge.svg";
                                      if (!target.src.endsWith(defaultIcon)) {
                                        target.src = defaultIcon;
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <h3 className="text-negro-100 font-raleway-bold-16pt">{subBadge.name}</h3>
                                  {subBadge.service && (
                                    <Badge variant="outline" className="text-xs">
                                      {subBadge.service.title}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditSubBadgeDialog(subBadge)}
                                  className="h-8 w-8 p-0 hover:bg-grisprimario-10"
                                >
                                  <Edit className="w-4 h-4 text-grisprimario-200" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => showDeleteSubBadgeConfirm(subBadge.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-100"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-grisprimario-200">
                              Creado: {new Date(subBadge.createdAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Editar Categoría</DialogTitle>
              <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                Modifica la información de la categoría
              </DialogDescription>
            </DialogHeader>

            {/* Icon Upload Section */}
            <div className="space-y-4 py-4 border-b border-grisprimario-10">
              <Label className="text-negro-100 font-raleway-medium-14pt">Icono de la Categoría</Label>
              
              {/* URL Input */}
              <div>
                <Label htmlFor="edit-iconUrl" className="text-negro-100 font-raleway-medium-14pt">URL del Icono</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-iconUrl"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                    placeholder="https://ejemplo.com/icono.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full px-4 py-2"
                  >
                    📁 Subir Archivo
                  </Button>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.svg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const result = await fileUploadService.uploadFile(file, 'category-icon');
                        if (result.success) {
                          setFormData(prev => ({ ...prev, iconUrl: result.url || '' }));
                          customToast.success('Icono subido exitosamente');
                        } else {
                          customToast.error(result.error || 'Error al subir icono');
                        }
                      } catch (error) {
                        customToast.error('Error al subir archivo');
                      }
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Icon Preview */}
              {formData.iconUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <Label className="text-negro-100 font-raleway-medium-14pt">Vista Previa</Label>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-grisprimario-10 flex items-center justify-center border-2 border-grisprimario-10">
                    <img
                      src={formData.iconUrl}
                      alt="Icon preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const fallback = target.nextElementSibling as HTMLElement;
                        target.style.display = 'none';
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-grisprimario-200 text-xs">Error</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, iconUrl: '' }))}
                    className="border-red-200 text-red-500 hover:bg-red-50 rounded-full px-3 py-1 text-xs"
                  >
                    ✕ Eliminar
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-negro-100 font-raleway-medium-14pt">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="border-grisprimario-10 focus:border-verdeprimario-100"
                />
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="rounded-full px-6 py-2 font-raleway-medium-16pt text-grisprimario-200 border-grisprimario-10 hover:bg-grisprimario-10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={showUpdateCategoryConfirm}
                  className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2 font-raleway-medium-16pt"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Sub-Badge Dialog */}
        <Dialog open={isEditSubBadgeDialogOpen} onOpenChange={setIsEditSubBadgeDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Editar Sub-Badge</DialogTitle>
              <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                Modifica la información del sub-badge
              </DialogDescription>
            </DialogHeader>

            {/* Icon Upload Section */}
            <div className="space-y-4 py-4 border-b border-grisprimario-10">
              <Label className="text-negro-100 font-raleway-medium-14pt">Icono del Sub-Badge</Label>
              
              <div>
                <Label htmlFor="edit-subBadge-iconUrl" className="text-negro-100 font-raleway-medium-14pt">URL del Icono</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-subBadge-iconUrl"
                    value={subBadgeFormData.iconUrl}
                    onChange={(e) => setSubBadgeFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                    placeholder="https://ejemplo.com/icono.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload-subBadge')?.click()}
                    className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full px-4 py-2"
                  >
                    📁 Subir Archivo
                  </Button>
                </div>
                <input
                  id="file-upload-subBadge"
                  type="file"
                  accept="image/*,.svg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const result = await fileUploadService.uploadFile(file, 'category-icon');
                        if (result.success) {
                          setSubBadgeFormData(prev => ({ ...prev, iconUrl: result.url || '' }));
                          customToast.success('Icono subido exitosamente');
                        } else {
                          customToast.error(result.error || 'Error al subir icono');
                        }
                      } catch (error) {
                        customToast.error('Error al subir archivo');
                      }
                    }
                  }}
                  className="hidden"
                />
              </div>

              {subBadgeFormData.iconUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <Label className="text-negro-100 font-raleway-medium-14pt">Vista Previa</Label>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-grisprimario-10 flex items-center justify-center border-2 border-grisprimario-10">
                    <img
                      src={subBadgeFormData.iconUrl}
                      alt="Icon preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSubBadgeFormData(prev => ({ ...prev, iconUrl: '' }))}
                    className="border-red-200 text-red-500 hover:bg-red-50 rounded-full px-3 py-1 text-xs"
                  >
                    ✕ Eliminar
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-subBadge-name" className="text-negro-100 font-raleway-medium-14pt">Nombre</Label>
                <Input
                  id="edit-subBadge-name"
                  value={subBadgeFormData.name}
                  onChange={(e) => setSubBadgeFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="border-grisprimario-10 focus:border-verdeprimario-100"
                />
              </div>

              <div>
                <Label htmlFor="edit-subBadge-service" className="text-negro-100 font-raleway-medium-14pt">Servicio</Label>
                <Select value={subBadgeFormData.serviceId} onValueChange={(value) => setSubBadgeFormData(prev => ({ ...prev, serviceId: value }))}>
                  <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>{service.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditSubBadgeDialogOpen(false)}
                  className="rounded-full px-6 py-2 font-raleway-medium-16pt text-grisprimario-200 border-grisprimario-10 hover:bg-grisprimario-10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={showUpdateSubBadgeConfirm}
                  className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full px-6 py-2 font-raleway-medium-16pt"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          icon={confirmDialog.icon}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          isLoading={confirmDialog.isLoading}
        />
      </SuperAdminOnly>
    </AdminLayout>
  );
}

