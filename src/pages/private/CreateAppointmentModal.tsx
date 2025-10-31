import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { api } from "../../api/apiClient";

dayjs.locale("es");

interface CreateAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  professionals?: any[];
  patients: any[];
  selectedProfessional: number | '';
  selectedProf: any;
  selectedDay?: Dayjs;
  preselectedHour?: number | null;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function CreateAppointmentModal({
  open,
  onClose,
  professionals = [],
  patients,
  selectedProfessional,
  selectedProf,
  selectedDay,
  preselectedHour,
  onSuccess,
  onError,
}: CreateAppointmentModalProps) {
  const [patientType, setPatientType] = useState<'existing' | 'new'>('existing');
  const [modalProfessional, setModalProfessional] = useState<number | ''>('');
  const [selectedPatient, setSelectedPatient] = useState<number | ''>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    rut: '',
    birth_date: null as Dayjs | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    if (open) {
      if (selectedProfessional) {
        setModalProfessional(selectedProfessional);
      } else {
        setModalProfessional('');
      }

      if (selectedDay) {
        setSelectedDate(selectedDay);
      } else {
        setSelectedDate(dayjs());
      }

      if (preselectedHour !== null && preselectedHour !== undefined) {
        const timeString = `${preselectedHour.toString().padStart(2, '0')}:00`;
        setSelectedTime(timeString);
      } else {
        setSelectedTime('');
      }

      setPatientType('existing');
      setSelectedPatient('');
      setSelectedSpecialty('');
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        rut: '',
        birth_date: null,
      });
      setError('');
    }
  }, [open, selectedDay, preselectedHour, selectedProfessional]);

 useEffect(() => {
    if (selectedDate && selectedSpecialty && modalProfessional) {
      fetchAvailableTimes();
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, selectedSpecialty, modalProfessional]);

  const fetchAvailableTimes = async () => {
    setLoadingTimes(true);
    try {
      const response = await api.get('/available-slots', {
        params: {
          professional_id: modalProfessional,
          specialty_id: selectedSpecialty,
          date: selectedDate?.format('YYYY-MM-DD')
        }
      });
      setAvailableTimes(response.data.available_slots || []);
    } catch (err) {
      console.error("Error al cargar horarios:", err);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handlePatientTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'existing' | 'new' | null,
  ) => {
    if (newType !== null) {
      setPatientType(newType);
      setError('');
    }
  };

  const handleNewPatientChange = (field: string, value: any) => {
    setNewPatient(prev => ({ ...prev, [field]: value }));
  };

  const validateNewPatient = () => {
    if (!newPatient.name.trim()) {
      setError('El nombre del paciente es requerido');
      return false;
    }
    if (!newPatient.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email)) {
      setError('Email inválido');
      return false;
    }
    if (!newPatient.phone.trim()) {
      setError('El teléfono es requerido');
      return false;
    }
    if (!newPatient.rut.trim()) {
      setError('El RUT es requerido');
      return false;
    }
    if (!newPatient.birth_date) {
      setError('La fecha de nacimiento es requerida');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');

    if (!modalProfessional) {
      setError('Debe seleccionar un profesional');
      return;
    }

    if (!selectedSpecialty) {
      setError('Debe seleccionar una especialidad');
      return;
    }

    if (!selectedDate) {
      setError('Debe seleccionar una fecha');
      return;
    }

    if (!selectedTime) {
      setError('Debe seleccionar una hora');
      return;
    }

    if (patientType === 'existing') {
      if (!selectedPatient) {
        setError('Debe seleccionar un paciente');
        return;
      }
    } else {
      if (!validateNewPatient()) {
        return;
      }
    }

    setLoading(true);

    try {
      let patientData;

      if (patientType === 'new') {
        const patientResponse = await api.post('/patients', {
          name: newPatient.name,
          email: newPatient.email,
          phone: newPatient.phone,
          rut: newPatient.rut,
          birth_date: newPatient.birth_date?.format('YYYY-MM-DD'),
        });
        patientData = patientResponse.data;
      } else {
        const patient = patients.find(p => p.id === selectedPatient);
        patientData = patient;
      }

      const appointmentDateTime = dayjs(selectedDate)
        .hour(parseInt(selectedTime.split(':')[0]))
        .minute(parseInt(selectedTime.split(':')[1]))
        .format('YYYY-MM-DD HH:mm:ss');

      await api.post('/appointments', {
        patient_id: patientData.id,
        professional_id: modalProfessional,
        specialty_id: selectedSpecialty,
        date: appointmentDateTime,
        status: 'confirmed',
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Error al crear cita:", err);
      const errorMessage = err.response?.data?.error || 'Error al crear la cita';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPatientType('existing');
    setModalProfessional('');
    setSelectedPatient('');
    setSelectedSpecialty('');
    setSelectedDate(null);
    setSelectedTime('');
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      rut: '',
      birth_date: null,
    });
    setError('');
    onClose();
  };

  const currentSelectedProf = professionals.find(p => p.id === modalProfessional) || selectedProf;

   const timeSlots = availableTimes.length > 0 ? availableTimes : [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Nueva Cita
      </DialogTitle>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Stack spacing={3} sx={{ mt: 2 }}>
            {professionals.length > 0 && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>Profesional</InputLabel>
                  <Select
                    value={modalProfessional}
                    onChange={(e) => {
                      setModalProfessional(e.target.value as number);
                      setSelectedSpecialty('');
                    }}
                    label="Profesional"
                  >
                    <MenuItem value="">
                      <em>Seleccione un profesional</em>
                    </MenuItem>
                    {professionals.map((prof) => (
                      <MenuItem key={prof.id} value={prof.id}>
                        {prof.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Divider />
              </>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontWeight: 'bold' }}>
                Tipo de Paciente
              </Typography>
              <ToggleButtonGroup
                value={patientType}
                exclusive
                onChange={handlePatientTypeChange}
                fullWidth
                color="primary"
              >
                <ToggleButton value="existing">
                  <PersonIcon sx={{ mr: 1 }} />
                  Paciente Existente
                </ToggleButton>
                <ToggleButton value="new">
                  <PersonAddIcon sx={{ mr: 1 }} />
                  Nuevo Paciente
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Divider />

            {patientType === 'existing' && (
              <TextField
                select
                label="Paciente"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(Number(e.target.value))}
                fullWidth
                required
              >
                <MenuItem value="">
                  <em>Seleccione un paciente</em>
                </MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.email}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {patientType === 'new' && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Datos del Nuevo Paciente
                </Typography>
                
                <TextField
                  label="Nombre Completo"
                  value={newPatient.name}
                  onChange={(e) => handleNewPatientChange('name', e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => handleNewPatientChange('email', e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Teléfono"
                  value={newPatient.phone}
                  onChange={(e) => handleNewPatientChange('phone', e.target.value)}
                  fullWidth
                  required
                  placeholder="+56912345678"
                />

                <TextField
                  label="RUT"
                  value={newPatient.rut}
                  onChange={(e) => handleNewPatientChange('rut', e.target.value)}
                  fullWidth
                  required
                  placeholder="12345678-9"
                />

                <DatePicker
                  label="Fecha de Nacimiento"
                  value={newPatient.birth_date}
                  onChange={(date) => handleNewPatientChange('birth_date', date ? dayjs(date) : null)}
                  maxDate={dayjs()}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />

                <Divider />
              </Stack>
            )}

            <TextField
              select
              label="Especialidad"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(Number(e.target.value))}
              fullWidth
              required
              disabled={!modalProfessional}
              helperText={!modalProfessional ? "Seleccione primero un profesional" : ""}
            >
              <MenuItem value="">
                <em>Seleccione una especialidad</em>
              </MenuItem>
              {currentSelectedProf?.specialties && Array.isArray(currentSelectedProf.specialties) ? (
                currentSelectedProf.specialties.map((specialty: any) => (
                  <MenuItem key={specialty.id} value={specialty.id}>
                    {specialty.name} - {specialty.duration} min - ${specialty.price.toLocaleString('es-CL')}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <em>Este profesional no tiene especialidades asignadas</em>
                </MenuItem>
              )}
            </TextField>

            <DatePicker
              label="Fecha de la Cita"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date ? dayjs(date) : null)}
              minDate={dayjs()}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />

            <TextField
              select
              label="Hora"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              fullWidth
              required
              disabled={!selectedSpecialty || !selectedDate || loadingTimes}
              helperText={
                loadingTimes ? "Cargando horarios disponibles..." :
                !selectedSpecialty ? "Seleccione primero una especialidad" :
                !selectedDate ? "Seleccione primero una fecha" :
                timeSlots.length === 0 ? "No hay horarios disponibles para esta fecha" :
                `${timeSlots.length} horarios disponibles`
              }
            >
              {loadingTimes ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Cargando...
                </MenuItem>
              ) : timeSlots.length === 0 ? (
                <MenuItem disabled>
                  <em>No hay horarios disponibles</em>
                </MenuItem>
              ) : (
                timeSlots.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))
              )}
            </TextField>

            {selectedDate && selectedTime && selectedSpecialty && modalProfessional && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Resumen:</strong> Cita con {currentSelectedProf?.name} para el{' '}
                  {selectedDate.format('dddd, D [de] MMMM [de] YYYY')} a las {selectedTime}
                </Typography>
              </Alert>
            )}

            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !modalProfessional}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creando...' : 'Crear Cita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}