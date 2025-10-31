import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { api } from "../../api/apiClient";

const DAYS = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
];

interface Professional {
  id: number;
  name: string;
  schedule: any;
}

export default function ProfessionalSchedule() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | ''>('');
  const [schedule, setSchedule] = useState<any>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (selectedProfessional) {
      const prof = professionals.find(p => p.id === selectedProfessional);
      if (prof) {
        setSchedule(prof.schedule || getDefaultSchedule());
      }
    }
  }, [selectedProfessional, professionals]);

  const getDefaultSchedule = () => ({
    mon: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    tue: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    wed: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    thu: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    fri: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    sat: { enabled: false, start: "", end: "", lunch_start: "", lunch_end: "" },
    sun: { enabled: false, start: "", end: "", lunch_start: "", lunch_end: "" },
  });

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      setProfessionals(response.data);
      if (response.data.length > 0) {
        setSelectedProfessional(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleDayToggle = (day: string, enabled: boolean) => {
    if (!enabled) {
      setSchedule((prev: any) => ({
        ...prev,
        [day]: {
          enabled: false,
          start: "",
          end: "",
          lunch_start: "",
          lunch_end: "",
        },
      }));
    } else {
      setSchedule((prev: any) => ({
        ...prev,
        [day]: {
          enabled: true,
          start: "09:00",
          end: "18:00",
          lunch_start: "13:00",
          lunch_end: "14:00",
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/professionals/${selectedProfessional}/schedule`, {
        schedule,
      });

      setSnackbar({
        open: true,
        message: 'Horario actualizado exitosamente',
        severity: 'success',
      });

      fetchProfessionals();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error al actualizar el horario',
        severity: 'error',
      });
    }
  };

  const selectedProf = professionals.find(p => p.id === selectedProfessional);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Gestión de Horarios
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Profesional</InputLabel>
            <Select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value as number)}
              label="Profesional"
            >
              {professionals.map((prof) => (
                <MenuItem key={prof.id} value={prof.id}>
                  {prof.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedProf && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Configurar horarios de atención para {selectedProf.name}
            </Typography>

            <Stack spacing={3}>
              {DAYS.map((day) => {
                const daySchedule = schedule[day.key] || {};
                const isEnabled = daySchedule.enabled !== false;

                return (
                  <Box key={day.key}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isEnabled}
                          onChange={(e) => handleDayToggle(day.key, e.target.checked)}
                        />
                      }
                      label={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{day.label}</Typography>}
                    />

                    {isEnabled && (
                      <Grid container spacing={2} sx={{ mt: 1, pl: 4 }}>
                        <Grid xs={12} sm={6} md={3}>
                          <TextField
                            label="Hora inicio"
                            type="time"
                            fullWidth
                            value={daySchedule.start || ''}
                            onChange={(e) => handleScheduleChange(day.key, 'start', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid xs={12} sm={6} md={3}>
                          <TextField
                            label="Hora fin"
                            type="time"
                            fullWidth
                            value={daySchedule.end || ''}
                            onChange={(e) => handleScheduleChange(day.key, 'end', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid xs={12} sm={6} md={3}>
                          <TextField
                            label="Almuerzo inicio"
                            type="time"
                            fullWidth
                            value={daySchedule.lunch_start || ''}
                            onChange={(e) => handleScheduleChange(day.key, 'lunch_start', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            helperText="Opcional"
                          />
                        </Grid>
                        <Grid xs={12} sm={6} md={3}>
                          <TextField
                            label="Almuerzo fin"
                            type="time"
                            fullWidth
                            value={daySchedule.lunch_end || ''}
                            onChange={(e) => handleScheduleChange(day.key, 'lunch_end', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            helperText="Opcional"
                          />
                        </Grid>
                      </Grid>
                    )}

                    <Divider sx={{ mt: 2 }} />
                  </Box>
                );
              })}
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                size="large"
              >
                Guardar Horarios
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}