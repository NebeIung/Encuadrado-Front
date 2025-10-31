import { useState, useEffect } from "react";
import {
  Box,
  Card,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import {
  ViewDay as ViewDayIcon,
  CalendarMonth as CalendarMonthIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/apiClient";
import { useLocation, useSearchParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import AppointmentsTable from "./AppointmentsTable";

dayjs.locale("es");

interface Professional {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface Appointment {
  id: number;
  date: string;
  status: string;
  patient: { id: number; name: string; email: string; phone: string };
  professional: { id: number; name: string };
  specialty: { id: number; name: string; color: string; duration: number };
  notes?: string;
  cancellation_reason?: string;
  displayStatus?: string;
}

export default function AppointmentsManagement() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = user?.role === 'admin';

  // Estados de vista
  const [viewMode, setViewMode] = useState<'day' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  
  // Estados de filtros
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Estados de datos
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Leer parámetros URL al cargar
  useEffect(() => {
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const professionalId = searchParams.get('professionalId');

    if (period === 'daily') {
      setViewMode('day');
      setCurrentDate(dayjs());
    } else if (period === 'monthly') {
      setViewMode('month');
      setCurrentDate(dayjs().startOf('month'));
    }

    if (status) {
      setSelectedStatus(status);
    }

    if (professionalId && isAdmin) {
      setSelectedProfessional(parseInt(professionalId));
    }
  }, [searchParams, isAdmin]);

  // Cargar profesionales
  useEffect(() => {
    if (isAdmin) {
      fetchProfessionals();
    }
  }, [isAdmin]);

  // Cargar citas cuando cambien los filtros
  useEffect(() => {
    if (user && (!isAdmin || professionals.length > 0 || selectedProfessional === 'all')) {
      fetchAppointments();
    }
  }, [user, selectedProfessional, currentDate, viewMode, professionals]);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      const nonAdminProfs = response.data.filter((p: Professional) => p.role !== 'admin');
      setProfessionals(nonAdminProfs);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let userEmail = user?.email;
      
      if (isAdmin && selectedProfessional !== 'all') {
        const selectedProf = professionals.find(p => p.id === selectedProfessional);
        userEmail = selectedProf?.email;
      }

      let startDate, endDate;
      if (viewMode === 'day') {
        startDate = currentDate.format('YYYY-MM-DD');
        endDate = currentDate.format('YYYY-MM-DD');
      } else {
        startDate = currentDate.startOf('month').format('YYYY-MM-DD');
        endDate = currentDate.endOf('month').format('YYYY-MM-DD');
      }

      const response = await api.get("/appointments/list", {
        params: {
          user: userEmail,
          start_date: startDate,
          end_date: endDate,
        },
      });

      // Filtrar por profesional si es necesario
      let filtered = response.data;
      if (isAdmin && selectedProfessional !== 'all') {
        filtered = filtered.filter((apt: Appointment) => 
          apt.professional.id === selectedProfessional
        );
      }

      // Calcular displayStatus
      const now = dayjs();
      const currentHour = now.hour();
      
      const appointmentsWithStatus = filtered.map((apt: Appointment) => {
        const aptDate = dayjs(apt.date);
        const isPast = aptDate.isBefore(now);
        const isCurrentHour = aptDate.hour() === currentHour && aptDate.isSame(now, 'day');
        
        if (apt.status === 'pending' && (isPast || isCurrentHour)) {
          return { ...apt, displayStatus: 'to_confirm' };
        }
        
        return { ...apt, displayStatus: apt.status };
      });

      setAppointments(appointmentsWithStatus);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPeriod = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => prev.subtract(1, 'day'));
    } else {
      setCurrentDate(prev => prev.subtract(1, 'month'));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => prev.add(1, 'day'));
    } else {
      setCurrentDate(prev => prev.add(1, 'month'));
    }
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
    if (viewMode === 'month') {
      setCurrentDate(dayjs().startOf('month'));
    }
  };

  const getPeriodLabel = () => {
    if (viewMode === 'day') {
      return currentDate.format('dddd, D [de] MMMM [de] YYYY');
    }
    return currentDate.format('MMMM [de] YYYY');
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Gestión de Citas
        </Typography>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
        >
          <ToggleButton value="day">
            <ViewDayIcon sx={{ mr: 1 }} />
            Día
          </ToggleButton>
          <ToggleButton value="month">
            <CalendarMonthIcon sx={{ mr: 1 }} />
            Mes
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filtros */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          {/* Navegación de período */}
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handlePrevPeriod}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 250, textAlign: 'center', textTransform: 'capitalize' }}>
              {getPeriodLabel()}
            </Typography>
            <IconButton onClick={handleNextPeriod}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          <Button variant="outlined" onClick={handleToday}>
            Hoy
          </Button>

          <Divider orientation="vertical" flexItem />

          {/* Filtro de profesional (solo admin) */}
          {isAdmin && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Profesional</InputLabel>
              <Select
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value as number | 'all')}
                label="Profesional"
              >
                <MenuItem value="all">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleIcon fontSize="small" />
                    <Typography>Todos</Typography>
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

          {/* Filtro de estado */}
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Estado"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="pending">Pendientes</MenuItem>
              <MenuItem value="to_confirm">Por Confirmar</MenuItem>
              <MenuItem value="confirmed">Confirmadas</MenuItem>
              <MenuItem value="cancelled">Canceladas</MenuItem>
              <MenuItem value="missed">Perdidas</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Tabla de citas */}
      <AppointmentsTable
        appointments={appointments}
        selectedStatus={selectedStatus}
        onAppointmentsUpdate={fetchAppointments}
      />
    </Box>
  );
}