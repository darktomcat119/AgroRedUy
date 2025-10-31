import React from "react";

export type ServiceBadgeVariant = "primary" | "secondary";

interface ServiceBadgeProps {
  variant?: ServiceBadgeVariant;
  label?: string;
  value: string;
  icon?: string;
  iconSize?: "small" | "medium";
  className?: string;
}

/**
 * Reusable service badge component for displaying service-related information
 * @description Supports two variants:
 * - primary: Dark green badge with label/value pair (e.g., "Servicio: Cosecha")
 * - secondary: Light green badge with optional icon (e.g., "Soja", "Radio de 50 KM")
 */
export const ServiceBadge = ({
  variant = "primary",
  label,
  value,
  icon,
  iconSize = "small",
  className = ""
}: ServiceBadgeProps): JSX.Element => {
  const baseClasses = "inline-flex h-[39px] items-center";
  
  if (variant === "primary") {
    // Primary badge: Dark green with label/value
    return (
      <div className={`${baseClasses} gap-2.5 px-[30px] py-2 bg-verdeprimario-100 rounded-[50px] ${className}`}>
        {label && (
          <div className="mt-[-1.00px] text-blanco-100 text-[length:var(--raleway-bold-20pt-font-size)] font-raleway-bold-20pt font-[number:var(--raleway-bold-20pt-font-weight)] tracking-[var(--raleway-bold-20pt-letter-spacing)] leading-[var(--raleway-bold-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-20pt-font-style)]">
            {label}:
          </div>
        )}
        <div className="mt-[-1.00px] font-[number:var(--raleway-regular-20pt-font-weight)] text-blanco-100 text-[length:var(--raleway-regular-20pt-font-size)] font-raleway-regular-20pt tracking-[var(--raleway-regular-20pt-letter-spacing)] leading-[var(--raleway-regular-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-regular-20pt-font-style)]">
          {value}
        </div>
      </div>
    );
  }

  // Secondary badge: Light green with icon (always shows, uses default if not provided)
  const iconWrapperSize = iconSize === "small" ? "w-[33px] h-[33px]" : "w-[33px] h-[33px]";
  const iconSizeClass = iconSize === "small" ? "w-[15.61px] h-[15.46px]" : "w-[33px] h-[33px]";
  const defaultIcon = "/figmaAssets/subBadge.svg";
  const iconSrc = icon || defaultIcon;
  
  return (
    <div className={`${baseClasses} gap-[3px] pl-[9px] pr-3.5 py-[3px] bg-verdesecundario-100 rounded-3xl ${className}`}>
      <div className={`flex flex-col ${iconWrapperSize} items-center justify-center gap-2.5 ${iconSize === "small" ? "p-2.5" : ""}`}>
        <img
          className={iconSizeClass}
          alt={`${value} icon`}
          src={iconSrc}
          onError={(e) => {
            // Fallback to default if custom icon fails to load
            if (iconSrc !== defaultIcon) {
              (e.target as HTMLImageElement).src = defaultIcon;
            }
          }}
        />
      </div>
      <div className="font-[number:var(--raleway-medium-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-medium-16pt-font-size)] font-raleway-medium-16pt tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-16pt-font-style)]">
        {value}
      </div>
    </div>
  );
};

