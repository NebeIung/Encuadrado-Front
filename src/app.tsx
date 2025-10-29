import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect raíz a public */}
        <Route path="/" element={<Navigate to="/public" replace />} />
        
        {/* Login y Registro */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPatient />} />
        
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

        {/* Gestión de Servicios - Solo Admin */}
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

        {/* Rutas de paciente */}
        <Route element={<PatientLayout />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}