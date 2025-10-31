"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

interface SubBadge {
  name: string;
  iconUrl?: string;
}

interface SubBadgeManagerProps {
  badges: SubBadge[];
  onChange: (badges: SubBadge[]) => void;
}

/**
 * Component for managing service sub-badges
 * @description Allows adding, editing, and removing sub-badges (e.g., "Soja", "Trigo", "Cebada")
 */
export const SubBadgeManager = ({ badges, onChange }: SubBadgeManagerProps): JSX.Element => {
  const [localBadges, setLocalBadges] = useState<SubBadge[]>(badges || []);

  const handleAddBadge = () => {
    const newBadges = [...localBadges, { name: '', iconUrl: '' }];
    setLocalBadges(newBadges);
    onChange(newBadges);
  };

  const handleRemoveBadge = (index: number) => {
    const newBadges = localBadges.filter((_, i) => i !== index);
    setLocalBadges(newBadges);
    onChange(newBadges);
  };

  const handleUpdateBadge = (index: number, field: keyof SubBadge, value: string) => {
    const newBadges = [...localBadges];
    newBadges[index] = { ...newBadges[index], [field]: value };
    setLocalBadges(newBadges);
    onChange(newBadges);
  };

  React.useEffect(() => {
    console.log('SubBadgeManager received badges prop:', badges);
    setLocalBadges(badges || []);
  }, [badges]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Sub-badges (Ej: Soja, Trigo, Cebada)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddBadge}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>

      <div className="space-y-2">
        {localBadges.map((badge, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Nombre del badge (ej: Soja)"
              value={badge.name}
              onChange={(e) => handleUpdateBadge(index, 'name', e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="URL del icono (opcional)"
              value={badge.iconUrl || ''}
              onChange={(e) => handleUpdateBadge(index, 'iconUrl', e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveBadge(index)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {localBadges.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            No hay sub-badges. Haz clic en "Agregar" para añadir uno.
          </p>
        )}
      </div>
    </div>
  );
};


