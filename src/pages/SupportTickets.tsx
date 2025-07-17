import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SupportTickets() {
  const { user } = useAuth();
  const { supportTickets, createWorkOrderFromTicket, updateTicket, assignTicketToTechnician } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    technicianIds: [] as string[],
    scheduledDate: '',
    notes: ''
  });

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssignToWorkOrder = () => {
    if (selectedTicket && assignmentData.technicianIds.length > 0) {
      createWorkOrderFromTicket(selectedTicket.id, {
        assignedTechnicians: assignmentData.technicianIds,
        scheduledDate: new Date(assignmentData.scheduledDate),
        notes: assignmentData.notes
      });
      setShowAssignDialog(false);
      setSelectedTicket(null);
      setAssignmentData({ technicianIds: [], scheduledDate: '', notes: '' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'assigned': return <MessageSquare className="w-4 h-4" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'supervisor') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets de Soporte</h1>
          <p className="text-gray-600">Gestiona los tickets de soporte de los clientes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="assigned">Asignado</SelectItem>
            <SelectItem value="in_progress">En progreso</SelectItem>
            <SelectItem value="resolved">Resuelto</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de tickets */}
      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {ticket.ticketNumber}
                    </span>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority === 'urgent' ? 'Urgente' : 
                       ticket.priority === 'high' ? 'Alta' :
                       ticket.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">
                        {ticket.status === 'open' ? 'Abierto' :
                         ticket.status === 'assigned' ? 'Asignado' :
                         ticket.status === 'in_progress' ? 'En progreso' :
                         ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                      </span>
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                  <p className="text-gray-600 mb-2">{ticket.clientName} - {ticket.clientCompany || 'Sin empresa'}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Creado: {format(ticket.createdAt, 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                    <span>Categoría: {ticket.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalles del Ticket {ticket.ticketNumber}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Cliente</Label>
                            <p className="text-sm">{ticket.clientName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Empresa</Label>
                            <p className="text-sm">{ticket.clientCompany || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm">{ticket.clientEmail}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Teléfono</Label>
                            <p className="text-sm">{ticket.clientPhone || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Descripción</Label>
                          <p className="text-sm mt-1">{ticket.description}</p>
                        </div>
                        {ticket.internalNotes && (
                          <div>
                            <Label className="text-sm font-medium">Notas internas</Label>
                            <p className="text-sm mt-1">{ticket.internalNotes}</p>
                          </div>
                        )}
                        {ticket.resolutionNotes && (
                          <div>
                            <Label className="text-sm font-medium">Notas de resolución</Label>
                            <p className="text-sm mt-1">{ticket.resolutionNotes}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {ticket.status === 'open' && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowAssignDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear OT
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo de asignación */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Orden de Trabajo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Técnicos asignados</Label>
              <p className="text-sm text-gray-600">Selecciona los técnicos que trabajarán en esta orden</p>
            </div>
            <div>
              <Label>Fecha programada</Label>
              <Input
                type="date"
                value={assignmentData.scheduledDate}
                onChange={(e) => setAssignmentData({...assignmentData, scheduledDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Notas adicionales</Label>
              <Textarea
                value={assignmentData.notes}
                onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                placeholder="Notas adicionales para la orden de trabajo..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAssignToWorkOrder} className="flex-1">
                Crear Orden de Trabajo
              </Button>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}