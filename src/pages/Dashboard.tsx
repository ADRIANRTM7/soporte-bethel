import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Users, FileText, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { workOrders, templates, getWorkOrdersByUser } = useData();

  if (!user) return null;

  const userWorkOrders = getWorkOrdersByUser(user.id, user.role);
  const pendingOrders = userWorkOrders.filter(wo => wo.status === 'pending').length;
  const inProgressOrders = userWorkOrders.filter(wo => wo.status === 'in_progress').length;
  const completedOrders = userWorkOrders.filter(wo => wo.status === 'completed').length;

  const stats = [
    {
      title: 'Órdenes Pendientes',
      value: pendingOrders,
      icon: ClipboardList,
      color: 'text-yellow-600'
    },
    {
      title: 'En Progreso',
      value: inProgressOrders,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Completadas',
      value: completedOrders,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Plantillas PDF',
      value: templates.length,
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, {user.name}
        </h1>
        <p className="text-muted-foreground">
          Panel de control - Gestión Operativa Bethel SAS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userWorkOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.number}</p>
                    <p className="text-sm text-muted-foreground">{order.clientName}</p>
                  </div>
                  <Badge variant={
                    order.status === 'completed' ? 'default' :
                    order.status === 'in_progress' ? 'secondary' :
                    'outline'
                  }>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.slice(0, 8).map((template) => (
                <div key={template.id} className="text-sm">
                  • {template.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;