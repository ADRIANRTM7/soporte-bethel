import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import LoginForm from "@/components/auth/LoginForm";
import Layout from "@/components/common/Layout";
import DashboardSelector from "./components/dashboard/DashboardSelector";
import WorkOrders from "./pages/WorkOrders";
import Users from "./pages/Users";
import Templates from "./pages/Templates";
import Forms from "./pages/Forms";
import Reports from "./pages/Reports";
import SupportTickets from "./pages/SupportTickets";
import PublicSupport from "./pages/PublicSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/soporte" element={<PublicSupport />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardSelector />} />
                <Route path="/work-orders" element={<WorkOrders />} />
                <Route path="/users" element={<Users />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/support-tickets" element={<SupportTickets />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
