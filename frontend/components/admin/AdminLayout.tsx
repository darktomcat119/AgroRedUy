
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Shield, 
  Menu,
  X,
  Home,
  Building2,
  Crown,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { DynamicNavigation } from '@/components/DynamicNavigation';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: 'ADMIN' | 'SUPERADMIN';
}

// Super Admin navigation items (full access)
const superAdminNavItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Panel principal',
    superAdminOnly: false
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    description: 'Gestión de usuarios',
    superAdminOnly: true
  },
  {
    label: 'Servicios',
    href: '/admin/services',
    icon: Building2,
    description: 'Gestión de servicios',
    superAdminOnly: false
  },
  {
    label: 'Reportes',
    href: '/admin/reports',
    icon: FileText,
    description: 'Reportes y estadísticas',
    superAdminOnly: true
  },
  {
    label: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuración del sistema',
    superAdminOnly: true
  },
  {
    label: 'Seguridad',
    href: '/admin/security',
    icon: Shield,
    description: 'Monitoreo de seguridad',
    superAdminOnly: true
  }
];

// Regular Admin navigation items (limited access)
const adminNavItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Panel principal'
  },
  {
    label: 'Mis Servicios',
    href: '/admin/services',
    icon: Building2,
    description: 'Gestionar mis servicios'
  }
];

export function AdminSidebar({ isOpen, onToggle, userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  
  // Get navigation items based on user role
  const navItems = userRole === 'SUPERADMIN' ? superAdminNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-[140px] z-50 h-[calc(100vh-140px)] w-64 bg-blanco-100 text-negro-100 border-r border-grisprimario-10 transform transition-transform duration-300 ease-in-out shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:top-[140px] lg:h-[calc(100vh-140px)]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-grisprimario-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-verdeprimario-100 rounded-lg flex items-center justify-center">
              {userRole === 'SUPERADMIN' ? (
                <Crown className="w-5 h-5 text-blanco-100" />
              ) : (
                <UserCheck className="w-5 h-5 text-blanco-100" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-negro-100 font-raleway-bold-16pt">
                {userRole === 'SUPERADMIN' ? 'Super Admin' : 'Admin Panel'}
              </h2>
              <p className="text-xs text-grisprimario-200 font-raleway-medium-14pt">AgroRedUy</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-grisprimario-10 transition-colors"
          >
            <X className="w-5 h-5 text-negro-100" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 group shadow-sm",
                  isActive 
                    ? "bg-verdeprimario-100 text-blanco-100 shadow-md" 
                    : "text-negro-100 hover:bg-grisprimario-10 hover:text-negro-100 hover:shadow-lg hover:shadow-verdeprimario-100/20"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-blanco-100" : "text-negro-100 group-hover:text-negro-100"
                )} />
                <div className="flex-1">
                  <div className="font-medium font-raleway-medium-16pt">{item.label}</div>
                  <div className="text-xs text-grisprimario-200 group-hover:text-grisprimario-200 font-raleway-medium-14pt">
                    {item.description}
                  </div>
                </div>
                {/* Super Admin only indicator */}
                {userRole === 'SUPERADMIN' && 'superAdminOnly' in item && (item as any).superAdminOnly && (
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-grisprimario-10">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-full text-negro-100 hover:bg-grisprimario-10 hover:text-negro-100 hover:shadow-lg hover:shadow-verdeprimario-100/20 transition-all duration-200 shadow-sm"
          >
            <Home className="w-5 h-5" />
            <span className="font-raleway-medium-16pt">Volver al sitio</span>
          </Link>
        </div>
      </div>
    </>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Get user role, default to ADMIN if not SUPERADMIN
  const userRole = user?.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN';

  // Navigation items for admin pages
  const leftItems = [
    { label: "Inicio", active: false, href: "/" },
    { label: "Servicios", active: false, href: "/servicios" },
  ];

  return (
    <div className="min-h-screen bg-grisprimario-10">
      {/* Top Navigation Bar */}
      <DynamicNavigation 
        leftItems={leftItems}
        variant="service"
      />
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-[140px] left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-verdeprimario-100 text-blanco-100 rounded-lg shadow-lg hover:bg-verdeprimario-200 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userRole={userRole}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
