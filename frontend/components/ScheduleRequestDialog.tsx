"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

function formatDDMMYYYY(date: Date | null): string {
  if (!date) return "";
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

interface ScheduleRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceTitle: string;
  startDate: Date | null;
  endDate: Date | null;
  onSuccess?: () => void;
}

export function ScheduleRequestDialog({
  open,
  onOpenChange,
  serviceId,
  serviceTitle,
  startDate,
  endDate,
  onSuccess,
}: ScheduleRequestDialogProps) {
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Por favor selecciona un rango de fechas en el calendario");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    setIsSubmitting(true);
    try {
      const { apiClient } = await import("@/lib/api");
      const resp = await apiClient.createScheduleRequest({
        serviceId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        message: message.trim() || undefined,
      });

      if (resp.success) {
        toast.success("Solicitud de horario enviada correctamente");
        onOpenChange(false);
        setMessage("");
        if (onSuccess) onSuccess();
      } else {
        toast.error((resp as any).error?.message || "Error al enviar solicitud");
      }
    } catch (error: any) {
      console.error("Error creating schedule request:", error);
      toast.error("Error al enviar solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-negro-100 font-raleway-bold-16pt">
            Solicitar Horario
          </DialogTitle>
          <DialogDescription className="text-grisprimario-200 font-raleway-medium-14pt">
            Solicita un horario para: {serviceTitle}
            {startDate && endDate && (
              <span className="block mt-2">
                Fechas seleccionadas: {formatDDMMYYYY(startDate)} - {formatDDMMYYYY(endDate)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {(!startDate || !endDate) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
              Por favor selecciona un rango de fechas en el calendario antes de enviar la solicitud.
            </div>
          )}
          
          <div>
            <Label
              htmlFor="message"
              className="text-negro-100 font-raleway-medium-14pt mb-2 block"
            >
              Mensaje (opcional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Agrega cualquier información adicional..."
              className="border-grisprimario-10 focus:border-verdeprimario-100 min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !startDate || !endDate}
            className="bg-naranja-100 hover:bg-naranja-100/90 text-blanco-100"
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

