"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageCircle,
  Mail,
  Phone,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'Todas las categorías' },
    { id: 'general', name: 'General' },
    { id: 'account', name: 'Cuenta y Registro' },
    { id: 'services', name: 'Servicios' },
    { id: 'bookings', name: 'Reservas' },
    { id: 'payments', name: 'Pagos' },
    { id: 'technical', name: 'Soporte Técnico' }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: '¿Qué es AgroRedUy?',
      answer: 'AgroRedUy es una plataforma digital que conecta productores agrícolas con contratistas especializados en Uruguay. Facilitamos el encuentro entre la oferta y demanda de servicios agrícolas, permitiendo a los usuarios encontrar y contratar servicios de calidad de manera rápida y confiable.',
      category: 'general'
    },
    {
      id: '2',
      question: '¿Cómo me registro en la plataforma?',
      answer: 'Para registrarte, haz clic en el botón "Registrarse" en la página principal. Puedes elegir entre registrarte como usuario regular o como proveedor de servicios (contratista). Completa el formulario con tus datos personales y verifica tu email para activar tu cuenta.',
      category: 'account'
    },
    {
      id: '3',
      question: '¿Cuál es la diferencia entre usuario y contratista?',
      answer: 'Los usuarios son productores que buscan contratar servicios agrícolas. Los contratistas son proveedores que ofrecen servicios especializados como cosecha, siembra, fumigación, etc. Los contratistas pueden publicar sus servicios y recibir reservas de los usuarios.',
      category: 'account'
    },
    {
      id: '4',
      question: '¿Cómo busco servicios agrícolas?',
      answer: 'Puedes buscar servicios utilizando los filtros en la página de servicios. Filtra por tipo de servicio, ubicación, fecha y precio. También puedes usar la barra de búsqueda para encontrar servicios específicos por palabras clave.',
      category: 'services'
    },
    {
      id: '5',
      question: '¿Cómo publico un servicio como contratista?',
      answer: 'Una vez registrado como contratista, ve a "Mis Servicios" y haz clic en "Crear Servicio". Completa el formulario con la información del servicio, incluyendo descripción, precio, ubicación, disponibilidad e imágenes. Tu servicio será revisado antes de ser publicado.',
      category: 'services'
    },
    {
      id: '6',
      question: '¿Cómo hago una reserva?',
      answer: 'Encuentra el servicio que necesitas, selecciona una fecha y horario disponible, y haz clic en "Reservar". Completa el formulario de reserva con tus datos de contacto y cualquier información adicional. El contratista recibirá una notificación y podrá confirmar tu reserva.',
      category: 'bookings'
    },
    {
      id: '7',
      question: '¿Puedo cancelar una reserva?',
      answer: 'Sí, puedes cancelar una reserva desde la sección "Mis Reservas" en tu perfil. Ten en cuenta que pueden aplicarse políticas de cancelación según el tiempo de anticipación y el tipo de servicio. Las cancelaciones se notifican automáticamente al contratista.',
      category: 'bookings'
    },
    {
      id: '8',
      question: '¿Cómo funciona el sistema de pagos?',
      answer: 'Actualmente, los pagos se coordinan directamente entre el usuario y el contratista. AgroRedUy facilita la conexión, pero no procesamos pagos directamente. Esto permite mayor flexibilidad en los métodos de pago y evita comisiones adicionales.',
      category: 'payments'
    },
    {
      id: '9',
      question: '¿Cómo califico un servicio?',
      answer: 'Después de completar un servicio, recibirás un email invitándote a calificar tu experiencia. Puedes dejar una calificación de 1 a 5 estrellas y un comentario opcional. Las calificaciones ayudan a otros usuarios a tomar decisiones informadas.',
      category: 'bookings'
    },
    {
      id: '10',
      question: '¿Qué hago si tengo un problema con un servicio?',
      answer: 'Si experimentas algún problema, primero intenta contactar directamente al contratista. Si no puedes resolver el problema, puedes reportarlo a través de nuestro sistema de soporte. AgroRedUy puede mediar en disputas y tomar medidas apropiadas.',
      category: 'technical'
    },
    {
      id: '11',
      question: '¿Cómo actualizo mi perfil?',
      answer: 'Ve a tu perfil haciendo clic en tu nombre en la esquina superior derecha, luego selecciona "Mi Perfil". Desde allí puedes editar tu información personal, cambiar tu foto de perfil, actualizar tu ubicación y modificar tus preferencias de notificaciones.',
      category: 'account'
    },
    {
      id: '12',
      question: '¿La plataforma es segura?',
      answer: 'Sí, la seguridad es una prioridad para nosotros. Utilizamos encriptación SSL para proteger tus datos, implementamos medidas de seguridad robustas y nunca compartimos tu información personal con terceros sin tu consentimiento. Todos los usuarios son verificados antes de poder usar la plataforma.',
      category: 'technical'
    },
    {
      id: '13',
      question: '¿Puedo usar la plataforma desde mi móvil?',
      answer: 'Sí, AgroRedUy es completamente responsive y funciona perfectamente en dispositivos móviles. Puedes acceder a todas las funcionalidades desde tu smartphone o tablet, incluyendo búsqueda de servicios, reservas y gestión de tu perfil.',
      category: 'technical'
    },
    {
      id: '14',
      question: '¿Hay algún costo por usar la plataforma?',
      answer: 'El registro y uso básico de la plataforma es gratuito. Los contratistas pueden publicar sus servicios sin costo inicial. En el futuro, podríamos implementar planes premium con funcionalidades adicionales, pero siempre mantendremos una opción gratuita.',
      category: 'general'
    },
    {
      id: '15',
      question: '¿Cómo contacto al soporte técnico?',
      answer: 'Puedes contactar nuestro soporte técnico a través del formulario de contacto en la página "Contacto", enviando un email a soporte@agrored.uy, o llamando al +598 99 123 456. Nuestro equipo está disponible de lunes a viernes de 9:00 a 18:00.',
      category: 'technical'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre AgroRedUy
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar preguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verdeprimario-100"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron preguntas
                </h3>
                <p className="text-gray-600 mb-4">
                  Intenta ajustar los filtros de búsqueda o contacta nuestro soporte.
                </p>
                <Link href="/contacto">
                  <Button>Contactar Soporte</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(faq.category)}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                    {openItems.has(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.has(faq.id) && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-verdeprimario-100 to-verdesecundario-100 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Nuestro equipo de soporte está aquí para ayudarte
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Chat en Vivo</div>
                  <div className="text-sm opacity-90">Disponible 24/7</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <Mail className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-sm opacity-90">soporte@agrored.uy</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <Phone className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Teléfono</div>
                  <div className="text-sm opacity-90">+598 99 123 456</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contacto">
                <Button variant="secondary" size="lg" className="bg-white text-verdeprimario-100 hover:bg-gray-100">
                  Contactar Soporte
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-verdeprimario-100">
                <Clock className="w-4 h-4 mr-2" />
                Horarios de Atención
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

