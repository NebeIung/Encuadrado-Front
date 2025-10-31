import { useState, useEffect } from "react";
import { 
  Box, 
  ToggleButton, 
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Divider
} from "@mui/material";
import { 
  CalendarMonth as CalendarMonthIcon, 
  ViewDay as ViewDayIcon,
  People as PeopleIcon,
  Person as PersonIcon
} from "@mui/icons-material";
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
  email: string;
  role?: string;
  specialties: Array<{ id: number; name: string; duration: number; color?: string; }>;
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
  specialty: { id: number; name: string; duration: number; color?: string; };
  status: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | 'all'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProfessionals();
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedProfessional, currentDate, viewMode]);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      const nonAdminProfs = response.data.filter((p: Professional) => p.role !== 'admin');
      setProfessionals(nonAdminProfs);
      
      // Si es admin, dejar en "all", si no, seleccionar el profesional actual
      if (!isAdmin && user?.id) {
        const currentProf = nonAdminProfs.find((p: Professional) => p.id === user.id);
        if (currentProf) {
          setSelectedProfessional(currentProf.id);
        }
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
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
      
      const response = await api.get('/appointments/list', {
        params: {
          user: user?.email,
          start_date: startDate,
          end_date: endDate
        }
      });
      
      let filteredAppointments = response.data;

      // Filtrar por profesional seleccionado
      if (selectedProfessional !== 'all') {
        filteredAppointments = filteredAppointments.filter((apt: any) => 
          apt.professional.id === selectedProfessional
        );
      }

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

  // Obtener el profesional seleccionado o un profesional virtual con todas las especialidades
  const selectedProf = selectedProfessional === 'all' 
    ? {
        id: 0,
        name: 'Todos los profesionales',
        email: '',
        specialties: professionals.flatMap(p => p.specialties).filter((spec, index, self) => 
          index === self.findIndex(s => s.id === spec.id)
        ),
        schedule: {}
      }
    : professionals.find(p => p.id === selectedProfessional);

  return (
    <Box>
      {/* Header con controles */}
      <Box sx={{ mb: 3 }}>
        <Stack 
          direction="row"
          spacing={2} 
          alignItems="center"
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1 }} />
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

          {/* Filtro de profesional a la derecha (solo admin) */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {isAdmin && (
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel>Profesional</InputLabel>
                <Select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value as number | 'all')}
                  label="Profesional"
                >
                  <MenuItem value="all">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PeopleIcon fontSize="small" />
                      <Typography>Todos los profesionales</Typography>
                    </Stack>
                  </MenuItem>
                  {professionals.length > 0 && <Divider />}
                  {professionals.map((prof) => (
                    <MenuItem key={prof.id} value={prof.id}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" />
                        <Typography>{prof.name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Renderizar vista correspondiente */}
      {viewMode === 'month' ? (
        <MonthlyView
          professionals={professionals}
          patients={patients}
          selectedProfessional={selectedProfessional === 'all' ? '' : selectedProfessional}
          setSelectedProfessional={setSelectedProfessional}
          appointments={appointments}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onDayClick={handleDaySelect}
          onAppointmentsUpdate={fetchAppointments}
          selectedProf={selectedProf}
          isAdmin={isAdmin}
          allProfessionals={professionals}
          isAllSelected={selectedProfessional === 'all'}
        />
      ) : (
        <DailyView
          professionals={professionals}
          patients={patients}
          selectedProfessional={selectedProfessional === 'all' ? '' : selectedProfessional}
          setSelectedProfessional={setSelectedProfessional}
          appointments={appointments}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onAppointmentsUpdate={fetchAppointments}
          selectedProf={selectedProf}
          isAdmin={isAdmin}
          onBackToMonth={() => setViewMode('month')}
          allProfessionals={professionals}
          isAllSelected={selectedProfessional === 'all'} 
        />
      )}
    </Box>
  );
}