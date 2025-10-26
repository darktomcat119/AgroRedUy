"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export interface NavigationItem {
  label: string;
  active: boolean;
  href: string;
}

export interface NavigationProps {
  leftItems: NavigationItem[];
  rightItems: NavigationItem[];
  variant?: "home" | "service";
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  leftItems,
  rightItems,
  variant = "home",
  className = "",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const NavButton = ({ item, isRight = false }: { item: NavigationItem; isRight?: boolean }) => (
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
      <img
        className="w-32 sm:w-40 lg:w-[236px] h-auto flex-shrink-0 mx-4"
        alt="AgroRed Uy Logo"
        src="/figmaAssets/frame-3.svg"
      />

      {/* Desktop Right Navigation */}
      <div className={`hidden lg:flex items-center justify-center gap-1 px-[18px] py-2.5 ${currentVariant.navBg} rounded-[50px] backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)]`}>
        {rightItems.map((item, index) => (
          <NavButton key={index} item={item} isRight />
        ))}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-sm z-50 p-4 lg:hidden">
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
          </div>
        </div>
      )}
    </nav>
  );
};
