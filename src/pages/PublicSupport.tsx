import React, { useState } from 'react';
import { Send, Phone, Mail, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

export default function PublicSupport() {
  const { createSupportTicket } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    subject: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ticketId = await createSupportTicket({
        ...formData,
        priority: formData.priority as any,
        category: formData.category as any
      });

      toast({
        title: "Ticket creado exitosamente",
        description: `Tu ticket #${ticketId} ha sido creado. Te contactaremos pronto.`,
      });

      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCompany: '',
        subject: '',
        description: '',
        category: '',
        priority: 'medium'
      });
    } catch (error) {
      toast({
        title: "Error al crear el ticket",
        description: "Hubo un problema al crear tu ticket. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Bethel SAS</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-1" />
                <span>+57 300 123 4567</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-1" />
                <span>soporte@bethel.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Centro de Soporte Técnico</h2>
            <p className="text-xl text-blue-100">
              Estamos aquí para ayudarte con todos tus requerimientos técnicos
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario de ticket */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Crear Ticket de Soporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Nombre completo *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => handleChange('clientName', e.target.value)}
                        required
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => handleChange('clientEmail', e.target.value)}
                        required
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientPhone">Teléfono</Label>
                      <Input
                        id="clientPhone"
                        value={formData.clientPhone}
                        onChange={(e) => handleChange('clientPhone', e.target.value)}
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientCompany">Empresa</Label>
                      <Input
                        id="clientCompany"
                        value={formData.clientCompany}
                        onChange={(e) => handleChange('clientCompany', e.target.value)}
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Asunto *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      required
                      placeholder="Resumen del problema o solicitud"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hardware">Hardware</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="network">Red</SelectItem>
                          <SelectItem value="installation">Instalación</SelectItem>
                          <SelectItem value="maintenance">Mantenimiento</SelectItem>
                          <SelectItem value="configuration">Configuración</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridad *</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción detallada *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                      rows={5}
                      placeholder="Describe tu problema o solicitud en detalle..."
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Información de contacto y servicios */}
          <div className="space-y-6">
            {/* Información de contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-sm text-gray-600">+57 300 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">soporte@bethel.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-sm text-gray-600">Carrera 15 #123-45, Bogotá</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Horario</p>
                    <p className="text-sm text-gray-600">Lun - Vie: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Servicios */}
            <Card>
              <CardHeader>
                <CardTitle>Nuestros Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">Mantenimiento Preventivo</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">Instalación de Equipos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">Soporte Técnico 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">Diagnóstico Especializado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">Configuración de Redes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tiempo de respuesta */}
            <Card>
              <CardHeader>
                <CardTitle>Tiempo de Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-sm">Urgente</span>
                    </div>
                    <span className="text-sm font-medium">1-2 horas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                      <span className="text-sm">Alta</span>
                    </div>
                    <span className="text-sm font-medium">4-6 horas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                      <span className="text-sm">Media</span>
                    </div>
                    <span className="text-sm font-medium">1-2 días</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm">Baja</span>
                    </div>
                    <span className="text-sm font-medium">3-5 días</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}