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
import { FileText, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { PdfTemplate } from '@/types';

const TemplatesPage: React.FC = () => {
  const { user, hasRoles } = useAuth();
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useData();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PdfTemplate | null>(null);

  if (!hasRoles(['admin', 'supervisor'])) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página</p>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    fields: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      fields: []
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "Error",
        description: "Nombre y código son requeridos",
        variant: "destructive"
      });
      return;
    }

    createTemplate({
      name: formData.name,
      description: formData.description,
      slug: formData.slug,
      fields: formData.fields,
      createdBy: user!.id,
      filePath: `/templates/${formData.slug}.pdf`
    });

    setIsCreateOpen(false);
    resetForm();
    toast({
      title: "Plantilla creada",
      description: "La plantilla se ha creado exitosamente"
    });
  };

  const handleEdit = (template: PdfTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      slug: template.slug,
      fields: template.fields
    });
  };

  const handleUpdate = () => {
    if (!editingTemplate) return;

    updateTemplate(editingTemplate.id, {
      name: formData.name,
      description: formData.description,
      slug: formData.slug,
      fields: formData.fields
    });

    setEditingTemplate(null);
    resetForm();
    toast({
      title: "Plantilla actualizada",
      description: "Los datos de la plantilla se han actualizado"
    });
  };

  const handleDelete = (template: PdfTemplate) => {
    if (confirm(`¿Estás seguro de eliminar la plantilla "${template.name}"?`)) {
      deleteTemplate(template.id);
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se ha eliminado exitosamente"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      toast({
        title: "Archivo subido",
        description: `PDF "${file.name}" cargado exitosamente`
      });
    } else {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF",
        variant: "destructive"
      });
    }
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, '']
    });
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...formData.fields];
    newFields[index] = value;
    setFormData({
      ...formData,
      fields: newFields
    });
  };

  const removeField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Plantillas PDF</h1>
          <p className="text-muted-foreground">
            Gestiona plantillas de formularios para órdenes de trabajo
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Plantilla</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Plantilla</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Formato de Mantenimiento"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Código de Identificación</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  placeholder="mantenimiento-preventivo"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Formulario para registro de mantenimiento preventivo de equipos"
                />
              </div>

              <div>
                <Label>Archivo PDF</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label>Campos del Formulario</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addField}>
                    Agregar Campo
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {formData.fields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={field}
                        onChange={(e) => updateField(index, e.target.value)}
                        placeholder="Nombre del campo"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Crear Plantilla</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge variant="secondary">{template.slug}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{template.description}</p>
                
                {template.fields.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Campos:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.fields.slice(0, 3).map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {template.fields.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.fields.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                
                <Dialog open={editingTemplate?.id === template.id} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Editar Plantilla</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Nombre de la Plantilla</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-slug">Código de Identificación</Label>
                        <Input
                          id="edit-slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Textarea
                          id="edit-description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <Label>Campos del Formulario</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addField}>
                            Agregar Campo
                          </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                          {formData.fields.map((field, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={field}
                                onChange={(e) => updateField(index, e.target.value)}
                                placeholder="Nombre del campo"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeField(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdate}>Guardar Cambios</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {user?.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(template)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay plantillas creadas</p>
            <p className="text-sm text-muted-foreground">Crea tu primera plantilla para comenzar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplatesPage;