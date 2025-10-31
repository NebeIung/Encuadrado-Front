import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Chip,
  Divider,
  Box,
  Alert,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonOff as PersonOffIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { api } from "../../api/apiClient";
import RescheduleModal from "./RescheduleModal";

dayjs.locale("es");

interface AppointmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function AppointmentDetailsModal({
  open,
  onClose,
  appointment,
  onSuccess,
  onError,
}: AppointmentDetailsModalProps) {
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);

  if (!appointment) return null;

  const isPast = dayjs(appointment.date).isBefore(dayjs(), 'minute');

  const getStatusInfo = () => {
    switch (appointment.status) {
      case 'pending':
        // Si la cita ya pasó o está en la hora actual, mostrar "Por Confirmar"
        const isPastOrCurrent = dayjs(appointment.date).isBefore(dayjs()) || 
                                dayjs(appointment.date).isSame(dayjs(), 'hour');
        if (isPastOrCurrent) {
          return { 
            label: 'Por Confirmar Asistencia', 
            color: 'info', 
            icon: <AccessTimeIcon /> 
          };
        }
        return { 
          label: 'Pendiente', 
          color: 'warning', 
          icon: <AccessTimeIcon /> 
        };
      case 'confirmed':
        return { 
          label: 'Confirmada (Asistió)', 
          color: 'success', 
          icon: <CheckCircleIcon /> 
        };
      case 'cancelled':
        return { 
          label: 'Cancelada', 
          color: 'error', 
          icon: <CancelIcon /> 
        };
      case 'missed':
        return { 
          label: 'Perdida (No Show)', 
          color: 'error', 
          icon: <PersonOffIcon /> 
        };
      default:
        return { 
          label: appointment.status, 
          color: 'default', 
          icon: null 
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Estados editables: solo pending que no haya pasado
  const isEditable = appointment.status === 'pending' && !isPast;

  // Puede cambiar estado si: pending, missed (pero no cancelled, confirmed)
  const canChangeStatus = !['cancelled', 'confirmed'].includes(appointment.status);

  const handleOpenCancelDialog = () => {
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancellationReason("");
  };

  const handleConfirmCancellation = async () => {
    if (!cancellationReason.trim()) {
      onError("Por favor ingrese una razón para la cancelación");
      return;
    }

    try {
      await api.put(`/appointments/${appointment.id}`, {
        status: 'cancelled',
        cancellation_reason: cancellationReason.trim(),
      });

      handleCloseCancelDialog();
      onSuccess();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      onError(error.response?.data?.error || 'Error al cancelar la cita');
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    try {
      await api.put(`/appointments/${appointment.id}`, {
        status: newStatus,
      });

      setStatusMenuAnchor(null);
      onSuccess();
    } catch (error: any) {
      console.error('Error changing status:', error);
      onError(error.response?.data?.error || 'Error al cambiar el estado');
    }
  };

  const handleOpenReschedule = () => {
    setRescheduleDialogOpen(true);
  };

  return (
    <>
      {/* Modal principal de detalles */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <MedicalServicesIcon 
                sx={{ 
                  color: appointment.specialty.color || '#666',
                  fontSize: 32 
                }} 
              />
              <Box>
                <Typography variant="h6">Detalles de la Cita</Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: #{appointment.id}
                </Typography>
              </Box>
            </Stack>

            {canChangeStatus && (
              <Button
                size="small"
                variant="outlined"
                endIcon={<MoreVertIcon />}
                onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
              >
                Cambiar Estado
              </Button>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Estado */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={statusInfo.label}
                  color={statusInfo.color as any}
                  icon={statusInfo.icon}
                  sx={{ fontWeight: 'bold' }}
                />
                {isPast && !['confirmed', 'cancelled', 'missed'].includes(appointment.status) && (
                  <Chip label="Pasada" size="small" color="default" />
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Fecha y Hora */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AccessTimeIcon color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Fecha y Hora
                </Typography>
              </Stack>
              <Typography variant="body1">
                {dayjs(appointment.date).format('dddd, D [de] MMMM [de] YYYY')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {dayjs(appointment.date).format('HH:mm')}
              </Typography>
            </Box>

            <Divider />

            {/* Paciente */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PersonIcon color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Paciente
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {appointment.patient.name}
              </Typography>
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {appointment.patient.email}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {appointment.patient.phone}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Especialidad y Profesional */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <MedicalServicesIcon color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Especialidad
                </Typography>
              </Stack>
              <Chip
                label={appointment.specialty.name}
                sx={{
                  bgcolor: appointment.specialty.color || '#666',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Duración: {appointment.specialty.duration} minutos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profesional: {appointment.professional.name}
              </Typography>
            </Box>

            {/* Alertas */}
            {appointment.status === 'cancelled' && (
              <Alert severity="error">
                Esta cita fue cancelada.
                {appointment.cancellation_reason && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Motivo:</strong> {appointment.cancellation_reason}
                  </Typography>
                )}
              </Alert>
            )}

            {appointment.status === 'missed' && (
              <Alert severity="error" icon={<PersonOffIcon />}>
                <Typography variant="body2">
                  El paciente no se presentó a la cita (No Show).
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
          
          {isEditable && (
            <>
              <Button
                onClick={handleOpenReschedule}
                startIcon={<EditIcon />}
                variant="outlined"
                color="primary"
              >
                Reagendar
              </Button>
              
              <Button
                onClick={handleOpenCancelDialog}
                startIcon={<CancelIcon />}
                variant="contained"
                color="error"
              >
                Cancelar Cita
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Menu de cambio de estado */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
      >
        {appointment.status === 'pending' && (
          <MenuItem onClick={() => handleChangeStatus('confirmed')}>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText>Confirmar Asistencia</ListItemText>
          </MenuItem>
        )}

        {appointment.status === 'pending' && (
          <MenuItem onClick={() => handleChangeStatus('missed')}>
            <ListItemIcon>
              <PersonOffIcon color="error" />
            </ListItemIcon>
            <ListItemText>Marcar como Perdida (No Show)</ListItemText>
          </MenuItem>
        )}

        {appointment.status === 'missed' && (
          <MenuItem onClick={() => handleChangeStatus('confirmed')}>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText>Cambiar a Confirmada</ListItemText>
          </MenuItem>
        )}

        {appointment.status === 'missed' && (
          <MenuItem onClick={() => handleChangeStatus('pending')}>
            <ListItemIcon>
              <AccessTimeIcon color="warning" />
            </ListItemIcon>
            <ListItemText>Cambiar a Pendiente</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Modal de confirmación de cancelación */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <WarningIcon color="error" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6">Cancelar Cita</Typography>
              <Typography variant="caption" color="text.secondary">
                Esta acción no se puede deshacer
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Está a punto de cancelar la cita del paciente <strong>{appointment.patient.name}</strong> para el día{" "}
              <strong>{dayjs(appointment.date).format('DD/MM/YYYY')}</strong> a las{" "}
              <strong>{dayjs(appointment.date).format('HH:mm')}</strong>.
            </Alert>

            <TextField
              label="Razón de la cancelación"
              placeholder="Ej: Paciente solicitó cancelación, Problema de agenda, etc."
              multiline
              rows={4}
              fullWidth
              required
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              helperText="Por favor indique el motivo de la cancelación"
              autoFocus
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseCancelDialog}
            variant="outlined"
            size="large"
          >
            Volver
          </Button>
          
          <Button
            onClick={handleConfirmCancellation}
            variant="contained"
            color="error"
            size="large"
            disabled={!cancellationReason.trim()}
            startIcon={<CancelIcon />}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de reagendamiento */}
      <RescheduleModal
        open={rescheduleDialogOpen}
        onClose={() => setRescheduleDialogOpen(false)}
        appointment={appointment}
        onSuccess={() => {
          setRescheduleDialogOpen(false);
          onSuccess();
        }}
        onError={onError}
      />
    </>
  );
}