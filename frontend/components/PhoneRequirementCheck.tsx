'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Phone, User } from 'lucide-react';
import Link from 'next/link';

interface PhoneRequirementCheckProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  showProfileLink?: boolean;
}

/**
 * @description Component that checks if user has a phone number before allowing contractor contact
 * @param children - Content to show if user has phone number
 * @param fallbackMessage - Custom message to show if no phone
 * @param showProfileLink - Whether to show link to profile page
 */
export const PhoneRequirementCheck: React.FC<PhoneRequirementCheckProps> = ({
  children,
  fallbackMessage = "Necesitas agregar tu número de teléfono para contactar contratistas.",
  showProfileLink = true
}) => {
  const { user } = useAuth();

  // Check if user has a phone number
  const hasPhone = user?.phone && user.phone.trim() !== '';

  if (hasPhone) {
    return <>{children}</>;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <Phone className="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Teléfono Requerido
      </h3>
      
      <p className="text-yellow-700 mb-4">
        {fallbackMessage}
      </p>
      
      {showProfileLink && (
        <div className="space-y-2">
          <p className="text-sm text-yellow-600 mb-3">
            Ve a tu perfil para agregar tu número de teléfono:
          </p>
          <Link href="/profile">
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <User className="w-4 h-4 mr-2" />
              Ir al Perfil
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
