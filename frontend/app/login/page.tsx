"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

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

export default function LoginPage(): JSX.Element {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error?.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      // Check if OAuth is available
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/v1/oauth/status`);
      const data = await response.json();
      
      if (!data.providers[provider]) {
        setError(`OAuth with ${provider} is not available in development mode. Please use email/password login.`);
        return;
      }
      
      // Store current page for redirect after OAuth
      localStorage.setItem('redirectAfterAuth', window.location.pathname);
      
      // Redirect to OAuth provider
      window.location.href = `${backendUrl}/api/v1/oauth/${provider}`;
    } catch (error) {
      setError('Unable to check OAuth availability. Please try again.');
    }
  };

  return (
    <div className="bg-blanco-100 w-full h-screen flex overflow-hidden">
      {/* Left Section - Login Form */}
      <div className="flex-1 bg-white rounded-r-[100px] p-8 flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold text-verdeprimario-100 mb-8 text-center font-barlow-bold-64pt">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-[426px]">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex items-center gap-4 mb-4 bg-verdeprimario-60 rounded-[22px] h-10 w-[426px] px-4 border border-verdeprimario-100 focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200">
            <div className="flex items-center justify-center w-6 h-6">
              <img
                className="w-4 h-4 filter brightness-0 invert"
                alt="Email icon"
                src="/figmaAssets/subtract.svg"
              />
            </div>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="E-mail"
              required
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center gap-4 mb-6 bg-verdeprimario-60 rounded-[22px] h-10 w-[426px] px-4 border border-verdeprimario-100 focus-within:bg-verdeprimario-100 focus-within:border-verdeprimario-200 transition-all duration-200">
            <div className="flex items-center justify-center w-6 h-6">
              <img
                className="w-4 h-4 filter brightness-0 invert"
                alt="Password icon"
                src="/figmaAssets/union.svg"
              />
            </div>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Contraseña"
              required
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 font-raleway-medium-16pt h-auto focus:text-white placeholder:focus:text-white"
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-[426px] h-12 bg-verdeprimario-100 text-white font-raleway-bold-20pt rounded-[22px] hover:bg-verdeprimario-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        {/* Separator */}
        <div className="w-full max-w-[426px] my-6">
          <Separator className="bg-gray-300" />
          <div className="text-center -mt-3">
            <span className="bg-white px-4 text-gray-500 text-sm">o</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="w-full max-w-[426px] space-y-3">
          {socialButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              onClick={() => handleOAuthLogin(button.provider)}
              className="w-full h-12 border border-gray-300 rounded-[22px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <img
                className="w-5 h-5"
                alt={button.alt}
                src={button.icon}
              />
              <span className="font-raleway-medium-16pt text-gray-700">
                {button.text}
              </span>
            </Button>
          ))}
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 font-raleway-medium-16pt">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-verdeprimario-100 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="flex-1 bg-gradient-to-br from-verdeprimario-100 to-verdesecundario-100 flex items-center justify-center">
        <img
          className="w-full h-full object-cover"
          alt="Login illustration"
          src="/figmaAssets/atomo-foto-1.png"
        />
      </div>
    </div>
  );
}

