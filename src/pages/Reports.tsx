import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ReportsPage: React.FC = () => {
  const { user, hasRoles } = useAuth();
  const { workOrders, filledForms, templates } = useData();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  if (!hasRoles(['admin', 'supervisor'])) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página</p>
      </div>
    );
  }

  // Filtrar datos según los filtros seleccionados
  const filteredWorkOrders = workOrders.filter(order => {
    let matchesDate = true;
    let matchesStatus = true;

    if (dateFrom) {
      matchesDate = matchesDate && new Date(order.createdAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(order.createdAt) <= new Date(dateTo);
    }
    if (selectedStatus !== 'all') {
      matchesStatus = order.status === selectedStatus;
    }

    return matchesDate && matchesStatus;
  });

  // Estadísticas generales
  const totalWorkOrders = filteredWorkOrders.length;
  const completedOrders = filteredWorkOrders.filter(o => o.status === 'completed').length;
  const inProgressOrders = filteredWorkOrders.filter(o => o.status === 'in_progress').length;
  const pendingOrders = filteredWorkOrders.filter(o => o.status === 'pending').length;
  const totalForms = filledForms.filter(f => 
    filteredWorkOrders.some(wo => wo.id === f.workOrderId)
  ).length;

  // Datos para gráficos
  const statusData = [
    { name: 'Completadas', value: completedOrders, color: '#10b981' },
    { name: 'En Progreso', value: inProgressOrders, color: '#3b82f6' },
    { name: 'Pendientes', value: pendingOrders, color: '#f59e0b' },
    { name: 'Asignadas', value: filteredWorkOrders.filter(o => o.status === 'assigned').length, color: '#8b5cf6' }
  ];

  const serviceTypeData = filteredWorkOrders.reduce((acc, order) => {
    acc[order.serviceType] = (acc[order.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceTypeChartData = Object.entries(serviceTypeData).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const monthlyData = filteredWorkOrders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData)
    .sort()
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
      orders: count
    }));

  const templateUsage = templates.map(template => {
    const usage = filledForms.filter(form => form.templateId === template.id).length;
    return {
      name: template.name,
      usage
    };
  }).sort((a, b) => b.usage - a.usage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Estadísticas y métricas de operaciones
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="assigned">Asignadas</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setDateFrom('');
                setDateTo('');
                setSelectedStatus('all');
              }}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              +{((totalWorkOrders / (workOrders.length || 1)) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalWorkOrders > 0 ? ((completedOrders / totalWorkOrders) * 100).toFixed(1) : 0}% del filtro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalWorkOrders > 0 ? ((inProgressOrders / totalWorkOrders) * 100).toFixed(1) : 0}% del filtro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formularios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalForms}</div>
            <p className="text-xs text-muted-foreground">
              Formularios completados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de órdenes */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Órdenes de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tipos de servicio */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceTypeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia Mensual de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Uso de plantillas */}
      <Card>
        <CardHeader>
          <CardTitle>Uso de Plantillas de Formularios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templateUsage.map((template, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">{template.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.max((template.usage / Math.max(...templateUsage.map(t => t.usage))) * 100, 5)}%` 
                      }}
                    />
                  </div>
                  <Badge variant="secondary">{template.usage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;