"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DynamicNavigation } from '@/components/DynamicNavigation';
import { ServiceSearchSection } from '@/components/sections/ServiceSearchSection';
import { ServiceDetailsCard } from '@/components/sections/ServiceDetailsCard';
import { ImageGallerySection } from '@/components/sections/ImageGallerySection';
import { LocationBadgesSection } from '@/components/sections/LocationBadgesSection';
import { CalendarSection } from '@/components/sections/CalendarSection';
import { Button } from '@/components/ui/button';
import { ServiceMap } from '@/components/maps/ServiceMap';
import { apiClient } from '@/lib/api';

const IG: any = ImageGallerySection;

export default function ServiceDetailsPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = useMemo(() => (params?.id as string) || '', [params]);

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const resp = await apiClient.getService(id);
      if (!active) return;
      if (resp.success && resp.data) setService(resp.data);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [id]);

  // Load categories and areas for search
  useEffect(() => {
    let active = true;
    const loadSearchData = async () => {
      try {
        // Load categories
        const catResp = await apiClient.getCategories();
        if (active && catResp.success && catResp.data) {
          setCategories(catResp.data);
        }
        
        // Load initial services to get areas
        const servResp = await apiClient.getServices({ page: 1, limit: 100 });
        if (active && servResp.success && servResp.data) {
          const items = Array.isArray(servResp.data?.services) 
            ? servResp.data.services 
            : Array.isArray(servResp.data?.data) 
              ? servResp.data.data 
              : [];
          const areaSet = new Set<string>();
          items.forEach((item: any) => {
            if (item.department) areaSet.add(item.department);
            if (item.city) areaSet.add(item.city);
          });
          setAreas(Array.from(areaSet));
        }
      } catch (error) {
        console.error("Error loading search data:", error);
      }
    };
    loadSearchData();
    return () => {
      active = false;
    };
  }, []);

  const navigationItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/servicios/lista' },
  ];
  // Note: DynamicNavigation generates rightItems automatically based on auth state

  const galleryImages = (service?.images || []).map((img: any) => img.imageUrl);
  const contractorName = service ? `${service.user?.firstName || ''} ${service.user?.lastName || ''}`.trim() : undefined;
  const priceLabel = service ? `UYU ${Math.round(service.price)}/hora` : undefined;
  const contact = service?.user?.email || undefined;
  const description = service?.description || undefined;

  return (
    <div className="bg-grisprimario-100 w-full min-h-screen flex flex-col">
      <DynamicNavigation leftItems={navigationItems} variant="service" />

      <main className="flex-1 w-full py-8">
        <div className="w-full flex justify-center mb-8">
          <ServiceSearchSection
            categories={categories}
            areas={areas}
            onSearch={({ categoryId, area, startDate, endDate }) => {
              const params = new URLSearchParams();
              if (categoryId && categoryId !== 'all') params.set('categoryId', categoryId);
              if (area && area !== 'all') params.set('area', area);
              if (startDate) params.set('startDate', startDate.toISOString());
              if (endDate) params.set('endDate', endDate.toISOString());
              router.push(`/servicios/lista${params.toString() ? `?${params.toString()}` : ''}`);
            }}
          />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 mb-8">
          <div className="flex gap-8">
            <div className="flex-1">
              <ServiceDetailsCard contractorName={contractorName} priceLabel={priceLabel} contact={contact} description={description} />
              <div className="mt-6"><IG images={galleryImages} /></div>
              <div className="mt-6"><LocationBadgesSection /></div>
            </div>
            <div className="w-[300px] flex-shrink-0 flex flex-col items-center">
              <CalendarSection availableDates={(service?.availability || []).map((a: any) => a.date)} />
              <Button className="w-[213px] h-[35px] bg-naranja-100 hover:bg-naranja-100/90 rounded-[50px] mt-4 h-auto px-[37px] py-2">
                <span className="font-raleway-bold-16pt text-blanco-100">Ver disponibilidad</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="w-full h-[260px] bg-white rounded-[20px] overflow-hidden">
            <ServiceMap
              initialLat={service?.latitude ?? -32.5228}
              initialLng={service?.longitude ?? -55.7658}
              zoom={service ? 10 : 7}
              className="w-full h-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
}


