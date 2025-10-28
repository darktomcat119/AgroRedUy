"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { SuperAdminOnly } from '@/components/admin/RoleGuard';
import { useAuth, useAdminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Settings, Save, RefreshCw, Shield, Mail, Bell, Database, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    emailVerification: boolean;
    emailNotifications: boolean;
  };
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    adminAlerts: boolean;
    userAlerts: boolean;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
    rateLimiting: boolean;
  };
  database: {
    backupFrequency: string;
    backupRetention: number;
    autoOptimization: boolean;
    queryLogging: boolean;
  };
}

export default function AdminSettingsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'AgroRedUy',
      siteDescription: 'Plataforma de servicios agrícolas en Uruguay',
      siteUrl: 'https://agrored.uy',
      timezone: 'America/Montevideo',
      language: 'es',
      maintenanceMode: false
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@agrored.uy',
      smtpPassword: '',
      fromEmail: 'noreply@agrored.uy',
      fromName: 'AgroRedUy',
      emailVerification: true,
      emailNotifications: true
    },
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      adminAlerts: true,
      userAlerts: true
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      sessionTimeout: 24,
      twoFactorAuth: false,
      ipWhitelist: [],
      rateLimiting: true
    },
    database: {
      backupFrequency: 'daily',
      backupRetention: 30,
      autoOptimization: true,
      queryLogging: false
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadSettings();
    }
  }, [isAuthenticated, isAdmin]);

  const loadSettings = async () => {
    try {
      const response = await apiClient.getSettings();
      if (response.success && response.data) {
        // Merge with existing settings to ensure all fields remain defined
        setSettings(prevSettings => ({
          general: {
            ...prevSettings.general,
            ...(response.data.general || {})
          },
          email: {
            ...prevSettings.email,
            ...(response.data.email || {})
          },
          notifications: {
            ...prevSettings.notifications,
            ...(response.data.notifications || {})
          },
          security: {
            ...prevSettings.security,
            ...(response.data.security || {}),
            // Ensure ipWhitelist is always an array
            ipWhitelist: response.data.security?.ipWhitelist || []
          },
          database: {
            ...prevSettings.database,
            ...(response.data.database || {})
          }
        }));
      } else {
        console.error('Failed to load settings:', response.error);
        toast.error('Error al cargar configuración');
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await apiClient.updateSettings(activeTab, settings[activeTab as keyof SystemSettings]);
      
      if (response.success) {
        toast.success('Configuración guardada exitosamente');
      } else {
        console.error('Failed to save settings:', response.error);
        toast.error('Error al guardar configuración');
      }
    } catch (error) {
      toast.error('Error al guardar configuración');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) return;
    
    try {
      const response = await apiClient.resetSettings(activeTab);
      
      if (response.success) {
        toast.success('Configuración restaurada');
        loadSettings(); // Reload settings
      } else {
        console.error('Failed to reset settings:', response.error);
        toast.error('Error al restaurar configuración');
      }
    } catch (error) {
      toast.error('Error al restaurar configuración');
      console.error('Error resetting settings:', error);
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Helper function to ensure values are never undefined
  const getValue = (value: any): string => {
    return value !== null && value !== undefined ? String(value) : '';
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

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'database', label: 'Base de Datos', icon: Database }
  ];

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-verdeprimario-100" />
            <h1 className="text-3xl font-bold text-negro-100 font-raleway-bold-20pt">Configuración del Sistema</h1>
          </div>
          <p className="text-grisprimario-200 font-raleway-medium-16pt">Administra la configuración global de la plataforma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-negro-100 font-raleway-bold-16pt">Categorías</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-verdeprimario-100 text-blanco-100'
                            : 'text-negro-100 hover:bg-grisprimario-10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-raleway-medium-14pt">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-negro-100 font-raleway-bold-16pt">
                      {tabs.find(tab => tab.id === activeTab)?.label}
                    </CardTitle>
                    <CardDescription className="text-grisprimario-200 font-raleway-medium-14pt">
                      Configuración de {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleResetSettings}
                      className="border-grisprimario-10 text-negro-100 hover:bg-grisprimario-10 rounded-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restaurar
                    </Button>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-verdeprimario-100 hover:bg-verdeprimario-200 text-blanco-100 rounded-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="siteName" className="text-negro-100 font-raleway-medium-14pt">Nombre del Sitio</Label>
                        <Input
                          id="siteName"
                          value={getValue(settings.general.siteName)}
                          onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteUrl" className="text-negro-100 font-raleway-medium-14pt">URL del Sitio</Label>
                        <Input
                          id="siteUrl"
                          value={getValue(settings.general.siteUrl)}
                          onChange={(e) => updateSettings('general', 'siteUrl', e.target.value)}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="siteDescription" className="text-negro-100 font-raleway-medium-14pt">Descripción del Sitio</Label>
                      <Textarea
                        id="siteDescription"
                        value={getValue(settings.general.siteDescription)}
                        onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                        className="border-grisprimario-10 focus:border-verdeprimario-100"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="timezone" className="text-negro-100 font-raleway-medium-14pt">Zona Horaria</Label>
                        <Select value={settings.general.timezone} onValueChange={(value) => updateSettings('general', 'timezone', value)}>
                          <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Montevideo">Montevideo (GMT-3)</SelectItem>
                            <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language" className="text-negro-100 font-raleway-medium-14pt">Idioma</Label>
                        <Select value={settings.general.language} onValueChange={(value) => updateSettings('general', 'language', value)}>
                          <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) => updateSettings('general', 'maintenanceMode', checked)}
                      />
                      <Label htmlFor="maintenanceMode" className="text-negro-100 font-raleway-medium-14pt">Modo Mantenimiento</Label>
                    </div>
                  </div>
                )}

                {activeTab === 'email' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="smtpHost" className="text-negro-100 font-raleway-medium-14pt">Servidor SMTP</Label>
                        <Input
                          id="smtpHost"
                          value={getValue(settings.email.smtpHost)}
                          onChange={(e) => updateSettings('email', 'smtpHost', e.target.value)}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPort" className="text-negro-100 font-raleway-medium-14pt">Puerto SMTP</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={settings.email.smtpPort}
                          onChange={(e) => updateSettings('email', 'smtpPort', Number(e.target.value))}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="smtpUser" className="text-negro-100 font-raleway-medium-14pt">Usuario SMTP</Label>
                        <Input
                          id="smtpUser"
                          value={getValue(settings.email.smtpUser)}
                          onChange={(e) => updateSettings('email', 'smtpUser', e.target.value)}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPassword" className="text-negro-100 font-raleway-medium-14pt">Contraseña SMTP</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={getValue(settings.email.smtpPassword)}
                          onChange={(e) => updateSettings('email', 'smtpPassword', e.target.value)}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fromEmail" className="text-negro-100 font-raleway-medium-14pt">Email Remitente</Label>
                        <Input
                          id="fromEmail"
                          value={getValue(settings.email.fromEmail)}
                          onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fromName" className="text-negro-100 font-raleway-medium-14pt">Nombre Remitente</Label>
                        <Input
                          id="fromName"
                          value={getValue(settings.email.fromName)}
                          onChange={(e) => updateSettings('email', 'fromName', e.target.value)}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="emailVerification"
                          checked={settings.email.emailVerification}
                          onCheckedChange={(checked) => updateSettings('email', 'emailVerification', checked)}
                        />
                        <Label htmlFor="emailVerification" className="text-negro-100 font-raleway-medium-14pt">Verificación por Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="emailNotifications"
                          checked={settings.email.emailNotifications}
                          onCheckedChange={(checked) => updateSettings('email', 'emailNotifications', checked)}
                        />
                        <Label htmlFor="emailNotifications" className="text-negro-100 font-raleway-medium-14pt">Notificaciones por Email</Label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="pushNotifications"
                          checked={settings.notifications.pushNotifications}
                          onCheckedChange={(checked) => updateSettings('notifications', 'pushNotifications', checked)}
                        />
                        <Label htmlFor="pushNotifications" className="text-negro-100 font-raleway-medium-14pt">Notificaciones Push</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="emailNotifications"
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                        />
                        <Label htmlFor="emailNotifications" className="text-negro-100 font-raleway-medium-14pt">Notificaciones por Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="smsNotifications"
                          checked={settings.notifications.smsNotifications}
                          onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                        />
                        <Label htmlFor="smsNotifications" className="text-negro-100 font-raleway-medium-14pt">Notificaciones SMS</Label>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-md font-bold text-negro-100 font-raleway-bold-16pt">Alertas Administrativas</h4>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="adminAlerts"
                          checked={settings.notifications.adminAlerts}
                          onCheckedChange={(checked) => updateSettings('notifications', 'adminAlerts', checked)}
                        />
                        <Label htmlFor="adminAlerts" className="text-negro-100 font-raleway-medium-14pt">Alertas para Administradores</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="userAlerts"
                          checked={settings.notifications.userAlerts}
                          onCheckedChange={(checked) => updateSettings('notifications', 'userAlerts', checked)}
                        />
                        <Label htmlFor="userAlerts" className="text-negro-100 font-raleway-medium-14pt">Alertas para Usuarios</Label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="passwordMinLength" className="text-negro-100 font-raleway-medium-14pt">Longitud Mínima de Contraseña</Label>
                        <Input
                          id="passwordMinLength"
                          type="number"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => updateSettings('security', 'passwordMinLength', Number(e.target.value))}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sessionTimeout" className="text-negro-100 font-raleway-medium-14pt">Timeout de Sesión (horas)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSettings('security', 'sessionTimeout', Number(e.target.value))}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="passwordRequireSpecialChars"
                          checked={settings.security.passwordRequireSpecialChars}
                          onCheckedChange={(checked) => updateSettings('security', 'passwordRequireSpecialChars', checked)}
                        />
                        <Label htmlFor="passwordRequireSpecialChars" className="text-negro-100 font-raleway-medium-14pt">Requerir Caracteres Especiales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="twoFactorAuth"
                          checked={settings.security.twoFactorAuth}
                          onCheckedChange={(checked) => updateSettings('security', 'twoFactorAuth', checked)}
                        />
                        <Label htmlFor="twoFactorAuth" className="text-negro-100 font-raleway-medium-14pt">Autenticación de Dos Factores</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="rateLimiting"
                          checked={settings.security.rateLimiting}
                          onCheckedChange={(checked) => updateSettings('security', 'rateLimiting', checked)}
                        />
                        <Label htmlFor="rateLimiting" className="text-negro-100 font-raleway-medium-14pt">Limitación de Velocidad</Label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'database' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="backupFrequency" className="text-negro-100 font-raleway-medium-14pt">Frecuencia de Respaldo</Label>
                        <Select value={settings.database.backupFrequency} onValueChange={(value) => updateSettings('database', 'backupFrequency', value)}>
                          <SelectTrigger className="border-grisprimario-10 focus:border-verdeprimario-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Cada hora</SelectItem>
                            <SelectItem value="daily">Diario</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="backupRetention" className="text-negro-100 font-raleway-medium-14pt">Retención de Respaldos (días)</Label>
                        <Input
                          id="backupRetention"
                          type="number"
                          value={settings.database.backupRetention}
                          onChange={(e) => updateSettings('database', 'backupRetention', Number(e.target.value))}
                          className="border-grisprimario-10 focus:border-verdeprimario-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoOptimization"
                          checked={settings.database.autoOptimization}
                          onCheckedChange={(checked) => updateSettings('database', 'autoOptimization', checked)}
                        />
                        <Label htmlFor="autoOptimization" className="text-negro-100 font-raleway-medium-14pt">Optimización Automática</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="queryLogging"
                          checked={settings.database.queryLogging}
                          onCheckedChange={(checked) => updateSettings('database', 'queryLogging', checked)}
                        />
                        <Label htmlFor="queryLogging" className="text-negro-100 font-raleway-medium-14pt">Registro de Consultas</Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  </SuperAdminOnly>
  );
}