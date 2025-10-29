import { createContext, useContext, useState, useEffect } from 'react';

// Tipos de roles
export type Role = 'admin' | 'member' | 'limited';

// Definición de permisos por rol
export const PERMISSIONS = {
  admin: {
    canEditCenter: true,
    canManageServices: true,
    canViewAllAppointments: true,
    canCreateAppointment: true,
    canEditAppointment: true,
    canCancelAppointment: true,
    canManageProfessionals: true,
  },
  member: {
    canEditCenter: false,
    canManageServices: false,
    canViewAllAppointments: false,
    canCreateAppointment: true,
    canEditAppointment: true,
    canCancelAppointment: true,
    canManageProfessionals: false,
  },
  limited: {
    canEditCenter: false,
    canManageServices: false,
    canViewAllAppointments: false,
    canCreateAppointment: false,
    canEditAppointment: false,
    canCancelAppointment: false,
    canManageProfessionals: false,
  },
};

// Mapeo de nombres de roles en español
export const ROLE_NAMES: Record<Role, string> = {
  admin: 'Administrador',
  member: 'Miembro',
  limited: 'Solo Lectura',
};

// Interfaz del usuario
interface User {
  email: string;
  name: string;
  role: Role;
  id?: number;
}

// Context
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hasPermission: (permission: keyof typeof PERMISSIONS.admin) => boolean;
  isAdmin: boolean;
  isMember: boolean;
  isLimited: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: keyof typeof PERMISSIONS.admin): boolean => {
    if (!user) return false;
    return PERMISSIONS[user.role][permission] || false;
  };

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  const isLimited = user?.role === 'limited';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasPermission,
        isAdmin,
        isMember,
        isLimited,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

// Componente para mostrar badge de rol
export function RoleBadge() {
  const { user } = useAuth();
  
  if (!user) return null;

  const colors = {
    admin: '#ff441c',
    member: '#1976d2',
    limited: '#9e9e9e',
  };

  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: colors[user.role],
        color: 'white',
      }}
    >
      {ROLE_NAMES[user.role]}
    </span>
  );
}

// Componente condicional por permiso
export function CanAccess({
  permission,
  children,
  fallback,
}: {
  permission: keyof typeof PERMISSIONS.admin;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}