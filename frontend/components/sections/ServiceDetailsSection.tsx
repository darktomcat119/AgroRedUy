import { SearchIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

const searchFields = [
  {
    label: "Servicios:",
    placeholder: "Buscar servicio",
    width: "w-[315px]",
    paddingX: "px-[45px]",
  },
  {
    label: "Desde:",
    placeholder: "Fecha",
    width: "w-[132px]",
    paddingX: "pl-[29px] pr-[11px]",
  },
  {
    label: "Hasta:",
    placeholder: "Fecha",
    width: "w-[132px]",
    paddingX: "pl-[29px] pr-[11px]",
  },
  {
    label: "Zona:",
    placeholder: "Seleccione la ubicación",
    width: "w-[231px]",
    paddingX: "px-[45px]",
  },
];

export const ServiceSearchSection = (): JSX.Element => {
  return (
    <section className="flex w-full items-start p-[7px] bg-blanco-100 rounded-[45px]">
      {searchFields.map((field, index) => (
        <div
          key={index}
          className={`${field.width} h-[77px] justify-center gap-1 ${field.paddingX} py-[18px] bg-blanco-100 rounded-[45px] flex flex-col items-start`}
        >
          <div className="text-negro-100 text-[length:var(--raleway-bold-14pt-font-size)] w-fit font-raleway-bold-14pt font-[number:var(--raleway-bold-14pt-font-weight)] tracking-[var(--raleway-bold-14pt-letter-spacing)] leading-[var(--raleway-bold-14pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-14pt-font-style)]">
            {field.label}
          </div>

          <div className="w-fit font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-grissecundario-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-14pt-font-style)]">
            {field.placeholder}
          </div>
        </div>
      ))}

      <Button className="flex flex-col w-[77px] h-[77px] items-center justify-center gap-2.5 px-5 py-[19px] bg-verdesecundario-100 rounded-[38.5px] hover:bg-verdesecundario-100/90 h-auto">
        <SearchIcon className="w-9 h-9 text-white" />
      </Button>
    </section>
  );
};

