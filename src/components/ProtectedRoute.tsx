// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/api/AuthApi";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Guardar la ubicación a la que intentaba acceder
    localStorage.setItem("redirectPath", location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};