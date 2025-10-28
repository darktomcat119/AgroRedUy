"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/AvatarUpload";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { fileUploadService } from "@/lib/fileUpload";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building, 
  Briefcase, 
  Lock
} from "lucide-react";
import { UploadResult } from "@/lib/fileUpload";

const socialButtons = [
  {
    icon: "/figmaAssets/image-4.png",
    text: "Continuar con Google",
    alt: "Google",
    provider: "google",
  },
  {
    icon: "/figmaAssets/iconos-inicio-registro.svg",
    text: "Continuar con Apple",
    alt: "Apple",
    provider: "apple",
  },
  {
    icon: "/figmaAssets/image-5.png",
    text: "Continuar con Facebook",
    alt: "Facebook",
    provider: "facebook",
  },
];

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const totalSteps = 4;

  const handleOAuthLogin = async (provider: string) => {
    try {
      // Check if OAuth is available
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/v1/oauth/status`);
      const data = await response.json();
      
      if (!data.providers[provider]) {
        setErrors({ general: `OAuth with ${provider} is not available in development mode. Please use email/password registration.` });
        return;
      }
      
      // Store current page for redirect after OAuth
      localStorage.setItem('redirectAfterAuth', '/dashboard');
      
      // Redirect to OAuth provider
      window.location.href = `${backendUrl}/api/v1/oauth/${provider}`;
    } catch (error) {
      setErrors({ general: 'Unable to check OAuth availability. Please try again.' });
    }
  };
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    dateOfBirth: "",
    gender: "",
    occupation: "",
    company: "",
    interests: [] as string[],
    newsletter: false,
    terms: false,
    profileImageUrl: ""
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ""
      }));
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarUpload = (result: UploadResult) => {
    if (result.success && result.url) {
      setFormData(prev => ({
        ...prev,
        profileImageUrl: result.url!
      }));
    }
  };

  const handleFileSelect = (file: File) => {
    console.log('Avatar file selected:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    setAvatarFile(file);
  };

  const handleAvatarRemove = () => {
    setFormData(prev => ({
      ...prev,
      profileImageUrl: ""
    }));
    setAvatarFile(null);
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Only essential fields are required
      if (!formData.firstName) newErrors.firstName = "Nombre es requerido";
      if (!formData.lastName) newErrors.lastName = "Apellido es requerido";
      if (!formData.email) newErrors.email = "Email es requerido";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
      if (!formData.password) newErrors.password = "Contraseña es requerida";
      else if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    } else if (currentStep === 2) {
      // Personal details - all optional, no validation needed
    } else if (currentStep === 3) {
      // Professional info - all optional, no validation needed
    } else if (currentStep === 4) {
      if (!formData.terms) newErrors.terms = "Debes aceptar los términos y condiciones";
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
    } else {
      // Show toast for validation errors
      const currentStepErrors = Object.values(errors).filter(error => error);
      if (currentStepErrors.length > 0) {
        toast.error(`Por favor corrige los errores: ${currentStepErrors.join(', ')}`);
      }
    }
  };

  const handleSkip = () => {
    setSkippedSteps(prev => [...prev, currentStep]);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => {
        const newStep = Math.max(prev - 1, 1);
        // Remove from skipped steps if going back
        setSkippedSteps(prevSkipped => prevSkipped.filter(step => step !== newStep));
        return newStep;
      });
      setIsTransitioning(false);
    }, 300);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only essential fields are required
    if (!formData.email) newErrors.email = "Email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "Contraseña es requerida";
    else if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.firstName) newErrors.firstName = "Nombre es requerido";
    if (!formData.lastName) newErrors.lastName = "Apellido es requerido";
    if (!formData.terms) newErrors.terms = "Debes aceptar los términos y condiciones";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Prepare user data for registration (exclude confirmPassword and terms)
      const { confirmPassword, terms, ...userData } = formData;
      console.log('Sending registration data:', userData);
      const response = await apiClient.register(userData);
      console.log('Registration response:', response);

      if (response.success) {
        // Store auth tokens after successful registration
        if ((response.data as any)?.accessToken) {
          localStorage.setItem('accessToken', (response.data as any).accessToken);
          console.log('Access token stored after registration');
        }
        if ((response.data as any)?.refreshToken) {
          localStorage.setItem('refreshToken', (response.data as any).refreshToken);
          console.log('Refresh token stored after registration');
        }
        
        // Show success toast
        toast.success("¡Registro exitoso! Revisa tu email para verificar tu cuenta.");
        
        // If there's an avatar file, upload it after successful registration
        if (avatarFile) {
          console.log('Avatar file found, starting upload process...', {
            fileName: avatarFile.name,
            fileSize: avatarFile.size,
            fileType: avatarFile.type
          });
          try {
            // Get the auth token from the registration response
            const token = (response.data as any)?.accessToken || localStorage.getItem('accessToken');
            if (token) {
              console.log('Auth token found, uploading avatar...', { token: token.substring(0, 20) + '...' });
              const uploadResult = await fileUploadService.uploadAvatar(avatarFile, token);
              if (uploadResult.success) {
                console.log('Avatar uploaded successfully after registration:', uploadResult.url);
                toast.success("Avatar subido correctamente");
                
                // Update user profile with the real avatar URL
                try {
                  if ((response.data as any)?.user?.id) {
                    await apiClient.updateUserProfile((response.data as any).user.id, {
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      email: formData.email,
                      profileImageUrl: uploadResult.url
                    });
                    console.log('Profile updated with avatar URL');
                  } else {
                    console.error('No user ID found in registration response');
                    toast.error("Avatar subido pero no se pudo actualizar perfil");
                  }
                } catch (updateError) {
                  console.error('Error updating profile with avatar URL:', updateError);
                  toast.error("Avatar subido pero error al actualizar perfil");
                }
              } else {
                console.error('Avatar upload failed:', uploadResult.error);
                toast.error("Error al subir avatar: " + (uploadResult.error || "Error desconocido"));
              }
            } else {
              console.error('No auth token found after registration');
              toast.error("Error: No se pudo obtener token de autenticación");
            }
          } catch (uploadError) {
            console.error('Error uploading avatar after registration:', uploadError);
            toast.error("Error al subir avatar, pero el registro fue exitoso");
            // Don't fail the registration if avatar upload fails
          }
        }
        
        // Redirect to email verification page
        router.push("/verify-email?email=" + encodeURIComponent(formData.email));
      } else {
        // Handle validation errors from backend
        if (response.error?.code === 'VALIDATION_ERROR' && response.error?.details) {
          const fieldErrors: Record<string, string> = {};
          
          // Parse validation errors and map them to field names
          response.error.details.forEach((detail: any) => {
            if (detail.path && detail.msg) {
              fieldErrors[detail.path] = detail.msg;
            }
          });
          
          setErrors(fieldErrors);
          
          // Show toast with validation errors
          const errorMessages = response.error.details.map((detail: any) => detail.msg).join(', ');
          toast.error(`Errores de validación: ${errorMessages}`);
        } else {
          // General error
          const errorMessage = response.error?.message || "Error al registrar";
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle network or other errors
      let errorMessage = "Error de conexión. Intenta nuevamente.";
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blanco-100 w-full h-screen flex overflow-hidden">
      {/* Left Section - Background Image */}
      <div className="w-[600px] h-screen relative flex-shrink-0 rounded-tr-[100px] rounded-br-[100px] overflow-hidden">
        <img
          className="w-full h-full object-cover"
          alt="Agricultural machinery"
          src="/figmaAssets/atomo-foto-4.png"
        />
      </div>

      {/* Right Section - Register Form */}
      <div className="flex-1 bg-white rounded-l-[100px] p-8 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-2xl pt-8">
          <h1 className="text-5xl font-bold text-verdeprimario-100 mb-8 text-center font-barlow-bold-64pt">
            Registrarse
          </h1>

          {/* Progress Indicator */}
          <div className="w-full mb-8">
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
                {(currentStep === 2 || currentStep === 3) && (
                  <span className="text-sm text-gray-500 ml-2">(Opcional)</span>
                )}
              </p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Step 1: Essential Information */}
          {currentStep === 1 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-6 text-center">
                Información Esencial
              </h3>
              
              {/* Avatar Upload */}
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <Label className="text-verdeprimario-100 font-medium mb-4 block">
                    Foto de Perfil
                  </Label>
                  <AvatarUpload
                    currentAvatar={formData.profileImageUrl}
                    onUpload={handleAvatarUpload}
                    onFileSelect={handleFileSelect}
                    onRemove={handleAvatarRemove}
                    size="lg"
                    className="mx-auto"
                    requireAuth={false}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Sube una foto para tu perfil (opcional)
                  </p>
                </div>
              </div>
              
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

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-2">
                  Detalles Personales
                </h3>
                <p className="text-sm text-gray-600">Esta información es opcional</p>
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-verdeprimario-100 font-medium mb-2 block">
                  Teléfono
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth" className="text-verdeprimario-100 font-medium mb-2 block">
                    Fecha de Nacimiento
                  </Label>
                    <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.dateOfBirth ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                      <div className="flex items-center justify-center w-6 h-6">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <Label htmlFor="gender" className="text-verdeprimario-100 font-medium mb-2 block">
                    Género
                  </Label>
                    <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.gender ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                      <div className="flex items-center justify-center w-6 h-6">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white"
                    >
                      <option value="" className="text-gray-900 bg-white">Seleccionar género</option>
                      <option value="masculino" className="text-gray-900 bg-white">Masculino</option>
                      <option value="femenino" className="text-gray-900 bg-white">Femenino</option>
                      <option value="otro" className="text-gray-900 bg-white">Otro</option>
                      <option value="prefiero-no-decir" className="text-gray-900 bg-white">Prefiero no decir</option>
                    </select>
                  </div>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div>
                  <Label htmlFor="address" className="text-verdeprimario-100 font-medium mb-2 block">
                    Dirección
                  </Label>
                  <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.address ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                    <div className="flex items-center justify-center w-6 h-6">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                    placeholder="Dirección"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-verdeprimario-100 font-medium mb-2 block">
                    Ciudad
                  </Label>
                    <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.city ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                      <div className="flex items-center justify-center w-6 h-6">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Ciudad"
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="department" className="text-verdeprimario-100 font-medium mb-2 block">
                    Departamento
                  </Label>
                    <div className={`flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border ${errors.department ? 'border-red-500' : 'border-verdeprimario-100'} focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200`}>
                      <div className="flex items-center justify-center w-6 h-6">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Departamento"
                    />
                  </div>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Professional Information */}
          {currentStep === 3 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-2">
                  Información Profesional
                </h3>
                <p className="text-sm text-gray-600">Esta información es opcional</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation" className="text-verdeprimario-100 font-medium mb-2 block">
                    Ocupación
                  </Label>
                    <div className="flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border border-verdeprimario-100 focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200">
                      <div className="flex items-center justify-center w-6 h-6">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Ocupación"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company" className="text-verdeprimario-100 font-medium mb-2 block">
                    Empresa
                  </Label>
                    <div className="flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border border-verdeprimario-100 focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200">
                      <div className="flex items-center justify-center w-6 h-6">
                        <Building className="w-4 h-4 text-white" />
                      </div>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                      placeholder="Empresa"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Terms and Conditions */}
          {currentStep === 4 && (
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
            }`}>
              <h3 className="text-2xl font-semibold text-verdeprimario-100 mb-6 text-center">
                Términos y Condiciones
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-verdeprimario-100 border-verdeprimario-100 rounded focus:ring-verdeprimario-100 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-verdeprimario-100 leading-relaxed">
                    Acepto los <Link href="/terms" className="underline font-medium">términos y condiciones</Link> y la <Link href="/privacy" className="underline font-medium">política de privacidad</Link> *
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

                <div className="flex items-start space-x-3">
                  <input
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-verdeprimario-100 border-verdeprimario-100 rounded focus:ring-verdeprimario-100 mt-1"
                  />
                  <label htmlFor="newsletter" className="text-sm text-verdeprimario-100 leading-relaxed">
                    Quiero recibir noticias, ofertas y actualizaciones por email
                  </label>
                </div>
              </div>

              <div className="bg-verdeprimario-60 rounded-[22px] p-6">
                <h4 className="text-lg font-semibold text-verdeprimario-100 mb-3">
                  Resumen de tu información
                </h4>
                <div className="space-y-2 text-sm text-verdeprimario-100">
                  {formData.profileImageUrl && (
                    <div className="flex items-center gap-2 mb-3">
                      <img 
                        src={getImageUrl(formData.profileImageUrl)} 
                        alt="Profile preview" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span><strong>Foto de perfil:</strong> Subida</span>
                    </div>
                  )}
                  <p><strong>Nombre:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  {formData.phone && <p><strong>Teléfono:</strong> {formData.phone}</p>}
                  {(formData.address || formData.city || formData.department) && (
                    <p><strong>Ubicación:</strong> {[formData.address, formData.city, formData.department].filter(Boolean).join(', ')}</p>
                  )}
                  {formData.occupation && <p><strong>Ocupación:</strong> {formData.occupation}</p>}
                  {formData.company && <p><strong>Empresa:</strong> {formData.company}</p>}
                  {skippedSteps.includes(2) && <p className="text-gray-500 italic">Detalles personales omitidos</p>}
                  {skippedSteps.includes(3) && <p className="text-gray-500 italic">Información profesional omitida</p>}
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
              <div className="flex gap-3">
                {/* Skip button for optional steps */}
                {(currentStep === 2 || currentStep === 3) && (
                  <Button
                    type="button"
                    onClick={handleSkip}
                    disabled={isTransitioning}
                    className="flex items-center gap-4 rounded-[22px] border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 h-10 px-6 justify-center transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50"
                  >
                    <span className="font-medium font-raleway-medium-16pt">
                      Omitir
                    </span>
                  </Button>
                )}
                
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
              </div>
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
        </div>

        {/* Divider with "o" text */}
        <div className="flex items-center my-6 w-[426px]">
          <div className="flex-1 h-px bg-verdeprimario-100"></div>
          <span className="px-4 text-verdeprimario-100 text-sm font-raleway-medium-16pt">o</span>
          <div className="flex-1 h-px bg-verdeprimario-100"></div>
        </div>

        {/* Social Login Buttons */}
        {socialButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin(button.provider)}
            className="flex items-center gap-4 mb-3 rounded-[22px] border border-verdeprimario-100 bg-white hover:bg-verdeprimario-60 hover:text-verdeprimario-100 hover:border-verdeprimario-100 h-10 w-[426px] px-4 justify-start transition-all duration-200"
          >
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
              <img
                className={`${
                  index === 0
                    ? "w-4 h-4 object-cover"
                    : index === 1
                      ? "w-6 h-6"
                      : "w-4 h-4"
                }`}
                alt={button.alt}
                src={button.icon}
              />
            </div>
            <span className="text-verdeprimario-100 font-medium font-raleway-medium-16pt text-left hover:text-verdeprimario-100 transition-colors duration-200">
              {button.text}
            </span>
          </Button>
        ))}

        {/* Contractor Registration Link */}
        <div className="text-center mt-4">
          <p className="text-verdeprimario-100 font-raleway-medium-16pt">
            ¿Sos contratista?{" "}
            <Link href="/register-contractor" className="font-bold text-verdeprimario-100 hover:underline font-raleway-bold-16pt">
              Registrarse como Contratista
            </Link>
          </p>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-verdeprimario-100 font-raleway-medium-16pt">
            ¿Ya tenés una cuenta?{" "}
            <Link href="/login" className="font-bold text-verdeprimario-100 hover:underline font-raleway-bold-16pt">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

