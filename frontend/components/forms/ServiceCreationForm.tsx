/**
 * @fileoverview Service creation form component
 * Allows users to create new agricultural services
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, DollarSign, Calendar, Upload, CheckCircle, AlertCircle } from 'lucide-react';

// Validation schema
const serviceSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  pricePerHour: z.number().min(0, 'El precio debe ser mayor a 0'),
  priceMin: z.number().min(0, 'El precio mínimo debe ser mayor a 0').optional(),
  priceMax: z.number().min(0, 'El precio máximo debe ser mayor a 0').optional(),
  latitude: z.number().min(-90, 'Latitud inválida').max(90, 'Latitud inválida'),
  longitude: z.number().min(-180, 'Longitud inválida').max(180, 'Longitud inválida'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(200, 'La dirección no puede exceder 200 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres').max(50, 'La ciudad no puede exceder 50 caracteres'),
  department: z.string().min(2, 'El departamento debe tener al menos 2 caracteres').max(50, 'El departamento no puede exceder 50 caracteres'),
  categoryId: z.string().min(1, 'Debe seleccionar una categoría')
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

interface ServiceCreationFormProps {
  onSuccess?: (service: any) => void;
  onCancel?: () => void;
}

export function ServiceCreationForm({ onSuccess, onCancel }: ServiceCreationFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema)
  });

  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // For now, we'll use hardcoded categories
        // In a real app, you'd fetch these from the API
        const hardcodedCategories: Category[] = [
          { id: '1', name: 'Cosecha', description: 'Servicios de cosecha de cultivos' },
          { id: '2', name: 'Siembra', description: 'Servicios de siembra y plantación' },
          { id: '3', name: 'Fumigación', description: 'Servicios de fumigación y control de plagas' },
          { id: '4', name: 'Fertilización', description: 'Servicios de fertilización y nutrición' },
          { id: '5', name: 'Riego', description: 'Servicios de riego y manejo del agua' },
          { id: '6', name: 'Poda', description: 'Servicios de poda y mantenimiento' },
          { id: '7', name: 'Labranza', description: 'Servicios de labranza y preparación de suelo' },
          { id: '8', name: 'Carga y transporte', description: 'Servicios de carga y transporte' }
        ];
        setCategories(hardcodedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Error al cargar las categorías');
      }
    };

    loadCategories();
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setValue('latitude', latitude);
          setValue('longitude', longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location to Montevideo, Uruguay
          setValue('latitude', -34.9);
          setValue('longitude', -56.2);
        }
      );
    } else {
      // Set default location to Montevideo, Uruguay
      setValue('latitude', -34.9);
      setValue('longitude', -56.2);
    }
  }, [setValue]);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await apiClient.createService(data);

      if (response.success) {
        setSuccess('Servicio creado exitosamente');
        reset();
        onSuccess?.(response.data);
      } else {
        setError(response.error?.message || 'Error al crear el servicio');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      setError('Error inesperado al crear el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setValue('latitude', currentLocation.latitude);
      setValue('longitude', currentLocation.longitude);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Crear Nuevo Servicio
        </CardTitle>
        <CardDescription>
          Completa la información para publicar tu servicio agrícola
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Servicio *
                </label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Ej: Cosecha de Soja"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <Select onValueChange={(value) => setValue('categoryId', value)}>
                  <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe tu servicio en detalle..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Precios
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por Hora (USD) *
                </label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  {...register('pricePerHour', { valueAsNumber: true })}
                  placeholder="50.00"
                  className={errors.pricePerHour ? 'border-red-500' : ''}
                />
                {errors.pricePerHour && (
                  <p className="text-red-500 text-sm mt-1">{errors.pricePerHour.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Mínimo (USD)
                </label>
                <Input
                  id="priceMin"
                  type="number"
                  step="0.01"
                  {...register('priceMin', { valueAsNumber: true })}
                  placeholder="40.00"
                  className={errors.priceMin ? 'border-red-500' : ''}
                />
                {errors.priceMin && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceMin.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Máximo (USD)
                </label>
                <Input
                  id="priceMax"
                  type="number"
                  step="0.01"
                  {...register('priceMax', { valueAsNumber: true })}
                  placeholder="60.00"
                  className={errors.priceMax ? 'border-red-500' : ''}
                />
                {errors.priceMax && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceMax.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Ruta 5, km 45"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Montevideo"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento *
                </label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Montevideo"
                  className={errors.department ? 'border-red-500' : ''}
                />
                {errors.department && (
                  <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Coordenadas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      step="any"
                      {...register('latitude', { valueAsNumber: true })}
                      placeholder="Latitud"
                      className={errors.latitude ? 'border-red-500' : ''}
                    />
                    {errors.latitude && (
                      <p className="text-red-500 text-sm mt-1">{errors.latitude.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="any"
                      {...register('longitude', { valueAsNumber: true })}
                      placeholder="Longitud"
                      className={errors.longitude ? 'border-red-500' : ''}
                    />
                    {errors.longitude && (
                      <p className="text-red-500 text-sm mt-1">{errors.longitude.message}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useCurrentLocation}
                  className="w-full"
                >
                  Usar Ubicación Actual
                </Button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-verdeprimario-100 hover:bg-verdeprimario-100/90"
            >
              {isLoading ? 'Creando...' : 'Crear Servicio'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
