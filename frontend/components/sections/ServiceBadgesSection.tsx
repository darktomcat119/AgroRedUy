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
    <div className="mb-4">
      {/* Main Service Title Badge and Sub-badges - Inline */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Main Service Title Badge - Dark Green */}
        <ServiceBadge
          variant="primary"
          label="Servicio"
          value={serviceTitle}
        />

        {/* Sub-badges - Light Green */}
        {subBadges.length > 0 && (
          <>
            {subBadges.map((badge, index) => (
              <ServiceBadge
                key={badge.id || index}
                variant="secondary"
                value={badge.name}
                icon={badge.iconUrl}
                iconSize="small"
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

