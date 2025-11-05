import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { isAuthenticated, getCurrentUser } from "@/api/AuthApi";

export type DashboardView = "vender" | "notas" | "productos" | "inventario" | "ventas" | "cotizacion" | "pagos-pendientes" | "caja" | "registra-movimiento" | "reportes" | "ecommerce" | "configuracion" | "alertas" | "usuarios";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      try {
        const user = getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // Validar que la ruta actual sea permitida para el rol
        const userRole = user.rol.toLowerCase();
        const currentPath = location.pathname.split('/').pop() as DashboardView;

        if (userRole === "asistente") {
          const allowedViews: DashboardView[] = ["vender", "notas", "productos", "inventario", "ventas", "cotizacion", "pagos-pendientes", "registra-movimiento"];
          
          if (currentPath && !allowedViews.includes(currentPath)) {
            navigate("/dashboard/vender", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        navigate("/login");
      }
    };

    checkAuthentication();
  }, [navigate, location]);

  const getCurrentViewFromPath = (): DashboardView => {
    const path = location.pathname.split('/').pop();
    return (path as DashboardView) || "vender";
  };

  const handleViewChange = (view: DashboardView) => {
    const user = getCurrentUser();
    const userRole = user?.rol.toLowerCase();
    
    if (userRole === "asistente") {
      const allowedViews: DashboardView[] = ["vender", "notas", "productos", "inventario", "ventas", "cotizacion", "pagos-pendientes", "registra-movimiento"];
      
      if (!allowedViews.includes(view)) {
        return;
      }
    }
    
    // Navegar a la ruta real - esto agregará al historial
    navigate(`/dashboard/${view}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          currentView={getCurrentViewFromPath()} 
          onViewChange={handleViewChange} 
        />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;