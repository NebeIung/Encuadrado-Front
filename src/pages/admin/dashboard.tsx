import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Stack,
} from "@mui/material";
import { 
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  MedicalServices as ServicesIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth, CanAccess, RoleBadge } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { api } from "../../api/apiClient";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/appointments', {
        params: { user: user?.email }
      });
      
      const appointments = response.data;
      const today = new Date().toDateString();
      
      setStats({
        today: appointments.filter((a: any) => 
          new Date(a.date).toDateString() === today
        ).length,
        pending: appointments.filter((a: any) => a.status === 'pending').length,
        confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
        cancelled: appointments.filter((a: any) => a.status === 'cancelled').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statsCards = [
    { 
      title: "Citas de Hoy", 
      value: stats.today, 
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2"
    },
    { 
      title: "Pendientes", 
      value: stats.pending, 
      icon: <TimeIcon sx={{ fontSize: 40 }} />,
      color: "#ed6c02"
    },
    { 
      title: "Confirmadas", 
      value: stats.confirmed, 
      icon: <CheckIcon sx={{ fontSize: 40 }} />,
      color: "#2e7d32"
    },
    { 
      title: "Canceladas", 
      value: stats.cancelled, 
      icon: <CancelIcon sx={{ fontSize: 40 }} />,
      color: "#d32f2f"
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Bienvenido, {user?.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <RoleBadge />
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Stack>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Accesos rápidos */}
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        Accesos Rápidos
      </Typography>

      <Grid container spacing={2}>
        {/* Agenda - Todos */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
            <CardContent onClick={() => navigate("/calendar")}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CalendarIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {user?.role === 'admin' ? 'Ver Agendas' : 'Mi Agenda'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role === 'admin' 
                      ? 'Calendario de profesionales' 
                      : 'Ver mis citas programadas'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración - Solo Admin */}
        <CanAccess permission="canEditCenter">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
              <CardContent onClick={() => navigate("/settings")}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SettingsIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Configuración
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ajustes del centro
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </CanAccess>

        {/* Servicios/Especialidades - Admin y Member */}
        <CanAccess permission="canManageServices">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
              <CardContent onClick={() => navigate("/services")}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ServicesIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Especialidades
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gestionar servicios
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </CanAccess>

        {/* Profesionales - Solo Admin */}
        <CanAccess permission="canManageUsers">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
              <CardContent onClick={() => navigate("/professionals")}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Profesionales
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gestionar profesionales
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </CanAccess>

        {/* Pacientes - Solo Admin */}
        <CanAccess permission="canManageUsers">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
              <CardContent onClick={() => navigate("/patients")}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PersonAddIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Pacientes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gestionar pacientes
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </CanAccess>
      </Grid>

      {/* Información de permisos */}
      <Box sx={{ mt: 4, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Tus permisos:</strong>{" "}
          {user?.role === "admin" && "Acceso completo al sistema - Gestión de especialidades, profesionales y agendas"}
          {user?.role === "member" && "Gestión de especialidades y visualización de agenda propia"}
          {user?.role === "limited" && "Solo visualización de agenda propia"}
        </Typography>
      </Box>
    </Box>
  );
}