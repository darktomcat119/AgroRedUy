import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicNavigation } from "@/components/DynamicNavigation";
import Link from "next/link";

const navigationItems = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/services/list" },
];

// Note: DynamicNavigation generates rightItems automatically based on auth state

const contactInfo = [
  {
    icon: MapPinIcon,
    text: "Lorem ipsum dolor 2340, Montevideo, Uruguay",
  },
  {
    icon: MailIcon,
    text: "Contacto@Agrored.com",
  },
  {
    icon: PhoneIcon,
    text: "(+598) 99 123 456 // (+598) 99 789 123",
  },
];

const formFields = [
  { label: "Nombre y Apellido", type: "text" },
  { label: "Número de celular", type: "tel" },
  { label: "E-mail", type: "email" },
  { label: "Mensaje", type: "text" },
];

export default function ContactoPage(): JSX.Element {
  return (
    <div className="bg-grisprimario-100 w-full min-h-screen flex flex-col">
      <header className="relative w-full h-[330px]">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          alt="Rectangle"
          src="/figmaAssets/rectangle-23.png"
        />

        <DynamicNavigation
          leftItems={navigationItems}
          variant="home"
          sticky={false}
          containerTransparent={true}
          className="relative h-[182px] max-w-[1440px] mx-auto w-full"
        />
      </header>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-[172px] pt-[58px]">
        <div className="flex gap-[182px]">
          <section className="flex-shrink-0">
            <h1 className="w-[400px] font-barlow-bold-64pt font-[number:var(--barlow-bold-64pt-font-weight)] text-verdeprimario-100 text-[length:var(--barlow-bold-64pt-font-size)] tracking-[var(--barlow-bold-64pt-letter-spacing)] leading-[var(--barlow-bold-64pt-line-height)] [font-style:var(--barlow-bold-64pt-font-style)]">
              Contactanos!
            </h1>

            <p className="mt-[77px] font-raleway-semibold-italic-20pt font-[number:var(--raleway-semibold-italic-20pt-font-weight)] [font-style:var(--raleway-semibold-italic-20pt-font-style)] text-verdeprimario-100 text-[length:var(--raleway-semibold-italic-20pt-font-size)] tracking-[var(--raleway-semibold-italic-20pt-letter-spacing)] leading-[var(--raleway-semibold-italic-20pt-line-height)] whitespace-nowrap">
              Estamos siempre listos para responder tus dudas
            </p>

            <div className="mt-[87px] flex flex-col gap-[41px]">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div key={index} className="flex items-center gap-[34px]">
                    <div className="flex items-center justify-center w-[33px] h-[33px] flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-verdeprimario-100" />
                    </div>
                    <p className="font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-verdeprimario-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">
                      {info.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex-1">
            <form className="flex flex-col gap-[11px]">
              {formFields.map((field, index) => (
                <div key={index} className="flex flex-col gap-[7px]">
                  <Label
                    htmlFor={`field-${index}`}
                    className="font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-naranja-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={`field-${index}`}
                    type={field.type}
                    className="h-11 rounded-[25px] border border-solid border-[#f67f2d] bg-transparent"
                  />
                </div>
              ))}

              <Button
                type="submit"
                className="w-[104px] h-11 mt-[81px] bg-verdeprimario-100 rounded-[34px] shadow-[4px_4px_4px_#00000026] font-raleway-bold-16pt font-[number:var(--raleway-bold-16pt-font-weight)] text-blanco-100 text-[length:var(--raleway-bold-16pt-font-size)] tracking-[var(--raleway-bold-16pt-letter-spacing)] leading-[var(--raleway-bold-16pt-line-height)] [font-style:var(--raleway-bold-16pt-font-style)] hover:bg-verdeprimario-100/90"
              >
                Enviar
              </Button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
