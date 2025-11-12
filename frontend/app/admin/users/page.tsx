"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { SuperAdminOnly } from '@/components/admin/RoleGuard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, Shield, Mail, Phone, Calendar, Filter } from 'lucide-react';
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
import { ConfirmDialog, ConfirmDialogs } from '@/components/ui/confirm-dialog';
import { customToast, toastMessages } from '@/lib/toast';
import { AvatarUpload } from '@/components/AvatarUpload';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'CONTRACTOR' | 'ADMIN' | 'SUPERADMIN';
  isActive: boolean;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  profileImageUrl?: string;
  address?: string;
  city?: string;
  department?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  interests?: string | string[];
  newsletter?: boolean;
}

export default function AdminUsersPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
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
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'USER' as User['role'],
    password: '',
    isActive: true,
    emailVerified: false,
    address: '',
    city: '',
    department: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    company: '',
    interests: '',
    newsletter: false,
    profileImageUrl: ''
  });

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadUsers();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await apiClient.getUsers({
        page: 1,
        limit: 50,
        search: searchTerm,
        role: roleFilter === 'all' ? undefined : roleFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
      });
      
      if (response.success && response.data) {
        setUsers(response.data.users || []);
      } else {
        console.error('Failed to load users:', response.error);
        customToast.error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      customToast.error('Error al cargar usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (roleFilter === 'CONTRACTOR') {
          return user.role === 'CONTRACTOR' || user.role === 'ADMIN';
        }
        return user.role === roleFilter;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      // Clear previous field errors
      setFieldErrors({});
      
      const response = await apiClient.createUser(formData);
      
      if (response.success) {
        setUsers(prev => [...prev, response.data]);
        setIsCreateDialogOpen(false);
        resetForm();
        customToast.success(toastMessages.userCreated(`${formData.firstName} ${formData.lastName}`));
      } else {
        // Parse validation errors and map to fields
        if (response.error?.code === 'VALIDATION_ERROR' && response.error?.details) {
          const errors: Record<string, string> = {};
          response.error.details.forEach((detail: any) => {
            if (detail.path) {
              errors[detail.path] = detail.msg || detail.message;
            }
          });
          setFieldErrors(errors);
          customToast.error('Por favor corrige los errores en el formulario');
        } else {
          customToast.error(`Error al crear usuario: ${response.error?.message || 'Error desconocido'}`);
        }
      }
    } catch (error: any) {
      customToast.error(`Error al crear usuario: ${error.message || 'Error de conexión'}`);
      console.error('Error creating user:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const showCreateUserConfirm = () => {
    const config = ConfirmDialogs.createUser();
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleCreateUser,
      isLoading: false,
      icon: 'add' as const
    });
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      // Clear previous field errors
      setFieldErrors({});
      
      // Prepare update data, excluding password if it's empty
      const updateData: any = { ...formData };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }

      const response = await apiClient.updateUser(selectedUser.id, updateData);
      
      if (response.success) {
        // Refresh from server to ensure we show the canonical updated data
        await loadUsers();
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        resetForm();
        customToast.success(toastMessages.userUpdated(`${formData.firstName} ${formData.lastName}`));
      } else {
        // Parse validation errors and map to fields
        if (response.error?.code === 'VALIDATION_ERROR' && response.error?.details) {
          const errors: Record<string, string> = {};
          response.error.details.forEach((detail: any) => {
            if (detail.path) {
              errors[detail.path] = detail.msg || detail.message;
            }
          });
          setFieldErrors(errors);
          customToast.error('Por favor corrige los errores en el formulario');
        } else {
          customToast.error(`Error al actualizar usuario: ${response.error?.message || 'Error desconocido'}`);
        }
      }
    } catch (error: any) {
      customToast.error(`Error al actualizar usuario: ${error.message || 'Error de conexión'}`);
      console.error('Error updating user:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const showUpdateUserConfirm = () => {
    if (!selectedUser) return;
    const config = ConfirmDialogs.editUser(`${formData.firstName} ${formData.lastName}`);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: handleUpdateUser,
      isLoading: false
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.deleteUser(userId);
      
      if (response.success) {
        const userToDelete = users.find(u => u.id === userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        customToast.success(toastMessages.userDeleted(`${userToDelete?.firstName} ${userToDelete?.lastName}`));
      } else {
        customToast.error(`Error al eliminar usuario: ${response.error?.message || 'Error desconocido'}`);
      }
    } catch (error: any) {
      customToast.error(`Error al eliminar usuario: ${error.message || 'Error de conexión'}`);
      console.error('Error deleting user:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const showDeleteUserConfirm = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    const config = ConfirmDialogs.deleteUser(`${userToDelete.firstName} ${userToDelete.lastName}`);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: () => handleDeleteUser(userId),
      isLoading: false
    });
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      setConfirmDialog(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.updateUser(userId, { isActive: !user.isActive });
      
      if (response.success) {
        await loadUsers();
        customToast.success(user.isActive ? toastMessages.userDeactivated(`${user.firstName} ${user.lastName}`) : toastMessages.userActivated(`${user.firstName} ${user.lastName}`));
      } else {
        customToast.error(`Error al cambiar estado del usuario: ${response.error?.message || 'Error desconocido'}`);
      }
    } catch (error: any) {
      customToast.error(`Error al cambiar estado del usuario: ${error.message || 'Error de conexión'}`);
      console.error('Error toggling user status:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const showToggleUserStatusConfirm = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const config = ConfirmDialogs.toggleUserStatus(`${user.firstName} ${user.lastName}`, user.isActive);
    setConfirmDialog({
      isOpen: true,
      ...config,
      onConfirm: () => handleToggleUserStatus(userId),
      isLoading: false,
      icon: 'block' as const
    });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'USER',
      password: '',
      isActive: true,
      emailVerified: false,
      address: '',
      city: '',
      department: '',
      dateOfBirth: '',
      gender: '',
      occupation: '',
      company: '',
      interests: '',
      newsletter: false,
      profileImageUrl: ''
    });
    setFieldErrors({});
  };

  // Clear error for a specific field when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Avatar upload handlers
  const handleAvatarUpload = (result: any) => {
    if (result.success) {
      setFormData(prev => ({ ...prev, profileImageUrl: result.url }));
      customToast.success('Avatar uploaded successfully');
    } else {
      customToast.error(result.error || 'Failed to upload avatar');
    }
  };

  const handleAvatarRemove = () => {
    setFormData(prev => ({ ...prev, profileImageUrl: '' }));
  };

  const openEditDialog = async (user: User) => {
    setSelectedUser(user);
    try {
      const resp = await apiClient.getUser(user.id);
      const u = (resp && (resp as any).data) ? (resp as any).data : user;
      setFormData({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone || '',
        role: u.role || user.role,
        password: '',
        isActive: typeof u.isActive === 'boolean' ? u.isActive : user.isActive,
        emailVerified: typeof u.emailVerified === 'boolean' ? u.emailVerified : (user.emailVerified || false),
        address: u.address || user.address || '',
        city: u.city || user.city || '',
        department: u.department || user.department || '',
        dateOfBirth: u.dateOfBirth ? toInputDate(u.dateOfBirth) : (user.dateOfBirth ? toInputDate(user.dateOfBirth) : ''),
        gender: u.gender || user.gender || '',
        occupation: u.occupation || user.occupation || '',
        company: u.company || user.company || '',
        interests: Array.isArray(u?.interests)
          ? (u.interests as string[]).join(', ')
          : (typeof u?.interests === 'string' && u.interests.trim().length > 0
              ? u.interests
              : (Array.isArray(user?.interests)
                  ? (user.interests as string[]).join(', ')
                  : (typeof user?.interests === 'string' ? (user.interests as string) : ''))),
        newsletter: typeof u.newsletter === 'boolean' ? u.newsletter : (user.newsletter || false),
        profileImageUrl: u.profileImageUrl || user.profileImageUrl || ''
      });
    } catch {
      // Fallback to list data if detail fetch fails
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        role: user.role,
        password: '',
        isActive: user.isActive,
        emailVerified: user.emailVerified || false,
        address: user.address || '',
        city: user.city || '',
        department: user.department || '',
        dateOfBirth: user.dateOfBirth ? toInputDate(user.dateOfBirth) : '',
        gender: user.gender || '',
        occupation: user.occupation || '',
        company: user.company || '',
        interests: Array.isArray(user.interests) ? user.interests.join(', ') : (user.interests || ''),
        newsletter: user.newsletter || false,
        profileImageUrl: user.profileImageUrl || ''
      });
    } finally {
      setIsEditDialogOpen(true);
    }
  };

  const getRoleDisplayName = (role: User['role']) => {
    switch (role) {
      case 'SUPERADMIN': return 'Super Admin';
      case 'ADMIN':
      case 'CONTRACTOR': return 'Contratista';
      case 'USER': return 'Usuario';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'SUPERADMIN': return 'bg-red-100 text-red-800';
      case 'ADMIN':
      case 'CONTRACTOR': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-UY');
  };

  const toInputDate = (isoOrDateString: string) => {
    const d = new Date(isoOrDateString);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
            <Users className="w-8 h-8 text-verdeprimario-100" />
            <h1 className="text-3xl font-bold text-negro-100 font-raleway-bold-20pt">Gestión de Usuarios</h1>
          </div>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">Administra todos los usuarios del sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">{users.length}</div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                {users.filter(u => u.isActive).length} activos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Contratistas</CardTitle>
              <Shield className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">
                {users.filter(u => u.role === 'CONTRACTOR').length}
              </div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Proveedores de servicios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">
                {users.filter(u => u.isActive).length}
              </div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Últimos 30 días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-negro-100 font-raleway-bold-16pt">Verificados</CardTitle>
              <Mail className="h-4 w-4 text-grisprimario-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-negro-100 font-raleway-bold-20pt">
                {users.filter(u => u.emailVerified).length}
              </div>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">
                Emails verificados
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
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-grisprimario-10 focus:border-verdeprimario-100"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 border-grisprimario-10 focus:border-verdeprimario-100">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="CONTRACTOR">Contratista</SelectItem>
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
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                    Completa la información del nuevo usuario
                  </DialogDescription>
                </DialogHeader>
                
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center space-y-4 py-4 border-b border-grisprimario-10">
                  <Label className="text-negro-100 font-raleway-medium-14pt">Foto de Perfil</Label>
                  <AvatarUpload
                    currentAvatar={formData.profileImageUrl}
                    onUpload={handleAvatarUpload}
                    onRemove={handleAvatarRemove}
                    requireAuth={true}
                    size="lg"
                    className="mx-auto"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-negro-100 font-raleway-medium-14pt">Nombre</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, firstName: e.target.value }));
                          clearFieldError('firstName');
                        }}
                        className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                      />
                      {fieldErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-negro-100 font-raleway-medium-14pt">Apellido</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, lastName: e.target.value }));
                          clearFieldError('lastName');
                        }}
                        className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                      />
                      {fieldErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-negro-100 font-raleway-medium-14pt">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, email: e.target.value }));
                        clearFieldError('email');
                      }}
                      className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.email ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.email && (
                      <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-negro-100 font-raleway-medium-14pt">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, phone: e.target.value }));
                        clearFieldError('phone');
                      }}
                      className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.phone ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-negro-100 font-raleway-medium-14pt">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, password: e.target.value }));
                        clearFieldError('password');
                      }}
                      className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.password ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.password && (
                      <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="role" className="text-negro-100 font-raleway-medium-14pt">Rol</Label>
                    <Select value={formData.role} onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Usuario</SelectItem>
                        <SelectItem value="CONTRACTOR">Contratista</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailVerified"
                        checked={formData.emailVerified}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailVerified: checked }))}
                      />
                      <Label htmlFor="emailVerified" className="text-negro-100 font-raleway-medium-14pt">Email Verificado</Label>
                    </div>
                  </div>

                  {/* Additional User Information */}
                  <div className="border-t pt-4">
                    <h4 className="text-negro-100 font-raleway-bold-14pt mb-4">Información Adicional</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-negro-100 font-raleway-medium-14pt">Ciudad</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, city: e.target.value }));
                            clearFieldError('city');
                          }}
                          className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.city ? 'border-red-500' : ''}`}
                          placeholder="Ej: Montevideo"
                        />
                        {fieldErrors.city && (
                          <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="department" className="text-negro-100 font-raleway-medium-14pt">Departamento</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, department: e.target.value }));
                            clearFieldError('department');
                          }}
                          className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.department ? 'border-red-500' : ''}`}
                          placeholder="Ej: Montevideo"
                        />
                        {fieldErrors.department && (
                          <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.department}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-negro-100 font-raleway-medium-14pt">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, address: e.target.value }));
                          clearFieldError('address');
                        }}
                        className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.address ? 'border-red-500' : ''}`}
                        placeholder="Dirección completa"
                      />
                      {fieldErrors.address && (
                        <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth" className="text-negro-100 font-raleway-medium-14pt">Fecha de Nacimiento</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }));
                            clearFieldError('dateOfBirth');
                          }}
                          className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.dateOfBirth ? 'border-red-500' : ''}`}
                        />
                        {fieldErrors.dateOfBirth && (
                          <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.dateOfBirth}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="gender" className="text-negro-100 font-raleway-medium-14pt">Género</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, gender: value }));
                            clearFieldError('gender');
                          }}
                        >
                          <SelectTrigger className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.gender ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Masculino</SelectItem>
                            <SelectItem value="FEMALE">Femenino</SelectItem>
                            <SelectItem value="OTHER">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldErrors.gender && (
                          <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.gender}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="occupation" className="text-negro-100 font-raleway-medium-14pt">Ocupación</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, occupation: e.target.value }));
                            clearFieldError('occupation');
                          }}
                          className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.occupation ? 'border-red-500' : ''}`}
                          placeholder="Ej: Ingeniero Agrónomo"
                        />
                        {fieldErrors.occupation && (
                          <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.occupation}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-negro-100 font-raleway-medium-14pt">Empresa</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, company: e.target.value }));
                            clearFieldError('company');
                          }}
                          className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.company ? 'border-red-500' : ''}`}
                          placeholder="Nombre de la empresa"
                        />
                        {fieldErrors.company && (
                          <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.company}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="interests" className="text-negro-100 font-raleway-medium-14pt">Intereses</Label>
                      <Textarea
                        id="interests"
                        value={formData.interests}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, interests: e.target.value }));
                          clearFieldError('interests');
                        }}
                        className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.interests ? 'border-red-500' : ''}`}
                        placeholder="Describe los intereses del usuario..."
                        rows={3}
                      />
                      {fieldErrors.interests && (
                        <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.interests}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
                      />
                      <Label htmlFor="newsletter" className="text-negro-100 font-raleway-medium-14pt">Suscribirse al Newsletter</Label>
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
                      onClick={showCreateUserConfirm}
                      className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full"
                    >
                      Crear Usuario
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-blanco-100 rounded-lg shadow-sm border border-grisprimario-10">
          <div className="p-6">
            {isLoadingUsers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
                <p className="text-grisprimario-200 font-raleway-medium-16pt">Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-grisprimario-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-negro-100 mb-2 font-raleway-bold-16pt">
                  No se encontraron usuarios
                </h3>
                <p className="text-grisprimario-200 font-raleway-medium-16pt">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay usuarios registrados en el sistema'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-grisprimario-10">
                      <th className="text-left py-3 px-4 text-negro-100 font-raleway-bold-16pt">Usuario</th>
                      <th className="text-left py-3 px-4 text-negro-100 font-raleway-bold-16pt">Rol</th>
                      <th className="text-left py-3 px-4 text-negro-100 font-raleway-bold-16pt">Estado</th>
                      <th className="text-left py-3 px-4 text-negro-100 font-raleway-bold-16pt">Registro</th>
                      <th className="text-left py-3 px-4 text-negro-100 font-raleway-bold-16pt">Último Acceso</th>
                      <th className="text-right py-3 px-4 text-negro-100 font-raleway-bold-16pt">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-grisprimario-10 hover:bg-grisprimario-10/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
    {user.profileImageUrl ? (
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <img
          src={user.profileImageUrl}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            const fallback = target.nextElementSibling as HTMLElement;
            target.style.display = 'none';
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <div className="w-10 h-10 bg-verdeprimario-100 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
          <span className="text-blanco-100 font-bold text-sm">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>
      </div>
    ) : (
                              <div className="w-10 h-10 bg-verdeprimario-100 rounded-full flex items-center justify-center">
                                <span className="text-blanco-100 font-bold text-sm">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-negro-100 font-raleway-bold-16pt">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-grisprimario-200 font-raleway-medium-14pt">
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-grisprimario-200 font-raleway-medium-14pt flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getRoleBadgeColor(user.role)} font-raleway-medium-14pt`}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={`${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} font-raleway-medium-14pt`}
                            >
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                            {user.emailVerified && (
                              <Badge className="bg-blue-100 text-blue-800 font-raleway-medium-14pt">
                                Verificado
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-grisprimario-200 font-raleway-medium-14pt flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-grisprimario-200 font-raleway-medium-14pt">
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showToggleUserStatusConfirm(user.id)}
                              className={`border-grisprimario-10 rounded-full p-2 ${
                                user.isActive 
                                  ? 'text-red-600 hover:bg-red-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showDeleteUserConfirm(user.id)}
                              className="border-grisprimario-10 text-red-600 hover:bg-red-50 rounded-full p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-negro-100 font-raleway-bold-16pt">Editar Usuario</DialogTitle>
              <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                Modifica la información del usuario
              </DialogDescription>
            </DialogHeader>
            
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center space-y-4 py-4 border-b border-grisprimario-10">
              <Label className="text-negro-100 font-raleway-medium-14pt">Foto de Perfil</Label>
              <AvatarUpload
                currentAvatar={formData.profileImageUrl}
                onUpload={handleAvatarUpload}
                onRemove={handleAvatarRemove}
                requireAuth={true}
                size="lg"
                className="mx-auto"
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName" className="text-negro-100 font-raleway-medium-14pt">Nombre</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, firstName: e.target.value }));
                      clearFieldError('firstName');
                    }}
                    className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-lastName" className="text-negro-100 font-raleway-medium-14pt">Apellido</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, lastName: e.target.value }));
                      clearFieldError('lastName');
                    }}
                    className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-email" className="text-negro-100 font-raleway-medium-14pt">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    clearFieldError('email');
                  }}
                  className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.email ? 'border-red-500' : ''}`}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-phone" className="text-negro-100 font-raleway-medium-14pt">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, phone: e.target.value }));
                    clearFieldError('phone');
                  }}
                  className={`border-grisprimario-10 focus:border-verdeprimario-100 ${fieldErrors.phone ? 'border-red-500' : ''}`}
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm mt-1 font-raleway-regular-12pt">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Additional User Information */}
              <div className="border-t pt-4">
                <h4 className="text-negro-100 font-raleway-bold-14pt mb-4">Información Adicional</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-city" className="text-negro-100 font-raleway-medium-14pt">Ciudad</Label>
                    <Input
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="border-grisprimario-10 focus:border-verdeprimario-100"
                      placeholder="Ej: Montevideo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-department" className="text-negro-100 font-raleway-medium-14pt">Departamento</Label>
                    <Input
                      id="edit-department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="border-grisprimario-10 focus:border-verdeprimario-100"
                      placeholder="Ej: Montevideo"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-address" className="text-negro-100 font-raleway-medium-14pt">Dirección</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-dateOfBirth" className="text-negro-100 font-raleway-medium-14pt">Fecha de Nacimiento</Label>
                    <Input
                      id="edit-dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="border-grisprimario-10 focus:border-verdeprimario-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-gender" className="text-negro-100 font-raleway-medium-14pt">Género</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Masculino</SelectItem>
                        <SelectItem value="FEMALE">Femenino</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-occupation" className="text-negro-100 font-raleway-medium-14pt">Ocupación</Label>
                    <Input
                      id="edit-occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      className="border-grisprimario-10 focus:border-verdeprimario-100"
                      placeholder="Ej: Ingeniero Agrónomo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-company" className="text-negro-100 font-raleway-medium-14pt">Empresa</Label>
                    <Input
                      id="edit-company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="border-grisprimario-10 focus:border-verdeprimario-100"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-interests" className="text-negro-100 font-raleway-medium-14pt">Intereses</Label>
                  <Textarea
                    id="edit-interests"
                    value={formData.interests}
                    onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                    className="border-grisprimario-10 focus:border-verdeprimario-100"
                    placeholder="Describe los intereses del usuario..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
                  />
                  <Label htmlFor="edit-newsletter" className="text-negro-100 font-raleway-medium-14pt">Suscribirse al Newsletter</Label>
                </div>
              </div>
              {/* End Additional User Information */}

              <div>
                <Label htmlFor="edit-role" className="text-negro-100 font-raleway-medium-14pt">Rol</Label>
                <Select value={formData.role} onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="CONTRACTOR">Contratista</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-emailVerified"
                    checked={formData.emailVerified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailVerified: checked }))}
                  />
                  <Label htmlFor="edit-emailVerified" className="text-negro-100 font-raleway-medium-14pt">Email Verificado</Label>
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
                  onClick={showUpdateUserConfirm}
                  className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full"
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
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          icon={confirmDialog.icon}
          isLoading={confirmDialog.isLoading}
        />
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
