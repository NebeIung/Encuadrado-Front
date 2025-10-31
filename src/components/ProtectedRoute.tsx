import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirigir a la ruta correcta del login
  if (!isAuthenticated) {
    return <Navigate to="/centro-de-salud-cuad/login" replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/centro-de-salud-cuad/private/dashboard" replace />;
  }

  // Verificar permisos específicos
  if (requiredPermission && user) {
    const hasPermission = checkPermission(user.role, requiredPermission);
    if (!hasPermission) {
      return <Navigate to="/centro-de-salud-cuad/private/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

// Helper para verificar permisos
function checkPermission(role: string, permission: string): boolean {
  const permissions: Record<string, string[]> = {
    admin: ["canEditCenter", "canManageServices", "canManageUsers", "canViewAll"],
    member: ["canManageServices", "canViewAll"],
    limited: ["canViewOwn"],
  };

  return permissions[role]?.includes(permission) || false;
}