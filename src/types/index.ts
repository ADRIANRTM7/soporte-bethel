export type UserRole = 'admin' | 'supervisor' | 'tecnician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface WorkOrder {
  id: string;
  number: string;
  clientName: string;
  clientContact: string;
  clientAddress: string;
  description: string;
  serviceType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTechnicians: string[];
  assignedFormats: string[];
  createdBy: string;
  supervisorId?: string;
  scheduledDate: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  evidences: Evidence[];
  notes?: string;
}

export interface Evidence {
  id: string;
  type: 'photo' | 'document' | 'signature';
  url: string;
  description: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: FormField[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'checkbox' | 'signature' | 'photo';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FilledForm {
  id: string;
  workOrderId: string;
  templateId: string;
  filledBy: string;
  filledAt: Date;
  data: Record<string, any>;
  signatures: {
    technician?: string;
    client?: string;
    supervisor?: string;
  };
  status: 'draft' | 'completed' | 'approved' | 'rejected';
  pdfUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  workOrderId?: string;
}

// Predefined form templates
export const DEFAULT_TEMPLATES: Omit<PdfTemplate, 'id' | 'createdBy' | 'createdAt'>[] = [
  {
    name: 'Orden de Trabajo',
    description: 'Formato principal de orden de trabajo',
    category: 'general',
    isActive: true,
    fields: [
      { id: 'ot_number', name: 'ot_number', label: 'Número de OT', type: 'text', required: true },
      { id: 'client_name', name: 'client_name', label: 'Nombre del Cliente', type: 'text', required: true },
      { id: 'client_contact', name: 'client_contact', label: 'Contacto', type: 'text', required: true },
      { id: 'service_date', name: 'service_date', label: 'Fecha de Servicio', type: 'date', required: true },
      { id: 'service_description', name: 'service_description', label: 'Descripción del Servicio', type: 'textarea', required: true },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true },
      { id: 'client_signature', name: 'client_signature', label: 'Firma Cliente', type: 'signature', required: true }
    ]
  },
  {
    name: 'Visita Técnica / Diagnóstico',
    description: 'Formato para diagnósticos técnicos',
    category: 'diagnostic',
    isActive: true,
    fields: [
      { id: 'equipment_type', name: 'equipment_type', label: 'Tipo de Equipo', type: 'text', required: true },
      { id: 'equipment_brand', name: 'equipment_brand', label: 'Marca', type: 'text', required: true },
      { id: 'equipment_model', name: 'equipment_model', label: 'Modelo', type: 'text', required: true },
      { id: 'serial_number', name: 'serial_number', label: 'Número de Serie', type: 'text', required: true },
      { id: 'problem_description', name: 'problem_description', label: 'Descripción del Problema', type: 'textarea', required: true },
      { id: 'diagnostic_result', name: 'diagnostic_result', label: 'Resultado del Diagnóstico', type: 'textarea', required: true },
      { id: 'recommendations', name: 'recommendations', label: 'Recomendaciones', type: 'textarea', required: false },
      { id: 'evidence_photos', name: 'evidence_photos', label: 'Fotos de Evidencia', type: 'photo', required: false },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true }
    ]
  },
  {
    name: 'Instalación & Puesta en Marcha',
    description: 'Formato para instalaciones y puesta en marcha',
    category: 'installation',
    isActive: true,
    fields: [
      { id: 'equipment_installed', name: 'equipment_installed', label: 'Equipo Instalado', type: 'text', required: true },
      { id: 'installation_location', name: 'installation_location', label: 'Ubicación de Instalación', type: 'text', required: true },
      { id: 'installation_date', name: 'installation_date', label: 'Fecha de Instalación', type: 'date', required: true },
      { id: 'configuration_details', name: 'configuration_details', label: 'Detalles de Configuración', type: 'textarea', required: true },
      { id: 'tests_performed', name: 'tests_performed', label: 'Pruebas Realizadas', type: 'textarea', required: true },
      { id: 'test_results', name: 'test_results', label: 'Resultados de Pruebas', type: 'select', required: true, options: ['Satisfactorio', 'Con observaciones', 'Fallido'] },
      { id: 'client_training', name: 'client_training', label: 'Capacitación al Cliente', type: 'checkbox', required: false },
      { id: 'installation_photos', name: 'installation_photos', label: 'Fotos de Instalación', type: 'photo', required: false },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true },
      { id: 'client_signature', name: 'client_signature', label: 'Firma Cliente', type: 'signature', required: true }
    ]
  },
  {
    name: 'Mantenimiento P/C Multiequipo',
    description: 'Formato para mantenimiento preventivo/correctivo de múltiples equipos',
    category: 'maintenance',
    isActive: true,
    fields: [
      { id: 'maintenance_type', name: 'maintenance_type', label: 'Tipo de Mantenimiento', type: 'select', required: true, options: ['Preventivo', 'Correctivo', 'Predictivo'] },
      { id: 'equipment_list', name: 'equipment_list', label: 'Lista de Equipos', type: 'textarea', required: true },
      { id: 'activities_performed', name: 'activities_performed', label: 'Actividades Realizadas', type: 'textarea', required: true },
      { id: 'parts_replaced', name: 'parts_replaced', label: 'Partes Reemplazadas', type: 'textarea', required: false },
      { id: 'consumables_used', name: 'consumables_used', label: 'Consumibles Utilizados', type: 'textarea', required: false },
      { id: 'next_maintenance', name: 'next_maintenance', label: 'Próximo Mantenimiento', type: 'date', required: false },
      { id: 'observations', name: 'observations', label: 'Observaciones', type: 'textarea', required: false },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true },
      { id: 'supervisor_signature', name: 'supervisor_signature', label: 'Firma Supervisor', type: 'signature', required: false }
    ]
  },
  {
    name: 'Servicio Técnico & Soporte',
    description: 'Formato para servicios técnicos y soporte',
    category: 'support',
    isActive: true,
    fields: [
      { id: 'ticket_number', name: 'ticket_number', label: 'Número de Ticket', type: 'text', required: true },
      { id: 'issue_category', name: 'issue_category', label: 'Categoría del Problema', type: 'select', required: true, options: ['Hardware', 'Software', 'Red', 'Configuración', 'Otro'] },
      { id: 'issue_priority', name: 'issue_priority', label: 'Prioridad', type: 'select', required: true, options: ['Baja', 'Media', 'Alta', 'Crítica'] },
      { id: 'issue_description', name: 'issue_description', label: 'Descripción del Problema', type: 'textarea', required: true },
      { id: 'solution_applied', name: 'solution_applied', label: 'Solución Aplicada', type: 'textarea', required: true },
      { id: 'time_spent', name: 'time_spent', label: 'Tiempo Empleado (horas)', type: 'number', required: true },
      { id: 'remote_support', name: 'remote_support', label: 'Soporte Remoto', type: 'checkbox', required: false },
      { id: 'issue_resolved', name: 'issue_resolved', label: 'Problema Resuelto', type: 'select', required: true, options: ['Sí', 'Parcialmente', 'No', 'Pendiente'] },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true },
      { id: 'client_signature', name: 'client_signature', label: 'Firma Cliente', type: 'signature', required: true }
    ]
  },
  {
    name: 'Inventario & Hoja de Vida de Activos',
    description: 'Formato para gestión de inventarios y activos',
    category: 'inventory',
    isActive: true,
    fields: [
      { id: 'asset_code', name: 'asset_code', label: 'Código de Activo', type: 'text', required: true },
      { id: 'asset_description', name: 'asset_description', label: 'Descripción del Activo', type: 'text', required: true },
      { id: 'asset_location', name: 'asset_location', label: 'Ubicación', type: 'text', required: true },
      { id: 'asset_condition', name: 'asset_condition', label: 'Estado del Activo', type: 'select', required: true, options: ['Excelente', 'Bueno', 'Regular', 'Malo', 'Fuera de Servicio'] },
      { id: 'last_maintenance', name: 'last_maintenance', label: 'Último Mantenimiento', type: 'date', required: false },
      { id: 'asset_value', name: 'asset_value', label: 'Valor del Activo', type: 'number', required: false },
      { id: 'responsible_person', name: 'responsible_person', label: 'Persona Responsable', type: 'text', required: true },
      { id: 'asset_photo', name: 'asset_photo', label: 'Foto del Activo', type: 'photo', required: false },
      { id: 'notes', name: 'notes', label: 'Observaciones', type: 'textarea', required: false },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true }
    ]
  },
  {
    name: 'Movimientos de Materiales & Herramientas',
    description: 'Formato para control de materiales y herramientas',
    category: 'materials',
    isActive: true,
    fields: [
      { id: 'movement_type', name: 'movement_type', label: 'Tipo de Movimiento', type: 'select', required: true, options: ['Entrada', 'Salida', 'Transferencia', 'Devolución'] },
      { id: 'movement_date', name: 'movement_date', label: 'Fecha de Movimiento', type: 'date', required: true },
      { id: 'materials_list', name: 'materials_list', label: 'Lista de Materiales', type: 'textarea', required: true },
      { id: 'quantities', name: 'quantities', label: 'Cantidades', type: 'textarea', required: true },
      { id: 'origin_location', name: 'origin_location', label: 'Ubicación de Origen', type: 'text', required: true },
      { id: 'destination_location', name: 'destination_location', label: 'Ubicación de Destino', type: 'text', required: true },
      { id: 'authorized_by', name: 'authorized_by', label: 'Autorizado por', type: 'text', required: true },
      { id: 'received_by', name: 'received_by', label: 'Recibido por', type: 'text', required: false },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true },
      { id: 'receiver_signature', name: 'receiver_signature', label: 'Firma Receptor', type: 'signature', required: false }
    ]
  },
  {
    name: 'Listado Maestro de Documentos y Registros',
    description: 'Formato para control de documentos y registros',
    category: 'documents',
    isActive: true,
    fields: [
      { id: 'document_code', name: 'document_code', label: 'Código de Documento', type: 'text', required: true },
      { id: 'document_title', name: 'document_title', label: 'Título del Documento', type: 'text', required: true },
      { id: 'document_type', name: 'document_type', label: 'Tipo de Documento', type: 'select', required: true, options: ['Manual', 'Procedimiento', 'Instructivo', 'Formato', 'Registro', 'Política'] },
      { id: 'version', name: 'version', label: 'Versión', type: 'text', required: true },
      { id: 'approval_date', name: 'approval_date', label: 'Fecha de Aprobación', type: 'date', required: true },
      { id: 'effective_date', name: 'effective_date', label: 'Fecha de Vigencia', type: 'date', required: true },
      { id: 'review_date', name: 'review_date', label: 'Fecha de Revisión', type: 'date', required: false },
      { id: 'responsible_area', name: 'responsible_area', label: 'Área Responsable', type: 'text', required: true },
      { id: 'distribution_list', name: 'distribution_list', label: 'Lista de Distribución', type: 'textarea', required: false },
      { id: 'document_location', name: 'document_location', label: 'Ubicación del Documento', type: 'text', required: true },
      { id: 'technician_signature', name: 'technician_signature', label: 'Firma Técnico', type: 'signature', required: true }
    ]
  }
];