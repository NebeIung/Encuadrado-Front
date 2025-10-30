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
} from "@mui/material";
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MedicalServices as MedicalServicesIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { api } from "../../api/apiClient";
import RescheduleModal from "./RescheduleModal";

const SPECIALTY_COLORS: Record<number, string> = {
  1: '#1976d2',
  2: '#2e7d32',
  3: '#ed6c02',
  4: '#9c27b0',
  5: '#d32f2f',
};

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

  if (!appointment) return null;

  const isPast = dayjs(appointment.date).isBefore(dayjs(), 'minute');
  const isEditable = appointment.status !== 'cancelled' && !isPast;

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

  const handleOpenReschedule = () => {
    setRescheduleDialogOpen(true);
  };

  return (
    <>
      {/* Modal principal de detalles */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <MedicalServicesIcon 
              sx={{ 
                color: SPECIALTY_COLORS[appointment.specialty.id] || '#666',
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
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Estado */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={
                    appointment.status === 'confirmed' ? 'Confirmada' :
                    appointment.status === 'cancelled' ? 'Cancelada' :
                    appointment.status === 'pending' ? 'Pendiente' :
                    appointment.status === 'completed' ? 'Completada' :
                    appointment.status
                  }
                  color={
                    appointment.status === 'confirmed' ? 'success' :
                    appointment.status === 'cancelled' ? 'error' :
                    appointment.status === 'completed' ? 'info' :
                    'default'
                  }
                />
                {isPast && appointment.status !== 'cancelled' && (
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
                  bgcolor: SPECIALTY_COLORS[appointment.specialty.id] || '#666',
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
            {isPast && appointment.status !== 'cancelled' && (
              <Alert severity="info">
                Esta cita ya pasó. No es posible modificarla.
              </Alert>
            )}

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
            Cancelar
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