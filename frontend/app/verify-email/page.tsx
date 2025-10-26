"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";

export default function VerifyEmailPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError("Por favor ingresa el código de verificación");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.verifyEmail(verificationCode);
      
      if (response.success) {
        setMessage("¡Email verificado exitosamente!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(response.error?.message || "Código de verificación inválido");
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.resendVerificationEmail(email);
      
      if (response.success) {
        setMessage("Código de verificación reenviado. Revisa tu email.");
      } else {
        setError(response.error?.message || "Error al reenviar el código");
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.");
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
          alt="Email verification"
          src="/figmaAssets/atomo-foto-4.png"
        />
      </div>

      {/* Right Section - Verification Form */}
      <div className="flex-1 bg-white rounded-l-[100px] p-8 flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold text-verdeprimario-100 mb-8 text-center font-barlow-bold-64pt">
          Verificar Email
        </h1>

        <div className="w-full max-w-md space-y-6">
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-verdeprimario-100 font-raleway-medium-16pt mb-2">
              Hemos enviado un código de verificación a:
            </p>
            <p className="text-verdeprimario-100 font-bold font-raleway-bold-16pt">
              {email}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Por favor ingresa el código de 6 dígitos que recibiste por email.
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-6">
            <div>
              <Label htmlFor="verificationCode" className="text-verdeprimario-100 font-medium mb-2 block">
                Código de Verificación *
              </Label>
              <div className="flex items-center gap-4 bg-verdeprimario-60 rounded-[22px] h-10 px-4 border border-verdeprimario-100 focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200">
                <div className="flex items-center justify-center w-6 h-6">
                  <img
                    className="w-4 h-4"
                    alt="Code icon"
                    src="/figmaAssets/subtract.svg"
                  />
                </div>
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-verdeprimario-100 placeholder:text-verdeprimario-100 focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-verdeprimario-100 hover:bg-verdeprimario-60 text-white font-medium py-3 rounded-[22px] h-12 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verificando..." : "Verificar Email"}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-verdeprimario-100 font-raleway-medium-16pt">
              ¿No recibiste el código?
            </p>
            <Button
              onClick={handleResendCode}
              disabled={isLoading}
              className="flex items-center gap-4 rounded-[22px] border border-verdeprimario-100 bg-white hover:bg-verdeprimario-60 hover:text-verdeprimario-100 hover:border-verdeprimario-100 h-10 w-full px-4 justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-verdeprimario-100 font-medium font-raleway-medium-16pt hover:text-verdeprimario-100 transition-colors duration-200">
                Reenviar Código
              </span>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-verdeprimario-100 font-raleway-medium-16pt">
              ¿Ya verificaste tu email?{" "}
              <Link href="/login" className="font-bold text-verdeprimario-100 hover:underline font-raleway-bold-16pt">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
