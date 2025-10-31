import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Chip } from "@mui/material";

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member" | "limited" | "patient";
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Error al cargar usuario:", e);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function canAccess(role: string | undefined, permission: string): boolean {
  if (!role) return false;

  const permissions: Record<string, string[]> = {
    admin: ["canEditCenter", "canManageServices", "canManageUsers", "canViewAll"],
    member: ["canManageServices", "canViewAll"],
    limited: ["canManageServices", "canViewOwn"],
    patient: [],
  };

  return permissions[role]?.includes(permission) || false;
}

interface CanAccessProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAccess({ permission, children, fallback = null }: CanAccessProps) {
  const { user } = useAuth();

  if (!user || !canAccess(user.role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function RoleBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const roleConfig = {
    admin: { label: "Administrador", color: "primary" as const },
    member: { label: "Miembro", color: "secondary" as const },
    limited: { label: "Solo Lectura", color: "default" as const },
    patient: { label: "Paciente", color: "info" as const },
  };

  const config = roleConfig[user.role];

  return (
    <Chip 
      label={config.label} 
      color={config.color}
      size="small"
    />
  );
}