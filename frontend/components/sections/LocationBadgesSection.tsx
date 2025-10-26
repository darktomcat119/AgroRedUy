import React from "react";

export const LocationBadgesSection = (): JSX.Element => {
  return (
    <div className="flex gap-3">
      {/* Zona: Cerro Largo - Dark Green Badge */}
      <div className="inline-flex h-[39px] items-center gap-2.5 px-[30px] py-2 bg-verdeprimario-100 rounded-[50px]">
        <div className="mt-[-1.00px] text-blanco-100 text-[length:var(--raleway-bold-20pt-font-size)] font-raleway-bold-20pt font-[number:var(--raleway-bold-20pt-font-weight)] tracking-[var(--raleway-bold-20pt-letter-spacing)] leading-[var(--raleway-bold-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-20pt-font-style)]">
          Zona:
        </div>
        <div className="mt-[-1.00px] font-[number:var(--raleway-regular-20pt-font-weight)] text-blanco-100 text-[length:var(--raleway-regular-20pt-font-size)] font-raleway-regular-20pt tracking-[var(--raleway-regular-20pt-letter-spacing)] leading-[var(--raleway-regular-20pt-line-height)] whitespace-nowrap [font-style:var(--raleway-regular-20pt-font-style)]">
          Cerro Largo
        </div>
      </div>

      {/* Radio de 50 KM - Light Green Badge with Icon */}
      <div className="inline-flex h-[39px] items-center gap-[3px] pl-[9px] pr-3.5 py-[3px] bg-verdesecundario-100 rounded-[50px]">
        <img
          className="w-[33px] h-[33px]"
          alt="Location icon"
          src="/figmaAssets/icono-ubicacion-frame-5.svg"
        />
        <div className="font-[number:var(--raleway-medium-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-medium-16pt-font-size)] font-raleway-medium-16pt tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-16pt-font-style)]">
          Radio de 50 KM
        </div>
      </div>
    </div>
  );
};
