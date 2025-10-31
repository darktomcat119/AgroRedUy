
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Bell } from 'lucide-react';
import { DynamicNavigation } from '@/components/DynamicNavigation';
import { AvatarUpload } from '@/components/AvatarUpload';
import { apiClient } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { UploadResult } from '@/lib/fileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  department?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImageUrl?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>(
    (activeTabParam === 'notifications' ? 'notifications' : 'profile') as 'profile' | 'notifications'
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      // Convert user to UserProfile format
      const userProfile: UserProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        department: (user as any).department || '',
        dateOfBirth: (user as any).dateOfBirth || '',
        gender: (user as any).gender || '',
        profileImageUrl: (user as any).profileImageUrl || '',
        role: user.role,
        isEmailVerified: (user as any).isEmailVerified || (user as any).emailVerified || false,
        createdAt: (user as any).createdAt || new Date().toISOString()
      };
      setProfile(userProfile);
      setFormData(userProfile);
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Nombre, apellido y email son requeridos');
        return;
      }

      // Call the API to update the user profile
      const response = await apiClient.updateUserProfile(profile.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.address || '',
        city: formData.city || '',
        department: formData.department || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        profileImageUrl: formData.profileImageUrl || '',
      });

      if (response.success && response.data) {
        // Update local state with the response data
        const updatedProfile: UserProfile = {
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone || '',
          address: response.data.address || '',
          city: response.data.city || '',
          department: response.data.department || '',
          dateOfBirth: response.data.dateOfBirth || '',
          gender: response.data.gender || '',
          profileImageUrl: response.data.profileImageUrl || '',
          role: response.data.role,
          isEmailVerified: response.data.emailVerified || false,
          createdAt: response.data.createdAt,
        };
        
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setIsEditing(false);
        
        // Update the auth context with the new user data
        updateUser({
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          city: response.data.city,
          department: response.data.department,
          dateOfBirth: response.data.dateOfBirth,
          gender: response.data.gender,
          profileImageUrl: response.data.profileImageUrl,
          role: response.data.role,
          isActive: response.data.isActive,
          emailVerified: response.data.emailVerified,
          occupation: response.data.occupation,
          company: response.data.company,
          interests: response.data.interests,
          newsletter: response.data.newsletter,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        });
        
        toast.success('Perfil actualizado correctamente');
      } else {
        throw new Error(response.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const handleAvatarUpload = (result: UploadResult) => {
    if (result.success && result.url) {
      setFormData(prev => ({
        ...prev,
        profileImageUrl: result.url!
      }));
      toast.success('Avatar actualizado correctamente');
    } else {
      toast.error(result.error || 'Error al subir el avatar');
    }
  };

  const handleAvatarRemove = () => {
    setFormData(prev => ({
      ...prev,
      profileImageUrl: ''
    }));
    toast.success('Avatar eliminado');
  };

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const resp = await apiClient.getNotifications({ limit: 100 });
      if (resp.success && resp.data) {
        setNotifications(resp.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar notificaciones');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await apiClient.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No se encontró el perfil</h2>
          <p className="text-gray-600">Por favor, inicia sesión para ver tu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavigation 
        leftItems={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/services/list" },
        ]}
        variant="service"
      />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y preferencias</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profile' | 'notifications')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  {isEditing ? (
                    <AvatarUpload
                      currentAvatar={formData.profileImageUrl}
                      onUpload={handleAvatarUpload}
                      onRemove={handleAvatarRemove}
                      size="lg"
                      className="mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-verdeprimario-100 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                      {profile.profileImageUrl ? (
                        <>
                          {console.log('Profile - profile.profileImageUrl:', profile.profileImageUrl)}
                          {console.log('Profile - getImageUrl result:', getImageUrl(profile.profileImageUrl))}
                          <img
                            src={getImageUrl(profile.profileImageUrl)}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                            onLoad={() => console.log('Profile - Image loaded successfully')}
                            onError={(e) => {
                              console.error('Profile - Image load error:', e);
                              console.error('Profile - Failed URL:', getImageUrl(profile.profileImageUrl));
                              console.error('Profile - Profile profileImageUrl:', profile.profileImageUrl);
                            }}
                          />
                        </>
                      ) : (
                        profile.firstName.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {isEditing ? `${formData.firstName || ''} ${formData.lastName || ''}` : `${profile.firstName} ${profile.lastName}`}
                </h2>
                
                <p className="text-gray-600 mb-4">
                  {profile.role === 'CONTRACTOR' ? 'Proveedor de Servicios' : 'Usuario'}
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>{isEditing ? (formData.email || '') : profile.email}</span>
                  {profile.isEmailVerified && (
                    <span className="text-verdeprimario-100">✓</span>
                  )}
                </div>
                
                {(isEditing ? formData.phone : profile.phone) && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
                    <Phone className="w-4 h-4" />
                    <span>{isEditing ? (formData.phone || '') : profile.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Información Personal</CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700 rounded-full px-3 py-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      size="sm"
                      className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 rounded-full px-3 py-2"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 rounded-full px-3 py-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.lastName}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-gray-900">{profile.email}</span>
                        {profile.isEmailVerified ? (
                          <span className="text-verdeprimario-100 text-sm">✓ Verificado</span>
                        ) : (
                          <span className="text-orange-500 text-sm">⚠ No verificado</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.phone || 'No especificado'}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.city || 'No especificada'}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Departamento</Label>
                      {isEditing ? (
                        <Input
                          id="department"
                          value={formData.department || ''}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.department || 'No especificado'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.address || 'No especificada'}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Información Adicional</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth || ''}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('es-ES') : 'No especificada'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Género</Label>
                      {isEditing ? (
                        <select
                          id="gender"
                          value={formData.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verdeprimario-100"
                        >
                          <option value="">Seleccionar</option>
                          <option value="MALE">Masculino</option>
                          <option value="FEMALE">Femenino</option>
                          <option value="OTHER">Otro</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-gray-900">
                          {profile.gender === 'MALE' ? 'Masculino' : 
                           profile.gender === 'FEMALE' ? 'Femenino' : 
                           profile.gender === 'OTHER' ? 'Otro' : 'No especificado'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notificaciones</CardTitle>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar todas como leídas
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando notificaciones...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          // Navigate to service page if serviceId is available
                          if ((notification as any).serviceId) {
                            router.push(`/services/${(notification as any).serviceId}`);
                          }
                        }}
                        className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge variant="default" className="bg-blue-500">
                                  Nuevo
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleDateString("es-UY", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

