"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Edit, UserPlus, UserMinus, Shield, Ban } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'info';
  icon?: 'delete' | 'edit' | 'add' | 'remove' | 'block' | 'unblock' | 'warning';
  isLoading?: boolean;
}

const iconMap = {
  delete: Trash2,
  edit: Edit,
  add: UserPlus,
  remove: UserMinus,
  block: Ban,
  unblock: Shield,
  warning: AlertTriangle
};

const variantStyles = {
  destructive: {
    button: 'bg-red-600 hover:bg-red-700 text-white',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  warning: {
    button: 'bg-orange-600 hover:bg-orange-700 text-white',
    icon: 'text-orange-600',
    border: 'border-orange-200'
  },
  info: {
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  }
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'destructive',
  icon = 'warning',
  isLoading = false
}: ConfirmDialogProps) {
  const IconComponent = iconMap[icon];
  const styles = variantStyles[variant];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-grisprimario-10 bg-blanco-100">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <IconComponent className={`h-6 w-6 ${styles.icon}`} />
          </div>
          <DialogTitle className="text-lg font-semibold text-negro-100 font-raleway-bold-16pt">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-grisprimario-200 font-raleway-medium-14pt">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto border-grisprimario-10 text-grisprimario-200 hover:bg-grisprimario-10 hover:text-negro-100 font-raleway-medium-16pt"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto ${styles.button} font-raleway-medium-16pt`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Procesando...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Predefined dialog configurations for common actions
export const ConfirmDialogs = {
  deleteUser: (userName: string) => ({
    title: 'Eliminar Usuario',
    description: `¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    variant: 'destructive' as const,
    icon: 'delete' as const
  }),
  
  editUser: (userName: string) => ({
    title: 'Editar Usuario',
    description: `¿Estás seguro de que quieres guardar los cambios para "${userName}"?`,
    confirmText: 'Guardar Cambios',
    variant: 'info' as const,
    icon: 'edit' as const
  }),
  
  createUser: () => ({
    title: 'Crear Usuario',
    description: '¿Estás seguro de que quieres crear este nuevo usuario?',
    confirmText: 'Crear Usuario',
    variant: 'info' as const,
    icon: 'add' as const
  }),
  
  toggleUserStatus: (userName: string, isActive: boolean) => ({
    title: isActive ? 'Desactivar Usuario' : 'Activar Usuario',
    description: `¿Estás seguro de que quieres ${isActive ? 'desactivar' : 'activar'} al usuario "${userName}"?`,
    confirmText: isActive ? 'Desactivar' : 'Activar',
    variant: 'warning' as const,
    icon: isActive ? 'block' : 'unblock' as const
  }),
  
  createService: () => ({
    title: 'Crear Servicio',
    description: '¿Estás seguro de que quieres crear este nuevo servicio?',
    confirmText: 'Crear Servicio',
    variant: 'info' as const,
    icon: 'add' as const
  }),
  
  editService: (serviceName: string) => ({
    title: 'Editar Servicio',
    description: `¿Estás seguro de que quieres guardar los cambios para el servicio "${serviceName}"?`,
    confirmText: 'Guardar Cambios',
    variant: 'info' as const,
    icon: 'edit' as const
  }),
  
  deleteService: (serviceName: string) => ({
    title: 'Eliminar Servicio',
    description: `¿Estás seguro de que quieres eliminar el servicio "${serviceName}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    variant: 'destructive' as const,
    icon: 'delete' as const
  }),
  
  deleteBooking: (bookingId: string) => ({
    title: 'Eliminar Reserva',
    description: `¿Estás seguro de que quieres eliminar la reserva #${bookingId}? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    variant: 'destructive' as const,
    icon: 'delete' as const
  })
};
