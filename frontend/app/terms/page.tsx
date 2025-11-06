"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "15 de Diciembre de 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-verdeprimario-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Condiciones de uso de la plataforma AgroRedUy
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Última actualización: {lastUpdated}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aceptación de los Términos</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar AgroRedUy, aceptas cumplir con estos Términos y
              Condiciones. Si no estás de acuerdo con alguna parte de estos términos,
              no debes utilizar nuestros servicios.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Uso de la Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Debes tener al menos 18 años para usar la plataforma</li>
              <li>Eres responsable de mantener la seguridad de tu cuenta</li>
              <li>No puedes usar la plataforma para actividades ilegales</li>
              <li>Debes proporcionar información precisa y actualizada</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/contacto">
            <Button size="lg" className="mr-4">
              Contactar Soporte
            </Button>
          </Link>
          <Link href="/privacy">
            <Button variant="outline" size="lg">
              Ver Política de Privacidad
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

