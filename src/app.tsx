import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/admin/dashboard";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./pages/public/PublicLayout";
import ServicesSelect from "./pages/public/ServicesSelect";
import ProfessionalSelect from "./pages/public/ProfessionalSelect";
import DateSelect from "./pages/public/DateSelect";
import ConfirmAppointment from "./pages/public/ConfirmAppointment";
import Success from "./pages/public/Success";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientLayout from "./layouts/PatientLayout";
import Login from "./pages/login";
import RegisterPatient from "./pages/register";
import Welcome from "./pages/public/Welcome";
import ServiceCarousel from "./components/ServiceCarousel";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/public" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/public" element={<PublicLayout />}>
          <Route index element={<Welcome />} />
          <Route path="reservar" element={<ServicesSelect />} />
          <Route path="especialidades" element={<ServiceCarousel />} />
          <Route path="profesionales" element={<ServiceCarousel />} />
          <Route path="select-date" element={<DateSelect />} />
          <Route path="confirm" element={<ConfirmAppointment />} />
          <Route path="success" element={<Success />} />
        </Route>

        <Route element={<PatientLayout />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
        </Route>

        <Route path="/register" element={<RegisterPatient />} />
      </Routes>
    </BrowserRouter>
  );
}