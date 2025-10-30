import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Autocomplete,
} from "@mui/material";
import { PersonAdd as PersonAddIcon, PersonSearch as PersonSearchIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { api } from "../../api/apiClient";

const SPECIALTY_COLORS: Record<number, string> = {
  1: '#1976d2',
  2: '#2e7d32',
  3: '#ed6c02',
  4: '#9c27b0',
  5: '#d32f2f',
};

interface CreateAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  patients: any[];
  selectedProfessional: number | '';
  selectedProf: any;
  selectedDay: Dayjs | null;
  preselectedHour?: number | null;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function CreateAppointmentModal({
  open,
  onClose,
  patients,
  selectedProfessional,
  selectedProf,
  selectedDay,
  preselectedHour,
  onSuccess,
  onError,
}: CreateAppointmentModalProps) {
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(selectedDay || dayjs());
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    patient_id: null as number | null,
    specialty_id: null as number | null,
    time: preselectedHour ? `${preselectedHour.toString().padStart(2, '0')}:00` : '',
  });

  const [newPatientData, setNewPatientData] = useState({
    name: '',
    rut: '',
    birth_date: null as Dayjs | null,
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (open) {
      setSelectedDate(selectedDay || dayjs());
      if (preselectedHour) {
        setNewAppointment(prev => ({
          ...prev,
          time: `${preselectedHour.toString().padStart(2, '0')}:00`
        }));
      }
    }
  }, [open, selectedDay, preselectedHour]);

  useEffect(() => {
    if (selectedDate && newAppointment.specialty_id && selectedProfessional) {
      fetchAvailableHours();
    }
  }, [selectedDate, newAppointment.specialty_id, selectedProfessional]);

  const fetchAvailableHours = async () => {
    try {
      setLoadingHours(true);
      const response = await api.get('/available-hours', {
        params: {
          date: selectedDate?.format('YYYY-MM-DD'),
          professionalId: selectedProfessional,
          serviceId: newAppointment.specialty_id,
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

  const validateRUT = (rut: string): boolean => {
    const cleanRUT = rut.replace(/\./g, '').replace(/-/g, '');
    if (cleanRUT.length < 2) return false;
    
    const body = cleanRUT.slice(0, -1);
    const dv = cleanRUT.slice(-1).toUpperCase();
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDV = 11 - (sum % 11);
    const dvCalculated = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
    
    return dv === dvCalculated;
  };

  const handleSubmit = async () => {
    try {
      let patientId = newAppointment.patient_id;

      if (!newAppointment.specialty_id || !newAppointment.time || !selectedDate) {
        onError('Complete todos los campos');
        return;
      }

      if (patientMode === 'new') {
        if (!newPatientData.name || !newPatientData.rut || !newPatientData.birth_date || 
            !newPatientData.phone || !newPatientData.email) {
          onError('Complete todos los datos del paciente');
          return;
        }

        if (!validateRUT(newPatientData.rut)) {
          onError('RUT inválido');
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newPatientData.email)) {
          onError('Email inválido');
          return;
        }

        try {
          const patientResponse = await api.post('/patients', {
            name: newPatientData.name,
            rut: newPatientData.rut,
            birth_date: newPatientData.birth_date.format('YYYY-MM-DD'),
            phone: newPatientData.phone,
            email: newPatientData.email,
          });

          patientId = patientResponse.data.id;
        } catch (error: any) {
          onError(error.response?.data?.error || 'Error al crear el paciente');
          return;
        }
      } else if (!patientId) {
        onError('Seleccione un paciente');
        return;
      }

      const appointmentDateTime = `${selectedDate.format('YYYY-MM-DD')} ${newAppointment.time}:00`;

      await api.post('/appointments', {
        patient_id: patientId,
        professional_id: selectedProfessional,
        specialty_id: newAppointment.specialty_id,
        date: appointmentDateTime,
        status: 'confirmed',
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      onError(error.response?.data?.error || 'Error al crear la cita');
    }
  };

  const handleClose = () => {
    setPatientMode('existing');
    setNewAppointment({
      patient_id: null,
      specialty_id: null,
      time: '',
    });
    setNewPatientData({
      name: '',
      rut: '',
      birth_date: null,
      phone: '',
      email: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva Cita</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Toggle para modo de paciente */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Seleccione el paciente
            </Typography>
            <ToggleButtonGroup
              value={patientMode}
              exclusive
              onChange={(_, newMode) => newMode && setPatientMode(newMode)}
              fullWidth
              color="primary"
            >
              <ToggleButton value="existing">
                <PersonSearchIcon sx={{ mr: 1 }} />
                Paciente Existente
              </ToggleButton>
              <ToggleButton value="new">
                <PersonAddIcon sx={{ mr: 1 }} />
                Nuevo Paciente
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Formulario para paciente existente */}
          {patientMode === 'existing' && (
            <Autocomplete
              options={patients}
              getOptionLabel={(option) => `${option.name} - RUT: ${option.rut}`}
              onChange={(_, value) => setNewAppointment({ ...newAppointment, patient_id: value?.id || null })}
              renderInput={(params) => (
                <TextField {...params} label="Paciente" required />
              )}
            />
          )}

          {/* Formulario para nuevo paciente */}
          {patientMode === 'new' && (
            <>
              <TextField
                label="Nombre Completo"
                value={newPatientData.name}
                onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                required
                fullWidth
                placeholder="Juan Pérez González"
              />

              <TextField
                label="RUT"
                value={newPatientData.rut}
                onChange={(e) => setNewPatientData({ ...newPatientData, rut: e.target.value })}
                required
                fullWidth
                placeholder="12345678-9"
                helperText="Formato: 12345678-9"
              />

              <DatePicker
                label="Fecha de Nacimiento"
                value={newPatientData.birth_date}
                onChange={(newValue) => setNewPatientData({ ...newPatientData, birth_date: newValue })}
                format="DD/MM/YYYY"
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />

              <TextField
                label="Teléfono"
                value={newPatientData.phone}
                onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                required
                fullWidth
                placeholder="+56912345678"
                helperText="Incluir código de país"
              />

              <TextField
                label="Correo Electrónico"
                type="email"
                value={newPatientData.email}
                onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                required
                fullWidth
                placeholder="ejemplo@correo.com"
              />
            </>
          )}

          {/* Especialidad */}
          <FormControl fullWidth required>
            <InputLabel>Especialidad</InputLabel>
            <Select
              value={newAppointment.specialty_id || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, specialty_id: e.target.value as number })}
              label="Especialidad"
            >
              {selectedProf?.specialties.map((spec: any) => (
                <MenuItem key={spec.id} value={spec.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: SPECIALTY_COLORS[spec.id] || '#666',
                      }}
                    />
                    <span>{spec.name} ({spec.duration} min)</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Fecha */}
          <DatePicker
            label="Fecha"
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

          {/* Hora */}
          <FormControl fullWidth required disabled={loadingHours || !newAppointment.specialty_id}>
            <InputLabel>Hora</InputLabel>
            <Select
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              label="Hora"
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          Crear Cita
        </Button>
      </DialogActions>
    </Dialog>
  );
}