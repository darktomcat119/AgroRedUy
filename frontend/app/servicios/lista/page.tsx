"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicNavigation } from "@/components/DynamicNavigation";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ServiceSearchSection } from "@/components/sections/ServiceSearchSection";

interface PublicServiceItem {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  department: string;
  pricePerHour?: number;
  price?: number;
  user?: { firstName?: string; lastName?: string };
}

const buttonPositions = [
  { left: "left-[112px]" },
  { left: "left-[446px]" },
  { left: "left-[780px]" },
  { left: "left-[1114px]" },
];

const navigationItems = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/services/list" },
];

const authItems = [
  { label: "Contacto", active: false, href: "/contacto" },
  { label: "Iniciar Sesión", active: false, href: "/login" },
];

export default function ServiciosListaPage(): JSX.Element {
  const router = useRouter();
  const [services, setServices] = useState<PublicServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const requestedPagesRef = useRef<Set<number>>(new Set([1]));
  const limit = 12;

  async function loadPage(nextPage: number) {
    try {
      const res: any = await apiClient.getServices({ page: nextPage, limit });
      let items: PublicServiceItem[] = [];
      let totalPages: number | undefined;
      let total: number | undefined;

      if (res?.success && res?.data) {
        const payload = res.data;
        // Try common shapes
        if (Array.isArray(payload?.services)) {
          items = payload.services as PublicServiceItem[];
          total = payload.total;
          totalPages = payload.totalPages ?? payload?.pagination?.pages;
        } else if (Array.isArray(payload?.data)) {
          items = payload.data as PublicServiceItem[];
          total = payload.total;
          totalPages = payload.totalPages ?? payload?.pagination?.pages;
        }
      }

      if (!Array.isArray(items)) items = [];

      setServices(prev => {
        const seen = new Set(prev.map(s => s.id));
        const merged = [...prev];
        for (const it of items) {
          if (!seen.has(it.id)) {
            merged.push(it);
            seen.add(it.id);
          }
        }
        return merged;
      });

      // Determine hasMore
      if (typeof totalPages === 'number') {
        setHasMore(nextPage < totalPages);
      } else if (typeof total === 'number') {
        const fetchedSoFar = (nextPage) * limit;
        setHasMore(fetchedSoFar < total);
      } else {
        setHasMore(items.length === limit);
      }
      setPage(nextPage);
    } catch {
      setHasMore(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadPage(1);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Infinite scroll handler on list container
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(async () => {
        ticking = false;
        if (!hasMore || isFetchingMore) return;
        const threshold = 200; // px from bottom
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom < threshold) {
          const nextPage = page + 1;
          if (requestedPagesRef.current.has(nextPage)) return;
          requestedPagesRef.current.add(nextPage);
          setIsFetchingMore(true);
          await loadPage(nextPage);
          setIsFetchingMore(false);
        }
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll as any);
  }, [page, hasMore, isFetchingMore]);

  return (
    <div className="bg-grisprimario-100 w-full min-h-screen flex flex-col overflow-x-hidden">
      <DynamicNavigation
        leftItems={navigationItems}
        variant="service"
      />

      <main className="flex-1 w-full py-8 relative">
        {/* Centered Search Bar */}
        <div className="w-full flex justify-center mb-8">
          <ServiceSearchSection />
        </div>
        {/* removed legacy badges/filter row */}
        {/* Section Title */}
        <h2 className="text-center text-3xl sm:text-4xl font-semibold text-verdeprimario-100 mb-8">
          Servicios disponibles
        </h2>

        {/* Services Grid (scrollable container) */}
        <div className="w-full max-w-[1440px] mx-auto px-6">
          {loading ? (
            <div className="text-center text-blanco-100 py-10">Cargando servicios...</div>
          ) : services.length === 0 ? (
            <div className="text-center text-blanco-100 py-10">No hay servicios disponibles.</div>
          ) : (
            <div ref={listRef} className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
              {services.map((service) => {
                const contractorName = `${service.user?.firstName || ''} ${service.user?.lastName || ''}`.trim() || 'Contratista';
                const price = typeof service.pricePerHour === 'number' ? service.pricePerHour : Number(service.price || 0);
                const currency = (service as any).priceCurrency || (service as any).currency || 'UYU';
                return (
                  <div key={service.id} className="flex flex-col items-stretch w-[315px] pb-6">
                    {/* Title pill */}
                    <div className="w-full h-[35px] bg-verdeprimario-100 shadow-[0_6px_10px_rgba(0,0,0,0.25)] rounded-[50px] flex items-center justify-center mb-2">
                      <span className="font-raleway-bold-16pt text-blanco-100 text-[16px]">
                    {service.title}
                  </span>
                </div>

                    {/* Card */}
                    <Card className="w-[315px] h-[279px] bg-white rounded-[20px] border border-[#e6e6e6] shadow-[0_6px_12px_rgba(0,0,0,0.15)] overflow-hidden">
                      <CardContent className="p-0">
                        <div className="px-6 py-5 space-y-4">
                          {/* Row: Contractor */}
                          <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                            <div className="font-raleway-bold-14pt font-semibold text-negro-100 text-[13px] sm:text-[14px]">Cosechador:</div>
                            <div className="font-raleway-medium-14pt text-negro-100 text-[13px] sm:text-[14px]">{contractorName}</div>
                  </div>
                          <div className="h-px bg-[#e6e6e6]" />
                          {/* Row: Price */}
                          <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                            <div className="font-raleway-bold-14pt font-semibold text-negro-100 text-[13px] sm:text:[14px]">Precio por hora:</div>
                            <div className="font-raleway-medium-14pt text-negro-100 text-[13px] sm:text-[14px]">{price > 0 ? `${price} ${currency}` : '-'}</div>
                  </div>
                          <div className="h-px bg-[#e6e6e6]" />
                          {/* Row: Description */}
                          <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                            <div className="font-raleway-bold-14pt font-semibold text-negro-100 text-[13px] sm:text-[14px]">Descripción</div>
                            <div className="font-raleway-medium-14pt text-negro-100 leading-relaxed text-[13px] sm:text-[14px] break-words line-clamp-4">
                              {service.description}
                  </div>
                </div>
              </div>
            </CardContent>
                </Card>
                
                    {/* CTA */}
                    <Button
                      className="w-[240px] h-[35px] bg-naranja-100 shadow-[0px_6px_10px_rgba(0,0,0,0.25)] rounded-[50px] hover:bg-naranja-100/90 -mt-4 mx-auto"
                      onClick={() => router.push(`/services/${service.id}`)}
                    >
                      <span className="font-raleway-bold-16pt text-blanco-100 text-[16px]">
                    Ver disponibilidad
                  </span>
                </Button>
                  </div>
                );
              })}
              </div>
              {isFetchingMore && (
                <div className="text-center text-blanco-100 py-4">Cargando más...</div>
              )}
              {!hasMore && services.length > 0 && (
                <div className="text-center text-grisprimario-200 py-4">No hay más resultados</div>
              )}
          </div>
          )}
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
