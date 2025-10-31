import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { api } from "../../api/apiClient";
import {
  AccessTime as AccessTimeIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function RescheduleModal({
  open,
  onClose,
  appointment,
  onSuccess,
  onError,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && selectedDate) {
      fetchAvailableHours();
    }
  }, [selectedDate, open]);

  const fetchAvailableHours = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);
    setSelectedHour(null);

    try {
      const response = await api.get('/available-hours', {
        params: {
          date: selectedDate.format('YYYY-MM-DD'),
          professionalId: appointment.professional.id,
          serviceId: appointment.specialty.id,
          excludeAppointmentId: appointment.id,
        },
      });

      setAvailableHours(response.data);

      if (response.data.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
      }
    } catch (error) {
      console.error('Error fetching available hours:', error);
      setError('Error al cargar horarios disponibles');
      setAvailableHours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedHour) {
      onError('Debe seleccionar fecha y hora');
      return;
    }

    const newDateTime = selectedDate
      .set('hour', parseInt(selectedHour.split(':')[0]))
      .set('minute', parseInt(selectedHour.split(':')[1]))
      .toISOString();

    try {
      await api.put(`/appointments/${appointment.id}`, {
        date: newDateTime,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      onError(error.response?.data?.error || 'Error al reagendar la cita');
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedHour(null);
    setAvailableHours([]);
    setError(null);
    onClose();
  };

  const shouldDisableDate = (date: Dayjs) => {
    return date.isBefore(dayjs(), 'day');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <AccessTimeIcon 
            sx={{ 
              color: appointment?.specialty?.color || 'primary.main',
              fontSize: 32 
            }} 
          />
          <Box>
            <Typography variant="h6">Reagendar Cita</Typography>
            <Typography variant="caption" color="text.secondary">
              Cita ID: #{appointment?.id}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Información de la cita actual */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1,
              borderLeft: `4px solid ${appointment?.specialty?.color || '#666'}`,
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Información de la cita:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Paciente:
                </Typography>
                <Typography variant="body2">{appointment?.patient?.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Profesional:
                </Typography>
                <Typography variant="body2">{appointment?.professional?.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Especialidad:
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CircleIcon sx={{ fontSize: 12, color: appointment?.specialty?.color }} />
                  <Typography variant="body2">{appointment?.specialty?.name}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Fecha actual:
                </Typography>
                <Typography variant="body2">
                  {dayjs(appointment?.date).format('DD/MM/YYYY HH:mm')}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Selector de fecha */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              1. Selecciona una nueva fecha:
            </Typography>
            <DatePicker
              label="Nueva fecha"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              shouldDisableDate={shouldDisableDate}
              minDate={dayjs()}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: "Seleccione una fecha disponible",
                },
              }}
            />
          </Box>

          {/* Selector de hora */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              2. Selecciona una nueva hora:
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="warning">{error}</Alert>
            ) : !selectedDate ? (
              <Alert severity="info">Primero selecciona una fecha</Alert>
            ) : availableHours.length === 0 ? (
              <Alert severity="warning">No hay horarios disponibles para esta fecha</Alert>
            ) : (
              <Grid container spacing={1}>
                {availableHours.map((hour) => (
                  <Grid item xs={4} sm={3} key={hour}>
                    <Button
                      variant={selectedHour === hour ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => setSelectedHour(hour)}
                      sx={{
                        bgcolor: selectedHour === hour ? appointment?.specialty?.color : 'transparent',
                        borderColor: appointment?.specialty?.color,
                        color: selectedHour === hour ? 'white' : appointment?.specialty?.color,
                        '&:hover': {
                          bgcolor: selectedHour === hour
                            ? appointment?.specialty?.color
                            : `${appointment?.specialty?.color}20`,
                          borderColor: appointment?.specialty?.color,
                        },
                      }}
                    >
                      {hour}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Resumen del cambio */}
          {selectedDate && selectedHour && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Nueva fecha y hora:</strong>{' '}
                {selectedDate.format('dddd, D [de] MMMM [de] YYYY')} a las {selectedHour}
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedHour}
          sx={{
            bgcolor: appointment?.specialty?.color || 'primary.main',
            '&:hover': {
              bgcolor: appointment?.specialty?.color || 'primary.dark',
              filter: 'brightness(0.9)',
            },
          }}
        >
          Confirmar Reagendamiento
        </Button>
      </DialogActions>
    </Dialog>
  );
}