import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicNavigation } from "@/components/DynamicNavigation";
import { ServiceSearchSection } from "@/components/sections/ServiceSearchSection";
import { ServiceDetailsCard } from "@/components/sections/ServiceDetailsCard";
import { ImageGallerySection } from "@/components/sections/ImageGallerySection";
import { LocationBadgesSection } from "@/components/sections/LocationBadgesSection";
import { CalendarSection } from "@/components/sections/CalendarSection";

const cropBadges = [
  {
    icon: "/figmaAssets/icono-productor.svg",
    label: "Soja",
  },
  {
    icon: "/figmaAssets/icono-productor.svg",
    label: "Trigo",
  },
  {
    icon: "/figmaAssets/icono-productor.svg",
    label: "Cebada",
  },
];

const galleryImages = [
  "/figmaAssets/atomo-foto-1.png",
  "/figmaAssets/atomo-foto-2.png",
  "/figmaAssets/atomo-foto-3.png",
  "/figmaAssets/atomo-foto-4.png",
  "/figmaAssets/atomo-foto-5.png",
];

const navigationItems = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/services/list" },
];

// Note: DynamicNavigation generates rightItems automatically based on auth state

export default function ServiciosPage(): JSX.Element {
  return (
    <div className="bg-grisprimario-100 w-full min-h-screen flex flex-col">
      <DynamicNavigation
        leftItems={navigationItems}
        variant="service"
      />

      <main className="flex-1 w-full py-8">
        {/* Centered Search Bar */}
        <div className="w-full flex justify-center mb-8">
          <ServiceSearchSection />
        </div>

        {/* Service Details and Calendar - Side by Side */}
        <div className="w-full max-w-6xl mx-auto px-4 mb-8">
          {/* Filter buttons in a single horizontal line */}
          <div className="flex justify-start mt-6 mb-4">
            <div className="flex items-center">
              {/* Service button */}
              <div className="inline-flex h-[39px] items-center gap-2.5 px-[30px] py-2 bg-verdeprimario-100 rounded-[50px]">
                <div className="mt-[-1.00px] text-blanco-100 text-[length:var(--raleway-bold-20pt-font-size)] font-raleway-bold-20pt font-[number:var(--raleway-bold-20pt-font-weight)] tracking-[var(--raleway-bold-20pt-letter-spacing)] leading-[var(--raleway-bold-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-20pt-font-style)]">
                  Servicio:
                </div>
                <div className="mt-[-1.00px] font-[number:var(--raleway-regular-20pt-font-weight)] text-blanco-100 text-[length:var(--raleway-regular-20pt-font-size)] font-raleway-regular-20pt tracking-[var(--raleway-regular-20pt-letter-spacing)] leading-[var(--raleway-regular-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-regular-20pt-font-style)]">
                  Cosecha
                </div>
              </div>

              {/* Crop filter buttons */}
              {cropBadges.map((badge, index) => (
                <div
                  key={index}
                  className="inline-flex h-[39px] items-center gap-[3px] pl-[9px] pr-3.5 py-[3px] bg-verdesecundario-100 rounded-3xl"
                >
                  <div className="flex flex-col w-[33px] h-[33px] items-center justify-center gap-2.5 p-1">
                    <img
                      className="w-[20px] h-[20px]"
                      alt="Crop icon"
                      src={badge.icon}
                    />
                  </div>
                  <div className="font-[number:var(--raleway-medium-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-medium-16pt-font-size)] font-raleway-medium-16pt tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-16pt-font-style)]">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-8">
            {/* Left Column - Service Details + Image Gallery + Location Badges */}
            <div className="flex-1">
              <ServiceDetailsCard />
              
              {/* Image Gallery - directly below service details */}
              <div className="mt-6">
                <ImageGallerySection />
              </div>
              
              {/* Location Badges - below image gallery */}
              <div className="mt-6">
                <LocationBadgesSection />
              </div>
            </div>

            {/* Right Column - Calendar */}
            <div className="w-[300px] flex-shrink-0 flex flex-col items-center">
              <CalendarSection />
              <Button className="w-[213px] h-[35px] bg-naranja-100 hover:bg-naranja-100/90 rounded-[50px] mt-4 h-auto px-[37px] py-2">
                <span className="font-raleway-bold-16pt font-[number:var(--raleway-bold-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-bold-16pt-font-size)] tracking-[var(--raleway-bold-16pt-letter-spacing)] leading-[var(--raleway-bold-16pt-line-height)] [font-style:var(--raleway-bold-16pt-font-style)]">
                  Ver disponibilidad
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="w-full h-[260px] bg-white rounded-[20px] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Map"
              src="/figmaAssets/basemap-image.png"
            />
          </div>
        </div>
      </main>

      <footer className="w-full bg-blanco-100 rounded-t-[20px] mt-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between w-full">
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <div className="w-[316px] h-[85px] flex items-center justify-center">
                <img
                  className="w-full h-full"
                  alt="AgroRed Logo"
                  src="/figmaAssets/frame-15.svg"
                />
              </div>
            </div>

            {/* Middle Section - Contact Information */}
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <svg className="w-5 h-5 text-verdeprimario-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-gray-800 font-raleway-medium-16pt">
                  Lorem ipsum dolor 2340, Montevideo, Uruguay
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <svg className="w-5 h-5 text-verdeprimario-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-800 font-raleway-medium-16pt">
                  Contacto@Agrored.com
                </span>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <svg className="w-5 h-5 text-verdeprimario-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-gray-800 font-raleway-medium-16pt">
                  (+598) 99 123 456 // (+598) 99 789 123
                </span>
              </div>
            </div>

            {/* Right Section - Map */}
            <div className="w-[400px] h-[200px] bg-white rounded-[20px] overflow-hidden shadow-lg">
              <img
                className="w-full h-full object-cover"
                alt="Map"
                src="/figmaAssets/basemap-image.png"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
