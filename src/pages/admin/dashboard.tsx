import { Typography, Box, Button, Paper, Alert } from "@mui/material";
import { Add as AddIcon, Settings as SettingsIcon } from "@mui/icons-material";
import AppointmentsTable from "../../components/AppointmentsTable";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth, RoleBadge, CanAccess } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const { data: appointments = [], isLoading } = useAppointments(user?.email || "");

  if (!user) {
    return <Alert severity="error">No hay usuario autenticado</Alert>;
  }

  // Filtrar citas según el rol
  const filteredAppointments = hasPermission("canViewAllAppointments")
    ? appointments // Admin ve todas
    : appointments.filter((apt: any) => {
        // Member solo ve las suyas
        return apt.professionalEmail === user.email;
      });

  return (
    <Box>
      {/* Header con rol */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" mb={1}>
            Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Hola {user.name} 👋
            </Typography>
            <RoleBadge />
          </Box>
        </Box>

        {/* Botones según permisos */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <CanAccess permission="canEditCenter">
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => navigate("/settings")}
            >
              Configuración del Centro
            </Button>
          </CanAccess>

          <CanAccess permission="canCreateAppointment">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/appointments/create")}
            >
              Nueva Cita
            </Button>
          </CanAccess>
        </Box>
      </Box>

      {/* Mensaje informativo según rol */}
      <CanAccess permission="canViewAllAppointments">
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Vista de Administrador:</strong> Estás viendo todas las citas del centro.
        </Alert>
      </CanAccess>

      <CanAccess
        permission="canViewAllAppointments"
        fallback={
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Vista de Miembro:</strong> Solo puedes ver tus propias citas.
          </Alert>
        }
      />

      {/* Estadísticas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Resumen
        </Typography>
        <Box sx={{ display: "flex", gap: 4 }}>
          <Box>
            <Typography variant="h3" color="primary">
              {filteredAppointments.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasPermission("canViewAllAppointments") 
                ? "Total de citas" 
                : "Tus citas"}
            </Typography>
          </Box>

          <CanAccess permission="canViewAllAppointments">
            <Box>
              <Typography variant="h3" color="secondary">
                {new Set(appointments.map((a: any) => a.professionId)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profesionales activos
              </Typography>
            </Box>
          </CanAccess>
        </Box>
      </Paper>

      {/* Tabla de citas */}
      {isLoading ? (
        <Typography>Cargando citas...</Typography>
      ) : (
        <>
          <Typography variant="h6" mb={2}>
            {hasPermission("canViewAllAppointments") 
              ? "Todas las citas" 
              : "Tus citas agendadas"}
          </Typography>

          {filteredAppointments.length === 0 ? (
            <Alert severity="info">
              No hay citas agendadas {hasPermission("canViewAllAppointments") ? "en el centro" : "para ti"}.
            </Alert>
          ) : (
            <AppointmentsTable 
              appointments={filteredAppointments}
              canEdit={hasPermission("canEditAppointment")}
              canCancel={hasPermission("canCancelAppointment")}
            />
          )}
        </>
      )}

      {/* Mensaje para usuarios limitados */}
      {user.role === "limited" && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <strong>Cuenta de Solo Lectura:</strong> No puedes realizar cambios en el sistema. 
          Contacta a un administrador si necesitas más permisos.
        </Alert>
      )}
    </Box>
  );
}