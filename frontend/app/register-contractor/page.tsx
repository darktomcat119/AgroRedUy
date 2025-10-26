"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  Lock,
  Award
} from "lucide-react";

export default function RegisterContractorPage(): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    businessName: "",
    businessDescription: "",
    businessAddress: "",
    businessCity: "",
    businessDepartment: "",
    certifications: [] as string[],
    yearsExperience: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, ""]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = "Nombre es requerido";
      if (!formData.lastName) newErrors.lastName = "Apellido es requerido";
      if (!formData.email) newErrors.email = "Email es requerido";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
      if (!formData.phone) newErrors.phone = "Teléfono es requerido";
      else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = "Formato de teléfono inválido";
      }
    } else if (currentStep === 2) {
      if (!formData.businessName) newErrors.businessName = "Nombre del negocio es requerido";
      if (!formData.businessDescription) newErrors.businessDescription = "Descripción del negocio es requerida";
      if (!formData.businessAddress) newErrors.businessAddress = "Dirección del negocio es requerida";
      if (!formData.businessCity) newErrors.businessCity = "Ciudad del negocio es requerida";
      if (!formData.businessDepartment) newErrors.businessDepartment = "Departamento del negocio es requerido";
    } else if (currentStep === 3) {
      if (!formData.password) newErrors.password = "Contraseña es requerida";
      else if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    } else if (currentStep === 4) {
      // No validation needed for final step (certifications and experience are optional)
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setIsTransitioning(false);
    }, 300);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "Contraseña es requerida";
    else if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.firstName) newErrors.firstName = "Nombre es requerido";
    if (!formData.lastName) newErrors.lastName = "Apellido es requerido";
    if (!formData.phone) newErrors.phone = "Teléfono es requerido";
    if (!formData.businessName) newErrors.businessName = "Nombre del negocio es requerido";
    if (!formData.businessDescription) newErrors.businessDescription = "Descripción del negocio es requerida";
    if (!formData.businessAddress) newErrors.businessAddress = "Dirección del negocio es requerida";
    if (!formData.businessCity) newErrors.businessCity = "Ciudad es requerida";
    if (!formData.businessDepartment) newErrors.businessDepartment = "Departamento es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const { confirmPassword, ...contractorData } = formData;
      const response = await apiClient.registerContractor({
        ...contractorData,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : undefined,
        certifications: formData.certifications.filter(cert => cert.trim() !== "")
      });

      if (response.success) {
        router.push("/contractor-dashboard");
      } else {
        setErrors({ general: response.error?.message || "Error al registrar" });
      }
    } catch (error) {
      setErrors({ general: "Error de conexión. Intenta nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blanco-100 w-full min-h-screen flex overflow-hidden">
      {/* Left Section - Background Image */}
      <div className="w-[600px] h-screen relative flex-shrink-0 rounded-tr-[100px] rounded-br-[100px] overflow-hidden">
        <img
          className="w-full h-full object-cover"
          alt="Agricultural contractor"
          src="/figmaAssets/atomo-foto-4.png"
        />
      </div>

      {/* Right Section - Contractor Registration Form */}
      <div className="flex-1 bg-white rounded-l-[100px] p-8 flex flex-col justify-center items-center overflow-y-auto">
        <h1 className="text-5xl font-bold text-verdeprimario-100 mb-8 text-center font-barlow-bold-64pt">
          Registro de Contratista
        </h1>

        {/* Progress Indicator */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ease-in-out ${
                  index + 1 <= currentStep 
                    ? 'bg-verdeprimario-100 text-white scale-110' 
                    : 'bg-gray-300 text-gray-600 scale-100'
                }`}>
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-500 ease-in-out ${
                    index + 1 < currentStep ? 'bg-verdeprimario-100' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-verdeprimario-100 font-medium transition-all duration-300 ease-in-out">
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-6 text-center">
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-verdeprimario-100 font-medium mb-2 block">
                    Nombre *
                  </Label>
                  <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.firstName ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                    <div className="flex items-center justify-center w-6 h-6">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Nombre"
                    />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-verdeprimario-100 font-medium mb-2 block">
                    Apellido *
                  </Label>
                  <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.lastName ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                    <div className="flex items-center justify-center w-6 h-6">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Apellido"
                    />
                  </div>
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-verdeprimario-100 font-medium mb-2 block">
                  Email *
                </Label>
                <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.email ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                  <div className="flex items-center justify-center w-6 h-6">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                    placeholder="E-mail"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-verdeprimario-100 font-medium mb-2 block">
                  Teléfono *
                </Label>
                <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.phone ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                  <div className="flex items-center justify-center w-6 h-6">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                    placeholder="Teléfono"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {currentStep === 2 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-6 text-center">
                Información del Negocio
              </h3>
              
              <div>
                <Label htmlFor="businessName" className="text-verdeprimario-100 font-medium mb-2 block">
                  Nombre del Negocio *
                </Label>
                <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.businessName ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                  <div className="flex items-center justify-center w-6 h-6">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                    placeholder="Nombre del negocio"
                  />
                </div>
                {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <Label htmlFor="businessDescription" className="text-verdeprimario-100 font-medium mb-2 block">
                  Descripción del Negocio *
                </Label>
                <div className={`flex items-start gap-4 bg-verdeprimario-60 rounded-[22px] min-h-[80px] px-4 py-3 border ${errors.businessDescription ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                  <div className="flex items-start justify-center w-6 h-6 mt-2">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <Textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white resize-none"
                    placeholder="Describe tu negocio y servicios"
                    rows={3}
                  />
                </div>
                {errors.businessDescription && <p className="text-red-500 text-sm mt-1">{errors.businessDescription}</p>}
              </div>

              <div>
                <Label htmlFor="businessAddress" className="text-verdeprimario-100 font-medium mb-2 block">
                  Dirección del Negocio *
                </Label>
                <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.businessAddress ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                  <div className="flex items-center justify-center w-6 h-6">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    id="businessAddress"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                    placeholder="Dirección del negocio"
                  />
                </div>
                {errors.businessAddress && <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessCity" className="text-verdeprimario-100 font-medium mb-2 block">
                    Ciudad *
                  </Label>
                  <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.businessCity ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                    <div className="flex items-center justify-center w-6 h-6">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <Input
                      id="businessCity"
                      name="businessCity"
                      value={formData.businessCity}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Ciudad"
                    />
                  </div>
                  {errors.businessCity && <p className="text-red-500 text-sm mt-1">{errors.businessCity}</p>}
                </div>

                <div>
                  <Label htmlFor="businessDepartment" className="text-verdeprimario-100 font-medium mb-2 block">
                    Departamento *
                  </Label>
                  <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.businessDepartment ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                    <div className="flex items-center justify-center w-6 h-6">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <Input
                      id="businessDepartment"
                      name="businessDepartment"
                      value={formData.businessDepartment}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Departamento"
                    />
                  </div>
                  {errors.businessDepartment && <p className="text-red-500 text-sm mt-1">{errors.businessDepartment}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-6 text-center">
                Seguridad
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-verdeprimario-100 font-medium mb-2 block">
                    Contraseña *
                  </Label>
                  <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.password ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                    <div className="flex items-center justify-center w-6 h-6">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Contraseña"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-verdeprimario-100 font-medium mb-2 block">
                    Confirmar Contraseña *
                  </Label>
                  <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.confirmPassword ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                    <div className="flex items-center justify-center w-6 h-6">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Confirmar Contraseña"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Professional Details */}
          {currentStep === 4 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-6 text-center">
                Detalles Profesionales
              </h3>
              
              <div>
                <Label htmlFor="yearsExperience" className="text-verdeprimario-100 font-medium mb-2 block">
                  Años de Experiencia
                </Label>
                <div className="flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border border-verdeprimario-100 focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200">
                  <div className="flex items-center justify-center w-6 h-6">
                    <Briefcase className="w-4 h-4 text-verdeprimario-100" />
                  </div>
                  <Input
                    id="yearsExperience"
                    name="yearsExperience"
                    type="number"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                    placeholder="Años de experiencia"
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <Label className="text-verdeprimario-100 font-medium mb-2 block">
                  Certificaciones
                </Label>
                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border border-verdeprimario-100 focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200">
                      <div className="flex items-center justify-center w-6 h-6">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        value={cert}
                        onChange={(e) => handleCertificationChange(index, e.target.value)}
                        className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                        placeholder="Certificación"
                      />
                      <Button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addCertification}
                    className="w-full bg-verdeprimario-100 hover:bg-verdeprimario-60 text-white font-medium py-2 rounded-[22px] h-10 transition-all duration-200"
                  >
                    + Agregar Certificación
                  </Button>
                </div>
              </div>

              <div className="bg-verdeprimario-60 rounded-[22px] p-6">
                <h4 className="text-lg font-semibold text-verdeprimario-100 mb-3">
                  Resumen de tu información
                </h4>
                <div className="space-y-2 text-sm text-verdeprimario-100">
                  <p><strong>Nombre:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Teléfono:</strong> {formData.phone}</p>
                  <p><strong>Negocio:</strong> {formData.businessName}</p>
                  <p><strong>Ubicación:</strong> {formData.businessAddress}, {formData.businessCity}, {formData.businessDepartment}</p>
                  {formData.yearsExperience && <p><strong>Experiencia:</strong> {formData.yearsExperience} años</p>}
                  {formData.certifications.filter(cert => cert.trim() !== "").length > 0 && (
                    <p><strong>Certificaciones:</strong> {formData.certifications.filter(cert => cert.trim() !== "").join(", ")}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={`flex justify-between items-center mt-8 transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}>
            <Button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isTransitioning}
              className="flex items-center gap-4 rounded-[22px] border border-verdeprimario-100 bg-white hover:bg-verdeprimario-60 hover:text-verdeprimario-100 hover:border-verdeprimario-100 h-10 px-6 justify-center transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <span className="text-verdeprimario-100 font-medium font-raleway-medium-16pt hover:text-verdeprimario-100 transition-colors duration-200">
                Anterior
              </span>
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isTransitioning}
                className="flex items-center gap-4 rounded-[22px] border border-verdeprimario-100 bg-white hover:bg-verdeprimario-60 hover:text-verdeprimario-100 hover:border-verdeprimario-100 h-10 px-6 justify-center transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50"
              >
                <span className="text-verdeprimario-100 font-medium font-raleway-medium-16pt hover:text-verdeprimario-100 transition-colors duration-200">
                  Siguiente
                </span>
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || isTransitioning}
                className="flex items-center gap-4 rounded-[22px] border border-verdeprimario-100 bg-white hover:bg-verdeprimario-60 hover:text-verdeprimario-100 hover:border-verdeprimario-100 h-10 px-6 justify-center transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-verdeprimario-100 font-medium font-raleway-medium-16pt hover:text-verdeprimario-100 transition-colors duration-200">
                  {isLoading ? "Registrando..." : "Registrarse"}
                </span>
              </Button>
            )}
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-verdeprimario-100">
            ¿Ya tenés una cuenta?{" "}
            <Link href="/login" className="font-bold text-verdeprimario-100 hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
