import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';
import ClientDashboard from '@/pages/ClientDashboard';

const DashboardSelector: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Si es cliente, mostrar el ClientDashboard
  if (user.role === 'client') {
    return <ClientDashboard />;
  }

  // Para todos los otros roles (admin, supervisor, tecnician), mostrar el Dashboard normal
  return <Dashboard />;
};

export default DashboardSelector;