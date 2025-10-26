import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { ServiceSearchSection } from "@/components/sections/ServiceSearchSection";

const serviceData = [
  {
    left: "left-[61px]",
    title: "Cosecha de Manzana",
    cosechador: "Ricardo Mollo",
    precio: "USD 200",
    contacto: "099 123 456",
    descripcion:
      "Hace más de 20 años que trabajamos con un equipo responsable para que tu cosecha no sea un problema",
  },
  {
    left: "left-[395px]",
    title: "Cosecha de Manzana",
    cosechador: "Ricardo Mollo",
    precio: "USD 200",
    contacto: "099 123 456",
    descripcion:
      "Hace más de 20 años que trabajamos con un equipo responsable para que tu cosecha no sea un problema",
  },
  {
    left: "left-[729px]",
    title: "Cosecha de Manzana",
    cosechador: "Ricardo Mollo",
    precio: "USD 200",
    contacto: "099 123 456",
    descripcion:
      "Hace más de 20 años que trabajamos con un equipo responsable para que tu cosecha no sea un problema",
  },
  {
    left: "left-[1063px]",
    title: "Cosecha de Manzana",
    cosechador: "Ricardo Mollo",
    precio: "USD 200",
    contacto: "099 123 456",
    descripcion:
      "Hace más de 20 años que trabajamos con un equipo responsable para que tu cosecha no sea un problema",
  },
];

const buttonPositions = [
  { left: "left-[112px]" },
  { left: "left-[446px]" },
  { left: "left-[780px]" },
  { left: "left-[1114px]" },
];

const navigationItems = [
  { label: "Inicio", active: false, href: "/" },
  { label: "Servicios", active: true, href: "/servicios" },
];

const authItems = [
  { label: "Contacto", active: false, href: "/contacto" },
  { label: "Iniciar Sesión", active: false, href: "/login" },
];

