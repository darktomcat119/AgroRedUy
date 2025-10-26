"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Users, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = '15 de Diciembre de 2024';

  const dataTypes = [
    {
      icon: Users,
      title: 'Información Personal',
      description: 'Nombre, apellido, email, teléfono, fecha de nacimiento, género y dirección.',
      examples: ['Juan Pérez', 'juan@email.com', '+598 99 123 456']
    },
    {
      icon: MapPin,
      title: 'Información de Ubicación',
      description: 'Ciudad, departamento, dirección y coordenadas geográficas.',
      examples: ['Montevideo', 'Canelones', 'Ruta 1, Km 25']
    },
    {
      icon: Calendar,
      title: 'Información de Servicios',
      description: 'Servicios publicados, reservas realizadas, calificaciones y comentarios.',
      examples: ['Cosecha de Soja', 'Reserva #12345', 'Calificación: 5 estrellas']
    },
    {
      icon: Settings,
      title: 'Preferencias',
      description: 'Configuraciones de cuenta, notificaciones y preferencias de privacidad.',
      examples: ['Notificaciones por email', 'Perfil público', 'Idioma: Español']
    }
  ];

  const purposes = [
    {
      icon: CheckCircle,
      title: 'Prestación del Servicio',
      description: 'Procesamos tus datos para conectar productores con contratistas y facilitar la contratación de servicios agrícolas.'
    },
    {
      icon: Users,
      title: 'Comunicación',
      description: 'Utilizamos tu información de contacto para enviarte notificaciones sobre reservas, actualizaciones del servicio y comunicaciones importantes.'
    },
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Protegemos la plataforma y verificamos la identidad de los usuarios para mantener un entorno seguro y confiable.'
    },
    {
      icon: Settings,
      title: 'Mejora del Servicio',
      description: 'Analizamos el uso de la plataforma para mejorar nuestras funcionalidades y desarrollar nuevas características.'
    }
  ];

  const rights = [
    {
      title: 'Acceso',
      description: 'Puedes solicitar una copia de todos los datos personales que tenemos sobre ti.'
    },
    {
      title: 'Rectificación',
      description: 'Tienes derecho a corregir cualquier información inexacta o incompleta.'
    },
    {
      title: 'Eliminación',
      description: 'Puedes solicitar la eliminación de tus datos personales en ciertas circunstancias.'
    },
    {
      title: 'Portabilidad',
      description: 'Puedes solicitar que tus datos sean transferidos a otro proveedor de servicios.'
    },
    {
      title: 'Oposición',
      description: 'Puedes oponerte al procesamiento de tus datos para ciertos fines.'
    },
    {
      title: 'Limitación',
      description: 'Puedes solicitar que limitemos el procesamiento de tus datos en ciertas circunstancias.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-verdeprimario-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            En AgroRedUy, respetamos tu privacidad y nos comprometemos a proteger tus datos personales
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Introducción
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Esta Política de Privacidad describe cómo AgroRedUy ("nosotros", "nuestro" o "la empresa") 
              recopila, usa, almacena y protege tu información personal cuando utilizas nuestra plataforma 
              de servicios agrícolas.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política. 
              Si no estás de acuerdo con alguna parte de esta política, por favor no uses nuestros servicios.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Importante</h4>
                  <p className="text-blue-700 text-sm">
                    Esta política puede actualizarse periódicamente. Te notificaremos sobre cambios 
                    significativos a través de email o mediante un aviso en nuestra plataforma.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Información que Recopilamos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              Recopilamos diferentes tipos de información para proporcionarte nuestros servicios:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 text-verdeprimario-100" />
                      <h3 className="font-semibold text-gray-900">{type.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Ejemplos:</strong> {type.examples.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Cómo Utilizamos tu Información
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              Utilizamos tu información personal para los siguientes propósitos:
            </p>
            
            <div className="space-y-4">
              {purposes.map((purpose, index) => {
                const Icon = purpose.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Icon className="w-6 h-6 text-verdeprimario-100 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{purpose.title}</h3>
                      <p className="text-gray-600 text-sm">{purpose.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Compartir Información
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Con tu consentimiento:</strong> Cuando autorices explícitamente el compartir de información.</li>
              <li><strong>Para prestar servicios:</strong> Con contratistas cuando hagas una reserva, para facilitar la comunicación.</li>
              <li><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar la plataforma (hosting, email, etc.).</li>
              <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos.</li>
              <li><strong>Emergencias:</strong> Para proteger la seguridad de nuestros usuarios o del público.</li>
            </ul>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Compromiso de Privacidad</h4>
                  <p className="text-green-700 text-sm">
                    Todos nuestros proveedores de servicios están obligados contractualmente a mantener 
                    la confidencialidad de tu información y solo pueden usarla para los fines específicos 
                    para los que la proporcionamos.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Seguridad de los Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Medidas Técnicas</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Encriptación SSL/TLS para transmisión de datos</li>
                  <li>Encriptación de datos sensibles en reposo</li>
                  <li>Autenticación de dos factores</li>
                  <li>Monitoreo continuo de seguridad</li>
                  <li>Copias de seguridad regulares</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Medidas Administrativas</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Acceso restringido a datos personales</li>
                  <li>Capacitación del personal en privacidad</li>
                  <li>Políticas de retención de datos</li>
                  <li>Auditorías regulares de seguridad</li>
                  <li>Procedimientos de respuesta a incidentes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Tus Derechos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              Tienes varios derechos respecto a tu información personal:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rights.map((right, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
                  <p className="text-gray-600 text-sm">{right.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-verdeprimario-100/10 border border-verdeprimario-200 rounded-lg">
              <p className="text-gray-700 text-sm">
                <strong>Para ejercer tus derechos:</strong> Contacta nuestro equipo de privacidad en 
                <a href="mailto:privacy@agrored.uy" className="text-verdeprimario-100 hover:underline ml-1">
                  privacy@agrored.uy
                </a>
                . Responderemos a tu solicitud dentro de 30 días.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Cookies y Tecnologías Similares
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Esenciales</h4>
                <p className="text-gray-600 text-sm">Necesarias para el funcionamiento básico de la plataforma</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Funcionales</h4>
                <p className="text-gray-600 text-sm">Mejoran la funcionalidad y personalización</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Analíticas</h4>
                <p className="text-gray-600 text-sm">Nos ayudan a entender cómo usas la plataforma</p>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed text-sm">
              Puedes gestionar tus preferencias de cookies en la configuración de tu navegador o 
              contactándonos directamente.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu información, 
              no dudes en contactarnos:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Información de Contacto</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>privacy@agrored.uy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+598 99 123 456</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Montevideo, Uruguay</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Horarios de Atención</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Lunes a Viernes: 9:00 - 18:00</p>
                  <p>Sábados: 9:00 - 13:00</p>
                  <p>Domingos: Cerrado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/contacto">
            <Button size="lg" className="mr-4">
              Contactar Soporte
            </Button>
          </Link>
          <Link href="/terms">
            <Button variant="outline" size="lg">
              Ver Términos y Condiciones
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
