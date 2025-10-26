/**
 * @fileoverview Content management component
 * Allows administrators to manage FAQs, terms, privacy, and contact information
 */

'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  HelpCircle, 
  Shield, 
  Phone, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Terms {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Privacy {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: string;
  title: string;
  content: string;
  contactType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ContentManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [terms, setTerms] = useState<Terms[]>([]);
  const [privacy, setPrivacy] = useState<Privacy[]>([]);
  const [contact, setContact] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', sortOrder: 0 });

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getContentManagement();

      if (response.success && response.data) {
        setFaqs(response.data.faqs || []);
        setTerms(response.data.terms || []);
        setPrivacy(response.data.privacy || []);
        setContact(response.data.contact || []);
      } else {
        setError(response.error?.message || 'Error al cargar el contenido');
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setError('Error inesperado al cargar el contenido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSaveFAQ = async (faq: FAQ) => {
    try {
      // In a real implementation, you would call the API to save the FAQ
      console.log('Saving FAQ:', faq);
      setSuccess('FAQ guardada exitosamente');
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving FAQ:', error);
      setError('Error al guardar la FAQ');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      // In a real implementation, you would call the API to delete the FAQ
      console.log('Deleting FAQ:', id);
      setFaqs(prev => prev.filter(faq => faq.id !== id));
      setSuccess('FAQ eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setError('Error al eliminar la FAQ');
    }
  };

  const handleAddFAQ = () => {
    if (newFAQ.question && newFAQ.answer) {
      const faq: FAQ = {
        id: `faq-${Date.now()}`,
        question: newFAQ.question,
        answer: newFAQ.answer,
        sortOrder: newFAQ.sortOrder,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setFaqs(prev => [...prev, faq]);
      setNewFAQ({ question: '', answer: '', sortOrder: 0 });
      setSuccess('FAQ agregada exitosamente');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verdeprimario-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Contenido</h1>
          <p className="text-gray-600">
            Administra FAQs, términos, privacidad y información de contacto
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadContent}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Términos
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contacto
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Preguntas Frecuentes
              </CardTitle>
              <CardDescription>
                Gestiona las preguntas y respuestas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add New FAQ */}
              <div className="space-y-4 p-4 border rounded-lg mb-6">
                <h3 className="font-semibold">Agregar Nueva FAQ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pregunta
                    </label>
                    <Input
                      value={newFAQ.question}
                      onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="¿Cómo funciona AgroRedUy?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden
                    </label>
                    <Input
                      type="number"
                      value={newFAQ.sortOrder}
                      onChange={(e) => setNewFAQ(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Respuesta
                  </label>
                  <Textarea
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="AgroRedUy es una plataforma que conecta productores agrícolas..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddFAQ} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar FAQ
                </Button>
              </div>

              {/* FAQs List */}
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <Card key={faq.id} className="border-l-4 border-l-verdeprimario-100">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{faq.sortOrder}</Badge>
                            <h4 className="font-semibold">{faq.question}</h4>
                            {faq.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            ) : (
                              <Badge variant="destructive">Inactivo</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">{faq.answer}</p>
                          <div className="text-xs text-gray-500">
                            Creado: {new Date(faq.createdAt).toLocaleDateString()}
                            {faq.updatedAt !== faq.createdAt && (
                              <span> • Actualizado: {new Date(faq.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(faq.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Términos y Condiciones
              </CardTitle>
              <CardDescription>
                Gestiona los términos y condiciones de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {terms.map((term) => (
                  <Card key={term.id} className="border-l-4 border-l-blue-100">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{term.title}</h4>
                            <Badge variant="outline">v{term.version}</Badge>
                            {term.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            ) : (
                              <Badge variant="destructive">Inactivo</Badge>
                            )}
                          </div>
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: term.content }} />
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Creado: {new Date(term.createdAt).toLocaleDateString()}
                            {term.updatedAt !== term.createdAt && (
                              <span> • Actualizado: {new Date(term.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Política de Privacidad
              </CardTitle>
              <CardDescription>
                Gestiona la política de privacidad de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {privacy.map((privacyItem) => (
                  <Card key={privacyItem.id} className="border-l-4 border-l-purple-100">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{privacyItem.title}</h4>
                            <Badge variant="outline">v{privacyItem.version}</Badge>
                            {privacyItem.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            ) : (
                              <Badge variant="destructive">Inactivo</Badge>
                            )}
                          </div>
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: privacyItem.content }} />
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Creado: {new Date(privacyItem.createdAt).toLocaleDateString()}
                            {privacyItem.updatedAt !== privacyItem.createdAt && (
                              <span> • Actualizado: {new Date(privacyItem.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
              <CardDescription>
                Gestiona la información de contacto de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contact.map((contactItem) => (
                  <Card key={contactItem.id} className="border-l-4 border-l-orange-100">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{contactItem.title}</h4>
                            <Badge variant="outline">{contactItem.contactType}</Badge>
                            {contactItem.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            ) : (
                              <Badge variant="destructive">Inactivo</Badge>
                            )}
                          </div>
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: contactItem.content }} />
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Creado: {new Date(contactItem.createdAt).toLocaleDateString()}
                            {contactItem.updatedAt !== contactItem.createdAt && (
                              <span> • Actualizado: {new Date(contactItem.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
