import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Button,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  PersonOff as PersonOffIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  People as PeopleIcon,
  MedicalServices as ServicesIcon,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/apiClient";
import { useNavigate } from "react-router-dom";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import CreateAppointmentModal from "./CreateAppointmentModal";
import PendingTermsAlert from "../../components/PendingTermsAlert";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

interface Stats {
  period: string;
  total: number;
  pending: number;
  to_confirm: number;
  confirmed: number;
  cancelled: number;
  missed: number;
}

interface Appointment {
  id: number;
  date: string;
  status: string;
  patient: { name: string; email: string; phone: string };
  professional: { id: number; name: string };
  specialty: { name: string; color: string; duration: number };
  notes?: string;
  cancellation_reason?: string;
}

interface Professional {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dailyStats, setDailyStats] = useState<Stats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<Stats | null>(null);
  const [toConfirmAppointments, setToConfirmAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createAppointmentOpen, setCreateAppointmentOpen] = useState(false);
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | 'all'>('all');
  const [selectedProfForCreate, setSelectedProfForCreate] = useState<number | ''>('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchProfessionals();
    }
    fetchPatients();
  }, [isAdmin]);

  useEffect(() => {
    if (user && (!isAdmin || professionals.length > 0 || selectedProfessional === 'all')) {
      fetchDashboardData();
    }
  }, [user, selectedProfessional, professionals]);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      const nonAdminProfs = response.data.filter((p: Professional) => p.role !== 'admin');
      setProfessionals(nonAdminProfs);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let userEmail = user?.email;
      
      if (isAdmin && selectedProfessional !== 'all') {
        const selectedProf = professionals.find(p => p.id === selectedProfessional);
        userEmail = selectedProf?.email;
      }

      const dailyResponse = await api.get("/appointments", {
        params: { user: userEmail, period: 'daily' },
      });

      const monthlyResponse = await api.get("/appointments", {
        params: { user: userEmail, period: 'monthly' },
      });

      setDailyStats(dailyResponse.data.stats);
      setMonthlyStats(monthlyResponse.data.stats);
      setToConfirmAppointments(dailyResponse.data.to_confirm || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  const navigateToAppointments = (period: 'daily' | 'monthly', status?: string) => {
    const params = new URLSearchParams();
    params.set('period', period);
    if (status) params.set('status', status);
    if (isAdmin && selectedProfessional !== 'all') {
      params.set('professionalId', selectedProfessional.toString());
    }
    navigate(`/centro-de-salud-cuad/private/appointments?${params.toString()}`);
  };

  // Abrir modal solo si hay profesionales
  const handleOpenCreateAppointment = () => {
    if (isAdmin) {
      if (professionals.length === 0) {
        alert("No hay profesionales disponibles. Por favor, crea profesionales primero.");
        return;
      }
      
      // Si hay un profesional seleccionado en el filtro, usarlo
      if (selectedProfessional !== 'all' && typeof selectedProfessional === 'number') {
        setSelectedProfForCreate(selectedProfessional);
      } else {
        // Si está en "Todos", no preseleccionar ninguno
        setSelectedProfForCreate('');
      }
    } else {
      // Si no es admin, usar el ID del usuario actual
      setSelectedProfForCreate(user!.id);
    }
    setCreateAppointmentOpen(true);
  };

  const getQuickAccessItems = () => {
    const allItems = [
      {
        icon: <AddIcon sx={{ fontSize: 40, color: "primary.main" }} />,
        title: "Nueva Cita",
        action: handleOpenCreateAppointment,
        roles: ['admin', 'member']
      },
      {
        icon: <CalendarIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
        title: "Agenda",
        action: () => navigate("/centro-de-salud-cuad/private/calendar"),
        roles: ['admin', 'member', 'limited']
      },
      {
        icon: <PeopleIcon sx={{ fontSize: 40, color: "success.main" }} />,
        title: "Profesionales",
        action: () => navigate("/centro-de-salud-cuad/private/professionals"),
        roles: ['admin']
      },
      {
        icon: <PersonAddIcon sx={{ fontSize: 40, color: "info.main" }} />,
        title: "Pacientes",
        action: () => navigate("/centro-de-salud-cuad/private/patients"),
        roles: ['admin']
      },
      {
        icon: <ServicesIcon sx={{ fontSize: 40, color: "warning.main" }} />,
        title: "Especialidades",
        action: () => navigate("/centro-de-salud-cuad/private/services"),
        roles: ['admin', 'member', 'limited']
      },
      {
        icon: <SettingsIcon sx={{ fontSize: 40, color: "error.main" }} />,
        title: "Configuración",
        action: () => navigate("/centro-de-salud-cuad/private/settings"),
        roles: ['admin']
      },
    ];

    return allItems.filter(item => user && item.roles.includes(user.role));
  };

  const quickAccessItems = getQuickAccessItems();

  // Obtener datos del profesional seleccionado
  const selectedProfForModal = professionals.find(p => p.id === selectedProfForCreate);

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
          Dashboard
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button startIcon={<RefreshIcon />} onClick={fetchDashboardData} variant="outlined">
            Actualizar
          </Button>

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
        </Stack>
      </Box>

      {/* Alerta de términos pendientes */}
      <PendingTermsAlert />

      {/* Alerta de citas por confirmar */}
      {toConfirmAppointments.length > 0 && (
        <Alert severity="warning" icon={<ScheduleIcon />} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            ⏰ {toConfirmAppointments.length} cita{toConfirmAppointments.length > 1 ? "s" : ""} por confirmar
          </Typography>
          <Typography variant="body2">
            Estas citas requieren confirmación de asistencia.
          </Typography>
        </Alert>
      )}

      {/* HOY */}
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        📅 Citas de Hoy
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardActionArea onClick={() => navigateToAppointments('daily')}>
              <CardContent>
                <Stack spacing={1}>
                  <CalendarIcon sx={{ fontSize: 40 }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {dailyStats?.total || 0}
                  </Typography>
                  <Typography variant="body2">Total</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('daily', 'pending')}>
              <CardContent>
                <Stack spacing={1}>
                  <HourglassIcon sx={{ fontSize: 40, color: "warning.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {dailyStats?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Pendientes</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('daily', 'to_confirm')}>
              <CardContent>
                <Stack spacing={1}>
                  <ScheduleIcon sx={{ fontSize: 40, color: "info.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {dailyStats?.to_confirm || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Por Confirmar</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('daily', 'confirmed')}>
              <CardContent>
                <Stack spacing={1}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {dailyStats?.confirmed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Confirmadas</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('daily', 'cancelled')}>
              <CardContent>
                <Stack spacing={1}>
                  <CancelIcon sx={{ fontSize: 40, color: "error.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>
                    {dailyStats?.cancelled || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Canceladas</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('daily', 'missed')}>
              <CardContent>
                <Stack spacing={1}>
                  <PersonOffIcon sx={{ fontSize: 40, color: "error.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>
                    {dailyStats?.missed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Perdidas</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* ESTE MES */}
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, mt: 4 }}>
        📊 Citas de Este Mes
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardActionArea onClick={() => navigateToAppointments('monthly')}>
              <CardContent>
                <Stack spacing={1}>
                  <CalendarIcon sx={{ fontSize: 40 }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {monthlyStats?.total || 0}
                  </Typography>
                  <Typography variant="body2">Total</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('monthly', 'pending')}>
              <CardContent>
                <Stack spacing={1}>
                  <HourglassIcon sx={{ fontSize: 40, color: "warning.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {monthlyStats?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Pendientes</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('monthly', 'to_confirm')}>
              <CardContent>
                <Stack spacing={1}>
                  <ScheduleIcon sx={{ fontSize: 40, color: "info.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {monthlyStats?.to_confirm || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Por Confirmar</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('monthly', 'confirmed')}>
              <CardContent>
                <Stack spacing={1}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {monthlyStats?.confirmed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Confirmadas</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('monthly', 'cancelled')}>
              <CardContent>
                <Stack spacing={1}>
                  <CancelIcon sx={{ fontSize: 40, color: "error.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>
                    {monthlyStats?.cancelled || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Canceladas</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardActionArea onClick={() => navigateToAppointments('monthly', 'missed')}>
              <CardContent>
                <Stack spacing={1}>
                  <PersonOffIcon sx={{ fontSize: 40, color: "error.main" }} />
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>
                    {monthlyStats?.missed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Perdidas</Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* ACCESOS RÁPIDOS */}
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, mt: 4 }}>
        🚀 Accesos Rápidos
      </Typography>
      <Grid container spacing={2}>
        {quickAccessItems.map((item, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={item.action} sx={{ height: '100%', p: 2 }}>
                <Stack spacing={2} alignItems="center">
                  {item.icon}
                  <Typography variant="body2" textAlign="center" sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modales */}
      <AppointmentDetailsModal
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={() => {
          setDetailsOpen(false);
          setSelectedAppointment(null);
          fetchDashboardData();
        }}
        onError={(message) => console.error(message)}
      />

      {/* Pasar todas las props requeridas */}
      <CreateAppointmentModal
    open={createAppointmentOpen}
    onClose={() => {
      setCreateAppointmentOpen(false);
      setSelectedProfForCreate('');
    }}
    professionals={professionals}
    patients={patients}
    selectedProfessional={selectedProfForCreate}
    selectedProf={selectedProfForModal || null}
    selectedDay={undefined}
    preselectedHour={null}
    onSuccess={() => {
      setCreateAppointmentOpen(false);
      setSelectedProfForCreate('');
      fetchDashboardData();
    }}
    onError={(message) => {
      console.error(message);
      alert(message);
    }}
  />
    </Box>
  );
}