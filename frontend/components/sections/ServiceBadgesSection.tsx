import React from "react";
import { ServiceBadge } from "@/components/ui/ServiceBadge";

interface ServiceBadgesSectionProps {
  serviceTitle?: string;
  subBadges?: Array<{
    id?: string;
    name: string;
    iconUrl?: string;
  }>;
}

export const ServiceBadgesSection = ({
  serviceTitle,
  subBadges = []
}: ServiceBadgesSectionProps): JSX.Element => {
  if (!serviceTitle) return <></>;

  return (
    <div className="mb-8">
      {/* Main Service Title Badge - Dark Green */}
      <ServiceBadge
        variant="primary"
        label="Servicio"
        value={serviceTitle}
        className="mb-4"
      />

      {/* Sub-badges - Light Green */}
      {subBadges.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {subBadges.map((badge, index) => (
            <ServiceBadge
              key={badge.id || index}
              variant="secondary"
              value={badge.name}
              icon={badge.iconUrl}
              iconSize="small"
            />
          ))}
        </div>
      )}
    </div>
  );
};

