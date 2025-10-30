import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { api } from "../../api/apiClient";

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
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);

  useEffect(() => {
    if (open && appointment) {
      setSelectedDate(dayjs(appointment.date));
      setSelectedTime(dayjs(appointment.date).format('HH:mm'));
    }
  }, [open, appointment]);

  useEffect(() => {
    if (selectedDate && appointment) {
      fetchAvailableHours();
    }
  }, [selectedDate, appointment]);

  const fetchAvailableHours = async () => {
    try {
      setLoadingHours(true);
      const response = await api.get('/available-hours', {
        params: {
          date: selectedDate?.format('YYYY-MM-DD'),
          professionalId: appointment.professional.id,
          serviceId: appointment.specialty.id,
        }
      });
      setAvailableHours(response.data);
    } catch (error) {
      console.error('Error fetching available hours:', error);
      setAvailableHours([]);
    } finally {
      setLoadingHours(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        onError('Seleccione fecha y hora');
        return;
      }

      const newDateTime = `${selectedDate.format('YYYY-MM-DD')} ${selectedTime}:00`;

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
    setSelectedTime('');
    setAvailableHours([]);
    onClose();
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reagendar Cita</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info">
            Reagendando cita de <strong>{appointment.patient.name}</strong>
            <br />
            Especialidad: <strong>{appointment.specialty.name}</strong>
            <br />
            Fecha actual: <strong>{dayjs(appointment.date).format('DD/MM/YYYY HH:mm')}</strong>
          </Alert>

          <DatePicker
            label="Nueva Fecha"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            format="DD/MM/YYYY"
            minDate={dayjs()}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              },
            }}
          />

          <FormControl fullWidth required disabled={loadingHours}>
            <InputLabel>Nueva Hora</InputLabel>
            <Select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              label="Nueva Hora"
            >
              {availableHours.length === 0 && !loadingHours && (
                <MenuItem disabled>No hay horas disponibles</MenuItem>
              )}
              {loadingHours && (
                <MenuItem disabled>Cargando horas...</MenuItem>
              )}
              {availableHours.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedDate && selectedTime && (
            <Alert severity="success">
              Nueva fecha: <strong>{selectedDate.format('DD/MM/YYYY')} a las {selectedTime}</strong>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          Confirmar Reagendamiento
        </Button>
      </DialogActions>
    </Dialog>
  );
}