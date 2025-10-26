"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const navigationItems = [
  { label: "Inicio", active: true, href: "/" },
  { label: "Servicios", active: false, href: "/servicios" },
];

const authItems = [
  { label: "Iniciar Sesión", active: false, href: "/login" },
  { label: "Registrarse", active: false, href: "/register" },
];

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-sm z-50 p-4">
          <div className="flex flex-col space-y-4">
            {/* Navigation Items */}
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item, index) => (
                <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
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

            {/* Auth Items */}
            <div className="flex flex-col space-y-2">
              {authItems.map((item, index) => (
                <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

