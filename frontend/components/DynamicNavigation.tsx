"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export interface NavigationItem {
  label: string;
  active: boolean;
  href: string;
}

export interface DynamicNavigationProps {
  leftItems: NavigationItem[];
  variant?: "home" | "service";
  className?: string;
}

export const DynamicNavigation: React.FC<DynamicNavigationProps> = ({
  leftItems,
  variant = "home",
  className = "",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  // Color variants based on page type
  const variants = {
    home: {
      navBg: "bg-grisprimario-10",
      activeBg: "bg-blanco-100",
      activeText: "text-verdeprimario-100",
      inactiveBg: "bg-transparent",
      inactiveText: "text-blanco-100",
      hoverBg: "hover:bg-blanco-100",
      hoverText: "hover:text-verdeprimario-100",
    },
    service: {
      navBg: "bg-verdesecundario-100",
      activeBg: "bg-blanco-100",
      activeText: "text-verdeprimario-100",
      inactiveBg: "bg-transparent",
      inactiveText: "text-blanco-100",
      hoverBg: "hover:bg-blanco-100",
      hoverText: "hover:text-verdeprimario-100",
    },
  };

  const currentVariant = variants[variant];

  const NavButton = ({ item }: { item: NavigationItem }) => (
    <Link href={item.href}>
      <Button
        variant="ghost"
        className={`h-[57px] px-6 lg:px-8 py-3 rounded-[50px] border border-solid border-white ${
          item.active
            ? `${currentVariant.activeBg} ${currentVariant.activeText}`
            : `${currentVariant.inactiveBg} ${currentVariant.inactiveText}`
        } font-raleway-bold-20pt font-[number:var(--raleway-bold-20pt-font-weight)] text-[length:var(--raleway-bold-20pt-font-size)] tracking-[var(--raleway-bold-20pt-letter-spacing)] leading-[var(--raleway-bold-20pt-line-height)] [font-style:var(--raleway-bold-20pt-font-style)] ${currentVariant.hoverBg} ${currentVariant.hoverText} transition-colors`}
      >
        {item.label}
      </Button>
    </Link>
  );

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.email || 'Usuario';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const email = user.email || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (email) {
      return email.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  };

  const getRightItems = () => {
    if (isAuthenticated) {
      return [
        { label: "Contacto", active: false, href: "/contacto" },
      ];
    } else {
      return [
        { label: "Contacto", active: false, href: "/contacto" },
        { label: "Iniciar Sesión", active: false, href: "/login" },
      ];
    }
  };

  const rightItems = getRightItems();

  return (
    <nav className={`flex w-full items-center justify-center gap-3.5 pt-[49px] pb-6 px-4 relative ${className}`}>
      {/* Desktop Navigation */}
      <div className={`hidden lg:flex items-center justify-center gap-1 px-[18px] py-2.5 ${currentVariant.navBg} rounded-[50px] backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)]`}>
        {leftItems.map((item, index) => (
          <NavButton key={index} item={item} />
        ))}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Logo */}
      <Link href="/">
        <img
          className="w-32 sm:w-40 lg:w-[236px] h-auto flex-shrink-0 mx-4 cursor-pointer"
          alt="AgroRed Uy Logo"
          src="/figmaAssets/frame-3.svg"
        />
      </Link>

      {/* Desktop Right Navigation */}
      <div className={`hidden lg:flex items-center justify-center gap-1 px-[18px] py-2.5 ${currentVariant.navBg} rounded-[50px] backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)]`}>
        {rightItems.map((item, index) => (
          <NavButton key={index} item={item} />
        ))}
        
        {/* User Menu */}
        {isAuthenticated && (
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="h-[57px] px-6 py-3 rounded-[50px] border border-solid border-white bg-transparent text-blanco-100 hover:bg-blanco-100 hover:text-verdeprimario-100 transition-colors flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
              <span className="font-raleway-bold-20pt">{getUserDisplayName()}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                
                <div className="py-2">
                  <Link href="/profile" onClick={() => setIsUserMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Mi Perfil
                    </Button>
                  </Link>
                  
                  <Link href="/settings" onClick={() => setIsUserMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configuración
                    </Button>
                  </Link>

                  {user?.role === 'CONTRACTOR' && (
                    <Link href="/my-services" onClick={() => setIsUserMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Mis Servicios
                      </Button>
                    </Link>
                  )}

                  {user?.role === 'CONTRACTOR' && (
                    <Link href="/contractor-dashboard" onClick={() => setIsUserMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                  )}

                  {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                    <Link href="/admin" onClick={() => setIsUserMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Panel de Admin
                      </Button>
                    </Link>
                  )}

                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-sm z-50 p-4 lg:hidden" ref={mobileMenuRef}>
          <div className="flex flex-col space-y-4">
            {/* Left Navigation Items */}
            <div className="flex flex-col space-y-2">
              <h3 className="text-white font-semibold mb-2">Navegación</h3>
              {leftItems.map((item, index) => (
                <Link key={index} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-white ${
                      item.active ? "bg-white/20" : ""
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Navigation Items */}
            <div className="flex flex-col space-y-2">
              <h3 className="text-white font-semibold mb-2">Acceso</h3>
              {rightItems.map((item, index) => (
                <Link key={index} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Menu for Mobile */}
            {isAuthenticated && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-white font-semibold mb-2">Mi Cuenta</h3>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Mi Perfil
                  </Button>
                </Link>
                
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configuración
                  </Button>
                </Link>

                {user?.role === 'CONTRACTOR' && (
                  <Link href="/my-services" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Mis Servicios
                    </Button>
                  </Link>
                )}

                {user?.role === 'CONTRACTOR' && (
                  <Link href="/contractor-dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Panel de Admin
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
