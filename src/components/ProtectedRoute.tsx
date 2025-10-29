import { Navigate } from "react-router-dom";
import { useAuth, PERMISSIONS } from "../contexts/AuthContext";
import type { Role } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermission?: keyof typeof PERMISSIONS.admin;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, hasPermission } = useAuth();

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles permitidos, verificar
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '100px auto'
      }}>
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para acceder a esta sección.</p>
        <p style={{ color: '#666', marginTop: '20px' }}>
          Tu rol actual: <strong>{user.role}</strong>
        </p>
      </div>
    );
  }

  // Si se especificó un permiso requerido, verificar
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '100px auto'
      }}>
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes permiso para realizar esta acción.</p>
        <p style={{ color: '#666', marginTop: '20px' }}>
          Permiso requerido: <strong>{requiredPermission}</strong>
        </p>
      </div>
    );
  }

  return children;
}