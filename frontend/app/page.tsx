import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";

const navigationItems = [
  { label: "Inicio", active: true, href: "/" },
  { label: "Servicios", active: false, href: "/servicios" },
];

const navigationItemsRight = [
  { label: "Contacto", active: false, href: "/contacto" },
  { label: "Iniciar Sesión", active: false, href: "/login" },
];

const features = [
  {
    icon: "/figmaAssets/icono-ubicacion.svg",
    label: "Geolocalizado",
  },
  {
    icon: "/figmaAssets/icono-red-confiable.svg",
    label: "Red Confiable",
  },
  {
    icon: "/figmaAssets/icono-coneccion-directa.svg",
    label: "Conexión Directa",
  },
  {
    icon: "/figmaAssets/icono-calificaciones.svg",
    label: "Calificaciones",
  },
];

const userTypes = [
  {
    icon: "/figmaAssets/icono-productor.svg",
    label: "SOY PRODUCTOR",
    bgColor: "bg-verdesecundario-100",
    hoverColor: "hover:bg-verdeprimario-100",
    href: "/register?type=producer",
  },
  {
    icon: "/figmaAssets/icono-contratista.svg",
    label: "SOY CONTRATISTA",
    bgColor: "bg-naranja-100",
    hoverColor: "hover:bg-orange-400",
    href: "/register?type=contractor",
  },
];

export default function HomePage(): JSX.Element {
  return (
    <main className="relative w-full min-h-screen">
      {/* Full-page background image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/figmaAssets/rectangle-2.png')"
        }}
      />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 w-full h-full bg-black/40" />

      {/* Responsive Header */}
      <header className="absolute top-0 left-0 w-full z-20">
        <div className="w-full max-w-7xl mx-auto">
          <Navigation
            leftItems={navigationItems}
            rightItems={navigationItemsRight}
            variant="home"
          />
        </div>
      </header>

      {/* Hero Section - Positioned Higher with Safe Distance from Navbar */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 pt-40 sm:pt-44 lg:pt-48 xl:pt-52">
        <div className="w-full max-w-5xl mx-auto text-center">
          {/* Main Title */}
          <div className="mb-6">
            <h1 className="font-barlow-bold-64pt font-[number:var(--barlow-bold-64pt-font-weight)] text-blanco-100 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[length:var(--barlow-bold-64pt-font-size)] tracking-[var(--barlow-bold-64pt-letter-spacing)] [font-style:var(--barlow-bold-64pt-font-style)] mb-2">
              Conectamos el campo
            </h1>
            <h2 className="font-barlow-bold-italic-96pt font-[number:var(--barlow-bold-italic-96pt-font-weight)] [font-style:var(--barlow-bold-italic-96pt-font-style)] text-blanco-100 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[length:var(--barlow-bold-italic-96pt-font-size)] tracking-[var(--barlow-bold-italic-96pt-letter-spacing)]">
              URUGUAYO
            </h2>
          </div>

          {/* Description Section */}
          <div className="max-w-4xl mx-auto">
            <p className="[font-family:'Raleway',Helvetica] font-semibold italic text-blanco-100 text-lg sm:text-xl lg:text-2xl tracking-[0] leading-[normal] mb-6">
              La red que une
            </p>
            
            {/* User type badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
              <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-[50px] border-2 border-solid border-white bg-white/20 backdrop-blur-sm">
                <p className="[font-family:'Raleway',Helvetica] font-bold text-blanco-100 text-sm sm:text-base lg:text-lg text-center tracking-[0] leading-[normal]">
                  PRODUCTORES AGROPECUARIOS
                </p>
              </div>
              
              <img
                className="w-4 h-6 sm:w-5 sm:h-8"
                alt="Connector"
                src="/figmaAssets/group-1.png"
              />
              
              <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-[50px] border-2 border-solid border-white bg-white/20 backdrop-blur-sm">
                <p className="[font-family:'Raleway',Helvetica] font-bold text-blanco-100 text-sm sm:text-base lg:text-lg text-center tracking-[0] leading-[normal]">
                  CONTRATISTAS
                </p>
              </div>
            </div>
            
            <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-[50px] border-2 border-solid border-white bg-white/20 backdrop-blur-sm">
              <p className="[font-family:'Raleway',Helvetica] font-extrabold italic text-blanco-100 text-base sm:text-lg lg:text-xl tracking-[0] leading-[normal]">
                de forma rápida, confiable y geolocalizada
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features and CTA Section - Constant Distance from Title */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 mt-12 sm:mt-16 lg:mt-20 pb-8 sm:pb-12 lg:pb-16">
        <div className="w-full max-w-6xl mx-auto">
          {/* Features */}
          <Card className="w-full bg-grisprimario-10 rounded-[38px] shadow-[4px_4px_4px_#00000040] backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)] border-0 mb-6">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center w-[180px] sm:w-[200px] lg:w-[220px] h-[90px] sm:h-[100px] lg:h-[110px] bg-[#ffffff80] rounded-[25px] hover:bg-[#ffffff90] transition-colors"
                  >
                    <img
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mb-1 sm:mb-2"
                      alt={feature.label}
                      src={feature.icon}
                    />
                    <p className="[font-family:'Raleway',Helvetica] font-bold text-blanco-100 text-xs sm:text-sm lg:text-base tracking-[0] leading-[normal] text-center px-1">
                      {feature.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6">
            {userTypes.map((userType, index) => (
              <Link key={index} href={userType.href}>
                <Button
                  className={`flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-64 lg:w-[300px] h-12 sm:h-14 lg:h-16 ${userType.bgColor} ${userType.hoverColor} rounded-[50px] shadow-[4px_4px_4px_#00000040] transition-all duration-300 ease-in-out transform hover:scale-105`}
                >
                  <img
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                    alt={userType.label}
                    src={userType.icon}
                  />
                  <span className="[font-family:'Raleway',Helvetica] font-bold text-blanco-100 text-sm sm:text-base lg:text-lg text-center tracking-[0] leading-[normal]">
                    {userType.label}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
