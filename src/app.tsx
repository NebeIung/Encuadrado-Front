import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/private/Dashboard";
import Settings from "./pages/private/Settings";
import ServicesManagement from "./pages/private/ServicesManagement";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./pages/public/PublicLayout";
import Reservar from "./pages/public/Reservar";
import Especialidades from "./pages/public/Especialidades";
import Profesionales from "./pages/public/Profesionales";
import Nosotros from "./pages/public/Nosotros";
import ProfessionalSelect from "./pages/public/ProfessionalSelect";
import DateSelect from "./pages/public/DateSelect";
import PatientInfo from "./pages/public/PatientInfo";
import Success from "./pages/public/Success";
import Login from "./pages/Login";
import Welcome from "./pages/public/Welcome";
import Calendar from "./pages/private/Calendar";
import Professionals from "./pages/private/ProfessionalsSettings";
import Patients from "./pages/private/PatientsSettings";
import ProfessionalSchedule from "./pages/private/ProfessionalSchedule";
import AppointmentsManagement from "./pages/private/AppointmentsManagement";
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
    if (user?.role === 'patient') {
      return <Navigate to="/centro-de-salud-cuad/private/patient/dashboard" replace />;
    }
    return <Navigate to="/centro-de-salud-cuad/private/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Redirect raíz a centro-de-salud-cuad/public */}
      <Route path="/" element={<Navigate to="/centro-de-salud-cuad/public" replace />} />
      
      {/* Ruta base que envuelve todo */}
      <Route path="/centro-de-salud-cuad">
        {/* Login */}
        <Route 
          path="login" 
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } 
        />
        
        {/* Rutas públicas (sin autenticación) */}
        <Route path="public" element={<PublicLayout />}>
          <Route index element={<Welcome />} />
          <Route path="reservar" element={<Reservar />} />
          <Route path="especialidades" element={<Especialidades />} />
          <Route path="profesionales" element={<Profesionales />} />
          <Route path="nosotros" element={<Nosotros />} />
          
          {/* Flujo de agendamiento */}
          <Route path="select-professional" element={<ProfessionalSelect />} />
          <Route path="select-date" element={<DateSelect />} />
          <Route path="patient-info" element={<PatientInfo />} />
          <Route path="success" element={<Success />} />
        </Route>

        {/* Rutas privadas (con autenticación) */}
        <Route path="private">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "member", "limited"]}>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="settings"
            element={
              <ProtectedRoute requiredPermission="canEditCenter">
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="appointments"
            element={
              <ProtectedRoute allowedRoles={["admin", "member", "limited"]}>
                <MainLayout>
                  <AppointmentsManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="calendar"
            element={
              <ProtectedRoute allowedRoles={["admin", "member", "limited"]}>
                <MainLayout>
                  <Calendar />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="professionals"
            element={
              <ProtectedRoute requiredPermission="canManageUsers">
                <MainLayout>
                  <Professionals />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="patients"
            element={
              <ProtectedRoute requiredPermission="canManageUsers">
                <MainLayout>
                  <Patients />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="services"
            element={
              <ProtectedRoute allowedRoles={["admin", "member", "limited"]}>
                <MainLayout>
                  <ServicesManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="professionals/schedule"
            element={
              <ProtectedRoute requiredPermission="canManageUsers">
                <MainLayout>
                  <ProfessionalSchedule />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* Ruta catch-all para 404 */}
      <Route path="*" element={<Navigate to="/centro-de-salud-cuad/public" replace />} />
    </Routes>
  );
}