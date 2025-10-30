import { useState, useEffect } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CalendarMonth as CalendarMonthIcon, ViewDay as ViewDayIcon } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/apiClient";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/es';
import MonthlyView from "./MonthlyView";
import DailyView from "./DailyView";

dayjs.locale('es');

interface Professional {
  id: number;
  name: string;
  specialties: Array<{ id: number; name: string; duration: number; }>;
  schedule?: any;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  rut: string;
  birth_date: string;
}

interface Appointment {
  id: number;
  date: string;
  patient: { id: number; name: string; email: string; phone: string; };
  professional: { id: number; name: string; };
  specialty: { id: number; name: string; duration: number; };
  status: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | ''>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchProfessionals();
    } else {
      fetchCurrentProfessionalId();
    }
    fetchPatients();
  }, [isAdmin]);

  useEffect(() => {
    if (selectedProfessional) {
      fetchAppointments();
    }
  }, [selectedProfessional, currentDate]);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      setProfessionals(response.data);
      if (response.data.length > 0) {
        setSelectedProfessional(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const fetchCurrentProfessionalId = async () => {
    try {
      const response = await api.get('/professionals');
      const currentProf = response.data.find((p: Professional) => 
        p.name === user?.name || p.id.toString() === user?.email
      );
      if (currentProf) {
        setProfessionals([currentProf]);
        setSelectedProfessional(currentProf.id);
      }
    } catch (error) {
      console.error('Error fetching current professional:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      let startDate, endDate;
      
      if (viewMode === 'month') {
        startDate = currentDate.startOf('month').format('YYYY-MM-DD');
        endDate = currentDate.endOf('month').format('YYYY-MM-DD');
      } else {
        startDate = currentDate.format('YYYY-MM-DD');
        endDate = currentDate.format('YYYY-MM-DD');
      }
      
      const response = await api.get('/appointments', {
        params: {
          user: user?.email,
          start_date: startDate,
          end_date: endDate
        }
      });
      
      // Filtrar por profesional
      let filteredAppointments = response.data.filter((apt: any) => 
        apt.professional.id === selectedProfessional
      );

      // Si NO es admin, ocultar las citas canceladas
      if (!isAdmin) {
        filteredAppointments = filteredAppointments.filter((apt: any) => 
          apt.status !== 'cancelled'
        );
      }
      
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  const handleDaySelect = (day: Dayjs) => {
    setSelectedDay(day);
    setCurrentDate(day);
    setViewMode('day');
  };

  const selectedProf = professionals.find(p => p.id === selectedProfessional);

  return (
    <Box>
      {/* Toggle entre vistas */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          aria-label="vista de calendario"
        >
          <ToggleButton value="month" aria-label="vista mensual">
            <CalendarMonthIcon sx={{ mr: 1 }} />
            Mes
          </ToggleButton>
          <ToggleButton value="day" aria-label="vista diaria">
            <ViewDayIcon sx={{ mr: 1 }} />
            Día
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Renderizar vista correspondiente */}
      {viewMode === 'month' ? (
        <MonthlyView
          professionals={professionals}
          patients={patients}
          selectedProfessional={selectedProfessional}
          setSelectedProfessional={setSelectedProfessional}
          appointments={appointments}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onDayClick={handleDaySelect}
          onAppointmentsUpdate={fetchAppointments}
          selectedProf={selectedProf}
          isAdmin={isAdmin}
        />
      ) : (
        <DailyView
          professionals={professionals}
          patients={patients}
          selectedProfessional={selectedProfessional}
          setSelectedProfessional={setSelectedProfessional}
          appointments={appointments}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onAppointmentsUpdate={fetchAppointments}
          selectedProf={selectedProf}
          isAdmin={isAdmin}
          onBackToMonth={() => setViewMode('month')}
        />
      )}
    </Box>
  );
}