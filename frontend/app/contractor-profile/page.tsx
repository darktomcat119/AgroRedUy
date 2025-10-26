"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";

interface ContractorProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName: string;
  businessDescription: string;
  businessAddress: string;
  businessCity: string;
  businessDepartment: string;
  certifications: string[];
  yearsExperience?: number;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ContractorProfilePage(): JSX.Element {
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ContractorProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // In a real implementation, you would fetch the contractor's profile
      // For now, we'll use mock data
      const mockProfile: ContractorProfile = {
        id: "1",
        email: "contractor@example.com",
        firstName: "Juan",
        lastName: "Pérez",
        phone: "+59899123456",
        businessName: "AgroServicios Pérez",
        businessDescription: "Especialistas en servicios agrícolas con más de 10 años de experiencia en el sector.",
        businessAddress: "Ruta 5 Km 45",
        businessCity: "Canelones",
        businessDepartment: "Canelones",
        certifications: [
          "Certificación en Agricultura Orgánica",
          "Manejo Integrado de Plagas",
          "Uso Seguro de Agroquímicos"
        ],
        yearsExperience: 12,
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z"
      };
      
      setProfile(mockProfile);
      setFormData(mockProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...(formData.certifications || [])];
    newCertifications[index] = value;
    setFormData(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), ""]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = "Nombre es requerido";
    if (!formData.lastName) newErrors.lastName = "Apellido es requerido";
    if (!formData.phone) newErrors.phone = "Teléfono es requerido";
    else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Formato de teléfono inválido";
    }
    if (!formData.businessName) newErrors.businessName = "Nombre del negocio es requerido";
    if (!formData.businessDescription) newErrors.businessDescription = "Descripción del negocio es requerida";
    if (!formData.businessAddress) newErrors.businessAddress = "Dirección del negocio es requerida";
    if (!formData.businessCity) newErrors.businessCity = "Ciudad es requerida";
    if (!formData.businessDepartment) newErrors.businessDepartment = "Departamento es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // In a real implementation, you would update the profile via API
      console.log("Saving profile:", formData);
      setProfile(formData as ContractorProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blanco-100 flex items-center justify-center">
        <div className="text-verdeprimario-100">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blanco-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-verdeprimario-100 mb-2">
            Mi Perfil de Contratista
          </h1>
          <p className="text-gray-600">
            Gestiona tu información personal y del negocio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-verdeprimario-100">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-verdeprimario-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-verdeprimario-100">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <p className="text-gray-600">{profile?.businessName}</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    Activo
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span>{profile?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experiencia:</span>
                    <span>{profile?.yearsExperience} años</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-verdeprimario-100">
                  {isEditing ? "Editar Perfil" : "Información del Perfil"}
                </CardTitle>
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-verdeprimario-100 hover:bg-verdeprimario-100/90 text-white"
                  >
                    Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form className="space-y-6">
                    {errors.general && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {errors.general}
                      </div>
                    )}

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-verdeprimario-100 font-medium mb-2 block">
                          Nombre *
                        </Label>
                        <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.firstName ? 'border-red-500' : 'border-verdeprimario-100'}`}>
                          <div className="flex items-center justify-center w-6 h-6">
                            <img
                              className="w-4 h-4"
                              alt="User icon"
                              src="/figmaAssets/subtract.svg"
                            />
                          </div>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName || ""}
                            onChange={handleInputChange}
                            className="flex-1 bg-transparent border-0 text-verdeprimario-100 placeholder:text-verdeprimario-100 focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto"
                            placeholder="Nombre"
                          />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="lastName" className="text-verdeprimario-100 font-medium">
                          Apellido *
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName || ""}
                          onChange={handleInputChange}
                          className={`mt-1 ${errors.lastName ? 'border-red-500' : 'border-verdeprimario-100'}`}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-verdeprimario-100 font-medium">
                        Teléfono *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.phone ? 'border-red-500' : 'border-verdeprimario-100'}`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Business Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-xl font-semibold text-verdeprimario-100 mb-4">Información del Negocio</h3>
                      
                      <div>
                        <Label htmlFor="businessName" className="text-verdeprimario-100 font-medium">
                          Nombre del Negocio *
                        </Label>
                        <Input
                          id="businessName"
                          name="businessName"
                          value={formData.businessName || ""}
                          onChange={handleInputChange}
                          className={`mt-1 ${errors.businessName ? 'border-red-500' : 'border-verdeprimario-100'}`}
                        />
                        {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="businessDescription" className="text-verdeprimario-100 font-medium">
                          Descripción del Negocio *
                        </Label>
                        <Textarea
                          id="businessDescription"
                          name="businessDescription"
                          value={formData.businessDescription || ""}
                          onChange={handleInputChange}
                          rows={3}
                          className={`mt-1 ${errors.businessDescription ? 'border-red-500' : 'border-verdeprimario-100'}`}
                        />
                        {errors.businessDescription && <p className="text-red-500 text-sm mt-1">{errors.businessDescription}</p>}
                      </div>

                      <div>
                        <Label htmlFor="businessAddress" className="text-verdeprimario-100 font-medium">
                          Dirección del Negocio *
                        </Label>
                        <Input
                          id="businessAddress"
                          name="businessAddress"
                          value={formData.businessAddress || ""}
                          onChange={handleInputChange}
                          className={`mt-1 ${errors.businessAddress ? 'border-red-500' : 'border-verdeprimario-100'}`}
                        />
                        {errors.businessAddress && <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessCity" className="text-verdeprimario-100 font-medium">
                            Ciudad *
                          </Label>
                          <Input
                            id="businessCity"
                            name="businessCity"
                            value={formData.businessCity || ""}
                            onChange={handleInputChange}
                            className={`mt-1 ${errors.businessCity ? 'border-red-500' : 'border-verdeprimario-100'}`}
                          />
                          {errors.businessCity && <p className="text-red-500 text-sm mt-1">{errors.businessCity}</p>}
                        </div>

                        <div>
                          <Label htmlFor="businessDepartment" className="text-verdeprimario-100 font-medium">
                            Departamento *
                          </Label>
                          <Input
                            id="businessDepartment"
                            name="businessDepartment"
                            value={formData.businessDepartment || ""}
                            onChange={handleInputChange}
                            className={`mt-1 ${errors.businessDepartment ? 'border-red-500' : 'border-verdeprimario-100'}`}
                          />
                          {errors.businessDepartment && <p className="text-red-500 text-sm mt-1">{errors.businessDepartment}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="yearsExperience" className="text-verdeprimario-100 font-medium">
                          Años de Experiencia
                        </Label>
                        <Input
                          id="yearsExperience"
                          name="yearsExperience"
                          type="number"
                          min="0"
                          max="50"
                          value={formData.yearsExperience || ""}
                          onChange={handleInputChange}
                          className="mt-1 border-verdeprimario-100"
                        />
                      </div>

                      {/* Certifications */}
                      <div>
                        <Label className="text-verdeprimario-100 font-medium">
                          Certificaciones
                        </Label>
                        <div className="mt-2 space-y-2">
                          {(formData.certifications || []).map((cert, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={cert}
                                onChange={(e) => handleCertificationChange(index, e.target.value)}
                                placeholder="Ej: Certificación en Agricultura Orgánica"
                                className="border-verdeprimario-100"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removeCertification(index)}
                                className="text-red-500 border-red-500 hover:bg-red-50"
                              >
                                Eliminar
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addCertification}
                            className="border-verdeprimario-100 text-verdeprimario-100 hover:bg-verdeprimario-100/10"
                          >
                            + Agregar Certificación
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button
                        type="button"
                        onClick={handleSave}
                        className="bg-verdeprimario-100 hover:bg-verdeprimario-100/90 text-white"
                      >
                        Guardar Cambios
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-verdeprimario-100 text-verdeprimario-100 hover:bg-verdeprimario-100/10"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Display current profile information */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-verdeprimario-100 font-medium">Nombre del Negocio</Label>
                        <p className="text-gray-900">{profile?.businessName}</p>
                      </div>
                      
                      <div>
                        <Label className="text-verdeprimario-100 font-medium">Descripción del Negocio</Label>
                        <p className="text-gray-900">{profile?.businessDescription}</p>
                      </div>
                      
                      <div>
                        <Label className="text-verdeprimario-100 font-medium">Dirección</Label>
                        <p className="text-gray-900">{profile?.businessAddress}, {profile?.businessCity}, {profile?.businessDepartment}</p>
                      </div>
                      
                      <div>
                        <Label className="text-verdeprimario-100 font-medium">Años de Experiencia</Label>
                        <p className="text-gray-900">{profile?.yearsExperience} años</p>
                      </div>
                      
                      <div>
                        <Label className="text-verdeprimario-100 font-medium">Certificaciones</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile?.certifications?.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
