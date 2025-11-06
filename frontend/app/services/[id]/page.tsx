"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicNavigation } from "@/components/DynamicNavigation";
import { ServiceSearchSection } from "@/components/sections/ServiceSearchSection";
import { ServiceBadgesSection } from "@/components/sections/ServiceBadgesSection";
import { ServiceDetailsCard } from "@/components/sections/ServiceDetailsCard";
import { ImageGallerySection } from "@/components/sections/ImageGallerySection";
import { LocationBadgesSection } from "@/components/sections/LocationBadgesSection";
import { CalendarSection } from "@/components/sections/CalendarSection";
import { Button } from "@/components/ui/button";
import { ServiceMap } from "@/components/maps/ServiceMap";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ScheduleRequestDialog } from "@/components/ScheduleRequestDialog";

export default function ServiceDetailsPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = useMemo(() => (params?.id as string) || "", [params]);

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any | null>(null);
  const [hasAcceptedRequest, setHasAcceptedRequest] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const resp = await apiClient.getService(id);
      if (!active) return;
      if (resp.success && resp.data) {
        setService(resp.data);
        // Check if user has accepted schedule request
        if (isAuthenticated) {
          try {
            const checkResp = await apiClient.checkAcceptedRequest(id);
            if (checkResp.success && checkResp.data?.hasAccepted) {
              setHasAcceptedRequest(true);
            }
          } catch (error) {
            console.error("Error checking accepted request:", error);
          }
        }
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

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
          const data: any = servResp.data;
          const items = Array.isArray(data.services) 
            ? data.services 
            : Array.isArray(data.data) 
              ? data.data 
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
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "/services/list" },
  ];

  const galleryImages = (service?.images || []).map((img: any) => img.imageUrl);
  const contractorName = service ? `${service.user?.firstName || ""} ${service.user?.lastName || ""}`.trim() : undefined;
  const priceUnit = (service as any)?.priceCurrency || (service as any)?.currency || "UYU";
  const priceLabel = service ? `${priceUnit} ${Math.round((service as any).price || (service as any).pricePerHour || 0)}/hora` : undefined;
  // Only show phone if user is authenticated AND has accepted schedule request
  const contact = (isAuthenticated && hasAcceptedRequest) ? (service?.user?.phone || undefined) : undefined;
  const description = service?.description || undefined;
  const zone = service ? `${service.department || ""}${service.city && service.department ? ", " : ""}${service.city || ""}`.trim() : undefined;
  const radius = service?.radius ? `Radio de ${service.radius} KM` : undefined;

  return (
    <div className="bg-grisprimario-100 w-full min-h-screen flex flex-col">
      <DynamicNavigation leftItems={navigationItems} variant="service" />

      <main className="flex-1 w-full py-8">
        <div className="w-full flex justify-center mb-8">
          <ServiceSearchSection
            categories={categories}
            areas={areas}
            onSearch={({ categoryId, area, startDate, endDate }) => {
              const qs = new URLSearchParams();
              if (categoryId && categoryId !== "all") qs.set("categoryId", categoryId);
              if (area && area !== "all") qs.set("area", area);
              if (startDate) qs.set("startDate", startDate.toISOString());
              if (endDate) qs.set("endDate", endDate.toISOString());
              router.push(`/services/list${qs.toString() ? `?${qs.toString()}` : ""}`);
            }}
          />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 mb-8">
          <div className="flex gap-8">
            <div className="flex-1">
              <ServiceBadgesSection 
                serviceTitle={service?.title} 
                subBadges={(service as any)?.subBadges || []} 
              />
              <ServiceDetailsCard contractorName={contractorName} priceLabel={priceLabel} contact={contact} description={description} />
              {galleryImages.length > 0 && (
                <div className="mt-6">
                  <ImageGallerySection images={galleryImages} />
                </div>
              )}
              <div className="mt-6"><LocationBadgesSection zone={zone} radius={radius} /></div>
            </div>
            <div className="w-[300px] flex-shrink-0 flex flex-col items-center">
              <CalendarSection 
                availableDates={(service?.availability || []).map((a: any) => a.date)}
                onDateRangeChange={(startDate, endDate) => {
                  setSelectedStartDate(startDate);
                  setSelectedEndDate(endDate);
                }}
              />
              <Button 
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/login');
                  } else {
                    setIsScheduleDialogOpen(true);
                  }
                }}
                className="w-[213px] h-[35px] bg-naranja-100 hover:bg-naranja-100/90 rounded-[50px] mt-4 h-auto px-[37px] py-2"
              >
                <span className="font-raleway-bold-16pt text-blanco-100">Solicitar Horario</span>
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

      {service && (
        <ScheduleRequestDialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
          serviceId={service.id}
          serviceTitle={service.title}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          onSuccess={() => {
            // Clear selected dates after successful submission
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            // Refresh to check for accepted request (after admin accepts)
            // Note: This will be updated when admin accepts the request
          }}
        />
      )}
    </div>
  );
}


