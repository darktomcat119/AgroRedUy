import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const leftNavItems = [
  { label: "Inicio", isActive: true, href: "/" },
  { label: "Servicios", isActive: false, href: "/servicios" },
];

const rightNavItems = [
  { label: "Contacto", isActive: false, href: "/contacto" },
  { label: "Iniciar Sesión", isActive: false, href: "/login" },
];

export const NavigationMenuSection = (): JSX.Element => {
  return (
    <nav className="flex w-full items-center justify-center gap-3.5 pt-[49px] pb-6 px-4 relative">
      <div className="flex items-center justify-center gap-1 px-[18px] py-2.5 bg-verdesecundario-100 rounded-[50px] backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)]">
        {leftNavItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button
              variant="ghost"
              className={`h-[57px] px-10 py-[17px] rounded-[50px] border border-solid border-white ${
                item.isActive ? "bg-transparent" : "bg-blanco-100"
              } hover:bg-opacity-90`}
            >
              <span
                className={`text-[length:var(--raleway-bold-20pt-font-size)] font-raleway-bold-20pt font-[number:var(--raleway-bold-20pt-font-weight)] tracking-[var(--raleway-bold-20pt-letter-spacing)] leading-[var(--raleway-bold-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-20pt-font-style)] ${
                  item.isActive ? "text-blanco-100" : "text-verdeprimario-100"
                }`}
              >
                {item.label}
              </span>
            </Button>
          </Link>
        ))}
      </div>

      <img
        className="w-[236px] h-[109px]"
        alt="Agro RedUy Logo"
        src="/figmaAssets/frame-3.svg"
      />

      <div className="flex items-center justify-center gap-1 px-[18px] py-2.5 bg-verdesecundario-100 rounded-[50px] backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)]">
        {rightNavItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button
              variant="ghost"
              className="h-[57px] px-10 py-[17px] bg-transparent rounded-[50px] border border-solid border-white hover:bg-white hover:bg-opacity-10"
            >
              <span className="text-blanco-100 text-[length:var(--raleway-bold-20pt-font-size)] font-raleway-bold-20pt font-[number:var(--raleway-bold-20pt-font-weight)] tracking-[var(--raleway-bold-20pt-letter-spacing)] leading-[var(--raleway-bold-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-20pt-font-style)]">
                {item.label}
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
};

