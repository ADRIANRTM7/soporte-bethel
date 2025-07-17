import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkOrder, PdfTemplate, FilledForm, Notification, SupportTicket, DEFAULT_TEMPLATES } from '@/types';
import { generateId } from '@/lib/utils';

interface DataContextType {
  // Work Orders
  workOrders: WorkOrder[];
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
  getWorkOrdersByUser: (userId: string, role: string) => WorkOrder[];
  
  // Templates
  templates: PdfTemplate[];
  createTemplate: (template: Omit<PdfTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, updates: Partial<PdfTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Forms
  filledForms: FilledForm[];
  createFilledForm: (form: Omit<FilledForm, 'id' | 'filledAt'>) => void;
  updateFilledForm: (id: string, updates: Partial<FilledForm>) => void;
  getFormsByWorkOrder: (workOrderId: string) => FilledForm[];
  
  // Notifications
  notifications: Notification[];
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  getUnreadCount: (userId: string) => number;
  
  // Support Tickets
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status' | 'attachments' | 'internalNotes' | 'clientVisible'>) => Promise<string>;
  updateTicket: (id: string, updates: Partial<SupportTicket>) => void;
  assignTicketToTechnician: (ticketId: string, technicianId: string) => void;
  createWorkOrderFromTicket: (ticketId: string, workOrderData: { assignedTechnicians: string[], scheduledDate: Date, notes: string }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateWorkOrderNumber = (count: number): string => {
  return `OT-${String(count + 1).padStart(5, '0')}`;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [filledForms, setFilledForms] = useState<FilledForm[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  // Initialize with demo data
  useEffect(() => {
    const savedWorkOrders = localStorage.getItem('bethel_work_orders');
    const savedTemplates = localStorage.getItem('bethel_templates');
    const savedForms = localStorage.getItem('bethel_filled_forms');
    const savedNotifications = localStorage.getItem('bethel_notifications');
    const savedTickets = localStorage.getItem('bethel_support_tickets');

    if (savedWorkOrders) {
      setWorkOrders(JSON.parse(savedWorkOrders));
    } else {
      // Create demo work orders
      const demoOrders: WorkOrder[] = [
        {
          id: generateId(),
          number: 'OT-00001',
          clientName: 'Empresa ABC S.A.S',
          clientContact: 'Pedro García - 300 123 4567',
          clientAddress: 'Calle 123 #45-67, Bogotá',
          description: 'Mantenimiento preventivo de aires acondicionados',
          serviceType: 'Mantenimiento',
          priority: 'medium',
          status: 'assigned',
          assignedTechnicians: ['3'],
          assignedFormats: ['mantenimiento-pc-multiequipo'],
          createdBy: '1',
          supervisorId: '2',
          scheduledDate: new Date('2024-12-03'),
          createdAt: new Date('2024-12-01'),
          updatedAt: new Date('2024-12-01'),
          evidences: []
        },
        {
          id: generateId(),
          number: 'OT-00002',
          clientName: 'Hotel Plaza Real',
          clientContact: 'Ana Martínez - 301 234 5678',
          clientAddress: 'Carrera 15 #89-23, Medellín',
          description: 'Instalación de sistema de climatización',
          serviceType: 'Instalación',
          priority: 'high',
          status: 'in_progress',
          assignedTechnicians: ['3', '4'],
          assignedFormats: ['instalacion-puesta-marcha', 'orden-trabajo'],
          createdBy: '2',
          supervisorId: '2',
          scheduledDate: new Date('2024-12-04'),
          createdAt: new Date('2024-12-02'),
          updatedAt: new Date('2024-12-02'),
          evidences: []
        }
      ];
      setWorkOrders(demoOrders);
      localStorage.setItem('bethel_work_orders', JSON.stringify(demoOrders));
    }

    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Initialize with default templates
      const initialTemplates = DEFAULT_TEMPLATES.map(template => ({
        ...template,
        id: generateId(),
        createdBy: '1',
        createdAt: new Date()
      }));
      setTemplates(initialTemplates);
      localStorage.setItem('bethel_templates', JSON.stringify(initialTemplates));
    }

    if (savedForms) {
      setFilledForms(JSON.parse(savedForms));
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    if (savedTickets) {
      setSupportTickets(JSON.parse(savedTickets));
    } else {
      // Demo tickets
      const demoTickets: SupportTicket[] = [
        {
          id: generateId(),
          ticketNumber: 'TIC-00001',
          clientName: 'María González',
          clientEmail: 'maria@empresa.com',
          clientPhone: '301 234 5678',
          clientCompany: 'Empresa XYZ',
          subject: 'Problema con aire acondicionado',
          description: 'El equipo de aire acondicionado no está enfriando correctamente',
          category: 'hardware',
          priority: 'high',
          status: 'open',
          attachments: [],
          internalNotes: '',
          createdAt: new Date('2024-12-01T10:00:00'),
          updatedAt: new Date('2024-12-01T10:00:00'),
          clientVisible: true
        },
        {
          id: generateId(),
          ticketNumber: 'TIC-00002',
          clientName: 'Carlos Rodríguez',
          clientEmail: 'carlos@hotel.com',
          clientPhone: '302 345 6789',
          clientCompany: 'Hotel Plaza',
          subject: 'Instalación de nuevo sistema',
          description: 'Necesito instalar un nuevo sistema de climatización',
          category: 'installation',
          priority: 'medium',
          status: 'assigned',
          assignedTo: '3',
          attachments: [],
          internalNotes: 'Cliente solicita instalación para el próximo fin de semana',
          createdAt: new Date('2024-12-02T14:30:00'),
          updatedAt: new Date('2024-12-02T15:00:00'),
          clientVisible: true
        }
      ];
      setSupportTickets(demoTickets);
      localStorage.setItem('bethel_support_tickets', JSON.stringify(demoTickets));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('bethel_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('bethel_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('bethel_filled_forms', JSON.stringify(filledForms));
  }, [filledForms]);

  useEffect(() => {
    localStorage.setItem('bethel_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bethel_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Work Orders
  const createWorkOrder = (orderData: Omit<WorkOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: WorkOrder = {
      ...orderData,
      id: generateId(),
      number: generateWorkOrderNumber(workOrders.length),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setWorkOrders(prev => [...prev, newOrder]);
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === id 
        ? { ...order, ...updates, updatedAt: new Date() }
        : order
    ));
  };

  const deleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(order => order.id !== id));
  };

  const getWorkOrdersByUser = (userId: string, role: string): WorkOrder[] => {
    if (role === 'admin') {
      return workOrders;
    } else if (role === 'supervisor') {
      return workOrders.filter(order => 
        order.supervisorId === userId || order.createdBy === userId
      );
    } else {
      return workOrders.filter(order => 
        order.assignedTechnicians.includes(userId)
      );
    }
  };

  // Templates
  const createTemplate = (templateData: Omit<PdfTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: PdfTemplate = {
      ...templateData,
      id: generateId(),
      createdAt: new Date()
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const updateTemplate = (id: string, updates: Partial<PdfTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  // Forms
  const createFilledForm = (formData: Omit<FilledForm, 'id' | 'filledAt'>) => {
    const newForm: FilledForm = {
      ...formData,
      id: generateId(),
      filledAt: new Date()
    };
    setFilledForms(prev => [...prev, newForm]);
  };

  const updateFilledForm = (id: string, updates: Partial<FilledForm>) => {
    setFilledForms(prev => prev.map(form => 
      form.id === id ? { ...form, ...updates } : form
    ));
  };

  const getFormsByWorkOrder = (workOrderId: string): FilledForm[] => {
    return filledForms.filter(form => form.workOrderId === workOrderId);
  };

  // Notifications
  const createNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      createdAt: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getUnreadCount = (userId: string): number => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  };

  // Support Tickets
  const generateTicketNumber = (count: number): string => {
    return `TIC-${String(count + 1).padStart(5, '0')}`;
  };

  const createSupportTicket = async (ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status' | 'attachments' | 'internalNotes' | 'clientVisible'>): Promise<string> => {
    const ticketNumber = generateTicketNumber(supportTickets.length);
    const newTicket: SupportTicket = {
      ...ticketData,
      id: generateId(),
      ticketNumber,
      status: 'open',
      attachments: [],
      internalNotes: '',
      clientVisible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSupportTickets(prev => [...prev, newTicket]);
    
    // Crear notificación para supervisores
    createNotification({
      userId: '2', // Supervisor demo
      title: 'Nuevo ticket de soporte',
      message: `Nuevo ticket ${ticketNumber} creado por ${ticketData.clientName}`,
      type: 'info',
      read: false,
      ticketId: newTicket.id
    });
    
    return ticketNumber;
  };

  const updateTicket = (id: string, updates: Partial<SupportTicket>) => {
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === id 
        ? { ...ticket, ...updates, updatedAt: new Date() }
        : ticket
    ));
  };

  const assignTicketToTechnician = (ticketId: string, technicianId: string) => {
    updateTicket(ticketId, {
      assignedTo: technicianId,
      status: 'assigned'
    });
  };

  const createWorkOrderFromTicket = (ticketId: string, workOrderData: { assignedTechnicians: string[], scheduledDate: Date, notes: string }) => {
    const ticket = supportTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const newWorkOrder = {
      clientName: ticket.clientName,
      clientContact: `${ticket.clientEmail} - ${ticket.clientPhone}`,
      clientAddress: ticket.clientCompany || 'Por definir',
      description: `${ticket.subject}\n\nDescripción: ${ticket.description}`,
      serviceType: ticket.category === 'installation' ? 'Instalación' : 
                   ticket.category === 'maintenance' ? 'Mantenimiento' : 'Soporte Técnico',
      priority: ticket.priority,
      status: 'assigned' as const,
      assignedTechnicians: workOrderData.assignedTechnicians,
      assignedFormats: ['orden-trabajo'],
      createdBy: '2',
      supervisorId: '2',
      scheduledDate: workOrderData.scheduledDate,
      notes: workOrderData.notes,
      evidences: []
    };

    createWorkOrder(newWorkOrder);
    updateTicket(ticketId, { status: 'assigned' });
  };

  const value: DataContextType = {
    workOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    getWorkOrdersByUser,
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    filledForms,
    createFilledForm,
    updateFilledForm,
    getFormsByWorkOrder,
    notifications,
    createNotification,
    markAsRead,
    getUnreadCount,
    supportTickets,
    createSupportTicket,
    updateTicket,
    assignTicketToTechnician,
    createWorkOrderFromTicket
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};