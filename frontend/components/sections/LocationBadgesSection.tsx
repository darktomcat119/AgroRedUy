import React from "react";
import { ServiceBadge } from "@/components/ui/ServiceBadge";

interface LocationBadgesSectionProps {
  zone?: string;
  radius?: string;
}

export const LocationBadgesSection = ({
  zone = "Cerro Largo",
  radius = "Radio de 50 KM"
}: LocationBadgesSectionProps = {}): JSX.Element => {
  return (
    <div className="flex gap-3">
      {/* Zona: Cerro Largo - Dark Green Badge */}
      <ServiceBadge
        variant="primary"
        label="Zona"
        value={zone}
      />

      {/* Radio de 50 KM - Light Green Badge with Icon */}
      <ServiceBadge
        variant="secondary"
        value={radius}
        icon="/figmaAssets/icono-ubicacion-frame-5.svg"
        iconSize="medium"
        className="rounded-[50px]"
      />
    </div>
  );
};