export default function ServiciosListaPage(): JSX.Element {
  return (
    <div className="bg-grisprimario-100 w-full min-h-screen flex flex-col">
      <Navigation
        leftItems={navigationItems}
        rightItems={authItems}
        variant="service"
      />

      <main className="flex-1 w-full py-8 relative">
        {/* Centered Search Bar */}
        <div className="w-full flex justify-center mb-8">
          <ServiceSearchSection />
        </div>

        {/* Filter buttons in a single horizontal line */}
        <div className="w-full max-w-6xl mx-auto px-4 mb-8">
          <div className="flex justify-start mt-4">
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
              <div className="inline-flex h-[39px] items-center gap-[3px] pl-[9px] pr-3.5 py-[3px] bg-verdesecundario-100 rounded-3xl ml-2">
                <div className="flex flex-col w-[33px] h-[33px] items-center justify-center gap-2.5 p-1">
                  <img
                    className="w-[20px] h-[20px]"
                    alt="Crop icon"
                    src="/figmaAssets/icono-productor.svg"
                  />
                </div>
                <div className="font-[number:var(--raleway-medium-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-medium-16pt-font-size)] font-raleway-medium-16pt tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-16pt-font-style)]">
                  Soja
                </div>
              </div>

              <div className="inline-flex h-[39px] items-center gap-[3px] pl-[9px] pr-3.5 py-[3px] bg-verdesecundario-100 rounded-3xl ml-2">
                <div className="flex flex-col w-[33px] h-[33px] items-center justify-center gap-2.5 p-1">
                  <img
                    className="w-[20px] h-[20px]"
                    alt="Crop icon"
                    src="/figmaAssets/icono-productor.svg"
                  />
                </div>
                <div className="font-[number:var(--raleway-medium-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-medium-16pt-font-size)] font-raleway-medium-16pt tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-16pt-font-style)]">
                  Trigo
                </div>
              </div>

              <div className="inline-flex h-[39px] items-center gap-[3px] pl-[9px] pr-3.5 py-[3px] bg-verdesecundario-100 rounded-3xl ml-2">
                <div className="flex flex-col w-[33px] h-[33px] items-center justify-center gap-2.5 p-1">
                  <img
                    className="w-[20px] h-[20px]"
                    alt="Crop icon"
                    src="/figmaAssets/icono-productor.svg"
                  />
                </div>
                <div className="font-[number:var(--raleway-medium-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-medium-16pt-font-size)] font-raleway-medium-16pt tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-16pt-font-style)]">
                  Cebada
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-center text-4xl font-semibold text-verdeprimario-100 mb-8">
          Servicios disponibles
        </h2>

        {/* Services Grid */}
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceData.map((service, index) => (
              <div key={`service-${index}`} className="flex flex-col">
                <div className="w-full h-[39px] bg-verdeprimario-100 shadow-[3px_3px_4px_#00000040] rounded-[50px] flex items-center justify-center mb-4">
                  <span className="font-raleway-bold-20pt font-[number:var(--raleway-bold-20pt-font-weight)] text-blanco-100 text-[length:var(--raleway-bold-20pt-font-size)] tracking-[var(--raleway-bold-20pt-letter-spacing)] leading-[var(--raleway-bold-20pt-line-height)] [font-style:var(--raleway-bold-20pt-font-style)]">
                    {service.title}
                  </span>
                </div>

                <Card className="flex flex-col w-full h-[279px] items-center justify-center bg-white rounded-[25px] shadow-[4px_4px_4px_#00000040]">
            <CardContent className="p-0 w-full flex flex-col items-center">
              <div className="h-9 flex flex-col w-[265px] items-start justify-center gap-2.5">
                <div className="flex items-center gap-3.5 px-4 py-2.5 flex-1 self-stretch w-full bg-white border-b-[0.7px] [border-bottom-style:solid] border-[#c8c8c8]">
                  <div className="mt-[-0.70px] font-[number:var(--raleway-bold-14pt-font-weight)] whitespace-nowrap w-fit font-raleway-bold-14pt text-negro-100 text-[length:var(--raleway-bold-14pt-font-size)] tracking-[var(--raleway-bold-14pt-letter-spacing)] leading-[var(--raleway-bold-14pt-line-height)] [font-style:var(--raleway-bold-14pt-font-style)]">
                    Cosechador:
                  </div>
                  <div className="mt-[-0.70px] font-[number:var(--raleway-medium-14pt-font-weight)] whitespace-nowrap w-fit font-raleway-medium-14pt text-negro-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">
                    {service.cosechador}
                  </div>
                </div>
              </div>

              <div className="h-12 flex flex-col w-[265px] items-start justify-center gap-2.5">
                <div className="flex items-center gap-3.5 px-4 py-2.5 flex-1 self-stretch w-full bg-white border-b-[0.7px] [border-bottom-style:solid] border-[#c8c8c8]">
                  <div className="mt-[-2.70px] mb-[-1.30px] font-[number:var(--raleway-bold-14pt-font-weight)] w-fit font-raleway-bold-14pt text-negro-100 text-[length:var(--raleway-bold-14pt-font-size)] tracking-[var(--raleway-bold-14pt-letter-spacing)] leading-[var(--raleway-bold-14pt-line-height)] [font-style:var(--raleway-bold-14pt-font-style)]">
                    Precio x<br />
                    hectárea estimado:
                  </div>
                  <div className="w-fit whitespace-nowrap font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-negro-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">
                    {service.precio}
                  </div>
                </div>
              </div>

              <div className="h-9 flex flex-col w-[265px] items-start justify-center gap-2.5">
                <div className="flex items-center gap-3.5 px-4 py-2.5 flex-1 self-stretch w-full bg-white border-b-[0.7px] [border-bottom-style:solid] border-[#c8c8c8]">
                  <div className="mt-[-0.70px] font-[number:var(--raleway-bold-14pt-font-weight)] whitespace-nowrap w-fit font-raleway-bold-14pt text-negro-100 text-[length:var(--raleway-bold-14pt-font-size)] tracking-[var(--raleway-bold-14pt-letter-spacing)] leading-[var(--raleway-bold-14pt-line-height)] [font-style:var(--raleway-bold-14pt-font-style)]">
                    Contacto:
                  </div>
                  <div className="mt-[-0.70px] font-[number:var(--raleway-medium-14pt-font-weight)] whitespace-nowrap w-fit font-raleway-medium-14pt text-negro-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">
                    {service.contacto}
                  </div>
                </div>
              </div>

              <div className="flex w-[265px] h-[116px] items-center gap-3.5 px-4 py-2.5 bg-white border-b-[0.7px] [border-bottom-style:solid] border-[#c8c8c8]">
                <div className="font-[number:var(--raleway-bold-14pt-font-weight)] whitespace-nowrap w-fit font-raleway-bold-14pt text-negro-100 text-[length:var(--raleway-bold-14pt-font-size)] tracking-[var(--raleway-bold-14pt-letter-spacing)] leading-[var(--raleway-bold-14pt-line-height)] [font-style:var(--raleway-bold-14pt-font-style)]">
                  Descripción
                </div>
                <div className="self-stretch w-[147px] mt-[-0.70px] mr-[-8.00px] font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-negro-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">
                  {service.descripcion}
                </div>
              </div>
            </CardContent>
                </Card>
                
                <Button className="w-[213px] h-[35px] bg-naranja-100 shadow-[0px_4px_4px_#00000040] rounded-[50px] hover:bg-naranja-100/90 mt-4 mx-auto">
                  <span className="[font-family:'Raleway',Helvetica] font-bold text-blanco-100 text-base tracking-[0] leading-[normal] whitespace-nowrap">
                    Ver disponibilidad
                  </span>
                </Button>
              </div>
            ))}
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
