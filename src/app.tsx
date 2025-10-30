import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";
import ServicesManagement from "./pages/admin/ServicesManagement";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./pages/public/PublicLayout";
import Reservar from "./pages/public/Reservar";
import Especialidades from "./pages/public/Especialidades";
import Profesionales from "./pages/public/Profesionales";
import Nosotros from "./pages/public/Nosotros";
import Terminos from "./pages/public/Terminos";
import ProfessionalSelect from "./pages/public/ProfessionalSelect";
import DateSelect from "./pages/public/DateSelect";
import ConfirmAppointment from "./pages/public/ConfirmAppointment";
import Success from "./pages/public/Success";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientLayout from "./layouts/PatientLayout";
import Login from "./pages/Login";
import RegisterPatient from "./pages/Register";
import Welcome from "./pages/public/Welcome";
import Calendar from "./pages/admin/Calendar";
import Professionals from "./pages/admin/ProfessionalsSettings";
import Patients from "./pages/admin/PatientsSettings";
import ProfessionalSchedule from "./pages/admin/ProfessionalSchedule";
import { Box, CircularProgress } from "@mui/material";

// Componente para redireccionar usuarios autenticados
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

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

  if (isAuthenticated) {
    // Redirigir según el rol
    if (user?.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Redirect raíz a public */}
      <Route path="/" element={<Navigate to="/public" replace />} />
      
      {/* Login y Registro - Solo accesibles si NO está autenticado */}
      <Route 
        path="/login" 
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        } 
      />
      <Route 
        path="/register" 
        element={
          <AuthRedirect>
            <RegisterPatient />
          </AuthRedirect>
        } 
      />
      
      {/* Rutas públicas (sin autenticación) */}
      <Route path="/public" element={<PublicLayout />}>
        <Route index element={<Welcome />} />
        <Route path="reservar" element={<Reservar />} />
        <Route path="especialidades" element={<Especialidades />} />
        <Route path="profesionales" element={<Profesionales />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="terminos" element={<Terminos />} />
        
        {/* Flujo de agendamiento */}
        <Route path="select-professional" element={<ProfessionalSelect />} />
        <Route path="select-date" element={<DateSelect />} />
        <Route path="confirm" element={<ConfirmAppointment />} />
        <Route path="success" element={<Success />} />
      </Route>

      {/* Rutas protegidas para profesionales */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "member", "limited"]}>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Configuración del Centro - Solo Admin */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredPermission="canEditCenter">
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Gestión de Servicios - Admin y Member */}
      <Route
        path="/services"
        element={
          <ProtectedRoute requiredPermission="canManageServices">
            <MainLayout>
              <ServicesManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Calendario - Todos los profesionales */}
      <Route
        path="/calendar"
        element={
          <ProtectedRoute allowedRoles={["admin", "member", "limited"]}>
            <MainLayout>
              <Calendar />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Gestión de Profesionales - Solo Admin */}
      <Route
        path="/professionals"
        element={
          <ProtectedRoute requiredPermission="canManageUsers">
            <MainLayout>
              <Professionals />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Gestión de Pacientes - Solo Admin */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute requiredPermission="canManageUsers">
            <MainLayout>
              <Patients />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Gestión de Horarios - Solo Admin */}
      <Route
        path="/professionals/schedule"
        element={
          <ProtectedRoute requiredPermission="canManageUsers">
            <MainLayout>
              <ProfessionalSchedule />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de paciente */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
      </Route>
    </Routes>
  );
}