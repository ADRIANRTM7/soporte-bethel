import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Eye, Edit, Plus } from 'lucide-react';

const WorkOrders: React.FC = () => {
  const { user } = useAuth();
  const { getWorkOrdersByUser } = useData();

  if (!user) return null;

  const workOrders = getWorkOrdersByUser(user.id, user.role);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'assigned': return 'Asignada';
      case 'pending': return 'Pendiente';
      default: return status;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
          <p className="text-muted-foreground">
            Gestión de órdenes de trabajo y servicios técnicos
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'supervisor') && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.number}</CardTitle>
                  <p className="text-muted-foreground">{order.clientName}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                  <Badge className={getPriorityColor(order.priority)}>
                    {order.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Descripción:</p>
                  <p className="text-sm text-muted-foreground">{order.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contacto:</p>
                  <p className="text-sm text-muted-foreground">{order.clientContact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fecha Programada:</p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.scheduledDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tipo de Servicio:</p>
                  <p className="text-sm text-muted-foreground">{order.serviceType}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                {user.role !== 'tecnician' && (
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No hay órdenes de trabajo asignadas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkOrders;