import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import SignaturePad from '@/components/signature/SignaturePad';
import { Signature, Plus, FileText, Camera, Download } from 'lucide-react';
import { FilledForm, WorkOrder, PdfTemplate } from '@/types';
import { formatDateTime } from '@/lib/utils';

const FormsPage: React.FC = () => {
  const { user } = useAuth();
  const { workOrders, templates, filledForms, createFilledForm, getFormsByWorkOrder } = useData();
  const { toast } = useToast();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PdfTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);

  if (!user) return null;

  const userWorkOrders = workOrders.filter(order => 
    user.role === 'admin' || 
    order.assignedTechnicians.includes(user.id) ||
    order.supervisorId === user.id ||
    order.createdBy === user.id
  );

  const openFormDialog = (workOrder: WorkOrder, template: PdfTemplate) => {
    setSelectedWorkOrder(workOrder);
    setSelectedTemplate(template);
    setFormData({});
    setSignatures({});
    setPhotos([]);
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (!selectedWorkOrder || !selectedTemplate) return;

    const newForm: Omit<FilledForm, 'id' | 'filledAt'> = {
      workOrderId: selectedWorkOrder.id,
      templateId: selectedTemplate.id,
      filledBy: user.id,
      data: formData,
      signatures,
      photos: photos.map(photo => URL.createObjectURL(photo)),
      status: 'completed'
    };

    createFilledForm(newForm);
    setIsFormOpen(false);
    toast({
      title: "Formulario enviado",
      description: "El formulario se ha completado exitosamente"
    });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handleSignature = (signatureType: string, signature: string) => {
    setSignatures({
      ...signatures,
      [signatureType]: signature
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos([...photos, ...files]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Formularios</h1>
          <p className="text-muted-foreground">
            Completa formularios de órdenes de trabajo
          </p>
        </div>
      </div>

      {/* Órdenes de Trabajo Activas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Órdenes de Trabajo Pendientes</h2>
        {userWorkOrders
          .filter(order => ['assigned', 'in_progress'].includes(order.status))
          .map((workOrder) => (
            <Card key={workOrder.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{workOrder.number}</CardTitle>
                    <p className="text-muted-foreground">{workOrder.clientName}</p>
                  </div>
                  <Badge className={
                    workOrder.status === 'in_progress' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {workOrder.status === 'in_progress' ? 'En Progreso' : 'Asignada'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{workOrder.description}</p>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Formularios Asignados:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {workOrder.assignedFormats.map((formatSlug) => {
                        const template = templates.find(t => t.slug === formatSlug);
                        if (!template) return null;

                        const existingForm = filledForms.find(f => 
                          f.workOrderId === workOrder.id && f.templateId === template.id
                        );

                        return (
                          <Card key={template.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">{template.name}</span>
                              </div>
                              {existingForm ? (
                                <Badge variant="secondary" className="text-xs">
                                  Completado
                                </Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => openFormDialog(workOrder, template)}
                                  disabled={user.role === 'tecnician' && !workOrder.assignedTechnicians.includes(user.id)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Llenar
                                </Button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Formularios Completados */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Formularios Completados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filledForms
            .filter(form => 
              user.role === 'admin' || 
              form.filledBy === user.id ||
              userWorkOrders.some(wo => wo.id === form.workOrderId)
            )
            .map((form) => {
              const workOrder = workOrders.find(wo => wo.id === form.workOrderId);
              const template = templates.find(t => t.id === form.templateId);
              
              return (
                <Card key={form.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Signature className="w-5 h-5" />
                        <CardTitle className="text-lg">{template?.name}</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Completado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>OT:</strong> {workOrder?.number}</p>
                      <p className="text-sm"><strong>Cliente:</strong> {workOrder?.clientName}</p>
                      <p className="text-sm"><strong>Completado:</strong> {formatDateTime(form.filledAt)}</p>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Dialog para llenar formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.name} - {selectedWorkOrder?.number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              {/* Campos del formulario */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información del Formulario</h3>
                {selectedTemplate.fields.map((field, index) => (
                  <div key={index}>
                    <Label htmlFor={field}>{field}</Label>
                    <Input
                      id={field}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      placeholder={`Ingrese ${field.toLowerCase()}`}
                    />
                  </div>
                ))}
                
                <div>
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations || ''}
                    onChange={(e) => handleFieldChange('observations', e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              {/* Firmas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Firmas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Firma del Técnico</Label>
                    <SignaturePad
                      onSignatureChange={(signature) => handleSignature('technician', signature)}
                    />
                  </div>
                  
                  <div>
                    <Label>Firma del Cliente</Label>
                    <SignaturePad
                      onSignatureChange={(signature) => handleSignature('client', signature)}
                    />
                  </div>
                </div>
              </div>

              {/* Evidencias fotográficas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Evidencias Fotográficas</h3>
                
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                  />
                  <Button variant="outline" size="icon">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Evidencia ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleFormSubmit}>
                  Enviar Formulario
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {userWorkOrders.filter(order => ['assigned', 'in_progress'].includes(order.status)).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay formularios pendientes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormsPage;