import toast from 'react-hot-toast';
import React from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimesCircle, 
  FaSpinner
} from 'react-icons/fa';

// Toast configuration for consistent styling across the app
const toastConfig = {
  success: {
    duration: 4000,
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981'
    }
  },
  error: {
    duration: 5000,
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444'
    }
  },
  warning: {
    duration: 4000,
    style: {
      background: '#F59E0B',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#F59E0B'
    }
  },
  info: {
    duration: 4000,
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3B82F6'
    }
  }
};

// Custom toast functions with consistent styling and SVG icons
export const customToast = {
  success: (message: string) => {
    return toast.success(message, {
      ...toastConfig.success,
      icon: React.createElement(FaCheckCircle, { className: "text-white", size: 20 })
    });
  },
  
  error: (message: string) => {
    return toast.error(message, {
      ...toastConfig.error,
      icon: React.createElement(FaTimesCircle, { className: "text-white", size: 20 })
    });
  },
  
  warning: (message: string) => {
    return toast(message, {
      ...toastConfig.warning,
      icon: React.createElement(FaExclamationTriangle, { className: "text-white", size: 20 })
    });
  },
  
  info: (message: string) => {
    return toast(message, {
      ...toastConfig.info,
      icon: React.createElement(FaInfoCircle, { className: "text-white", size: 20 })
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#6B7280',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px'
      },
      icon: React.createElement(FaSpinner, { className: "text-white animate-spin", size: 20 })
    });
  },
  
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  }
};

// Specific toast messages for common actions with SVG icons
export const toastMessages = {
  // User Management
  userCreated: (name: string) => `Usuario "${name}" creado exitosamente`,
  userUpdated: (name: string) => `Usuario "${name}" actualizado exitosamente`,
  userDeleted: (name: string) => `Usuario "${name}" eliminado exitosamente`,
  userActivated: (name: string) => `Usuario "${name}" activado exitosamente`,
  userDeactivated: (name: string) => `Usuario "${name}" desactivado exitosamente`,
  
  // Service Management
  serviceCreated: (name: string) => `Servicio "${name}" creado exitosamente`,
  serviceUpdated: (name: string) => `Servicio "${name}" actualizado exitosamente`,
  serviceDeleted: (name: string) => `Servicio "${name}" eliminado exitosamente`,
  serviceActivated: (name: string) => `Servicio "${name}" activado exitosamente`,
  serviceDeactivated: (name: string) => `Servicio "${name}" desactivado exitosamente`,
  
  // Booking Management
  bookingCreated: (id: string) => `Reserva #${id} creada exitosamente`,
  bookingUpdated: (id: string) => `Reserva #${id} actualizada exitosamente`,
  bookingDeleted: (id: string) => `Reserva #${id} eliminada exitosamente`,
  bookingConfirmed: (id: string) => `Reserva #${id} confirmada exitosamente`,
  bookingCancelled: (id: string) => `Reserva #${id} cancelada exitosamente`,
  
  // Authentication
  loginSuccess: (email: string) => `Bienvenido, ${email}`,
  logoutSuccess: () => `Sesión cerrada exitosamente`,
  passwordChanged: () => `Contraseña actualizada exitosamente`,
  
  // General Errors
  networkError: () => `Error de conexión. Verifica tu internet`,
  serverError: () => `Error del servidor. Intenta más tarde`,
  validationError: (field: string) => `Error de validación en ${field}`,
  unauthorizedError: () => `No tienes permisos para esta acción`,
  notFoundError: (item: string) => `${item} no encontrado`,
  
  // General Success
  dataLoaded: () => `Datos cargados exitosamente`,
  dataSaved: () => `Datos guardados exitosamente`,
  operationCompleted: () => `Operación completada exitosamente`
};

export default customToast;
