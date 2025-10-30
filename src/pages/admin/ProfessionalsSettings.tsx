import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
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
  email: string;
  role: string;
  specialties: Array<{ id: number; name: string; }>;
  schedule: any;
}

interface Specialty {
  id: number;
  name: string;
  color: string;
}

export default function ProfessionalsSettings() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [scheduleProfessional, setScheduleProfessional] = useState<Professional | null>(null);
  const [selectedSpecialtyForSchedule, setSelectedSpecialtyForSchedule] = useState<number | ''>('');
  const [specialtySchedule, setSpecialtySchedule] = useState<any>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as 'member' | 'limited' | 'admin',
    specialty_ids: [] as number[],
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchProfessionals();
    fetchSpecialties();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      setProfessionals(response.data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/services');
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const getDefaultSchedule = () => ({
    mon: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    tue: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    wed: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    thu: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    fri: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    sat: { enabled: false, start: "", end: "", lunch_start: "", lunch_end: "" },
    sun: { enabled: false, start: "", end: "", lunch_start: "", lunch_end: "" },
  });

  const handleOpenDialog = (professional?: Professional) => {
    if (professional) {
      setEditingProfessional(professional);
      setFormData({
        name: professional.name,
        email: professional.email,
        password: '',
        role: professional.role as any,
        specialty_ids: professional.specialties.map(s => s.id),
      });
    } else {
      setEditingProfessional(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'member',
        specialty_ids: [],
      });
    }
    setDialogOpen(true);
  };

  const handleOpenScheduleDialog = (professional: Professional) => {
    setScheduleProfessional(professional);
    
    // Seleccionar la primera especialidad por defecto
    if (professional.specialties.length > 0) {
      const firstSpecialtyId = professional.specialties[0].id;
      setSelectedSpecialtyForSchedule(firstSpecialtyId);
      
      // Cargar horario de esa especialidad
      const scheduleForSpecialty = professional.schedule?.[firstSpecialtyId.toString()] || getDefaultSchedule();
      setSpecialtySchedule(scheduleForSpecialty);
    }
    
    setScheduleDialogOpen(true);
  };

  const handleSpecialtyForScheduleChange = (event: SelectChangeEvent<number>) => {
    const specialtyId = event.target.value as number;
    setSelectedSpecialtyForSchedule(specialtyId);
    
    // Cargar horario de la especialidad seleccionada
    const scheduleForSpecialty = scheduleProfessional?.schedule?.[specialtyId.toString()] || getDefaultSchedule();
    setSpecialtySchedule(scheduleForSpecialty);
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setSpecialtySchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleDayToggle = (day: string, enabled: boolean) => {
    if (!enabled) {
      setSpecialtySchedule((prev: any) => ({
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
      setSpecialtySchedule((prev: any) => ({
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

  const handleSaveSchedule = async () => {
    try {
      if (!scheduleProfessional || !selectedSpecialtyForSchedule) return;

      // Obtener el horario completo actual del profesional
      const fullSchedule = { ...scheduleProfessional.schedule };
      
      // Actualizar solo el horario de la especialidad seleccionada
      fullSchedule[selectedSpecialtyForSchedule.toString()] = specialtySchedule;

      await api.put(`/professionals/${scheduleProfessional.id}/schedule`, {
        schedule: fullSchedule,
      });

      setSnackbar({
        open: true,
        message: 'Horario actualizado exitosamente',
        severity: 'success',
      });

      setScheduleDialogOpen(false);
      fetchProfessionals();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error al actualizar el horario',
        severity: 'error',
      });
    }
  };

  const handleSave = async () => {
    try {
      if (editingProfessional) {
        // Actualizar profesional
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.put(`/professionals/${editingProfessional.id}`, updateData);

        // Actualizar especialidades solo si NO es admin
        if (formData.role !== 'admin') {
          await api.put(`/professionals/${editingProfessional.id}/specialties`, {
            specialty_ids: formData.specialty_ids,
          });
        }

        setSnackbar({
          open: true,
          message: 'Profesional actualizado exitosamente',
          severity: 'success',
        });
      } else {
        // Crear profesional
        const response = await api.post('/professionals', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        // Asignar especialidades solo si NO es admin
        if (formData.role !== 'admin' && formData.specialty_ids.length > 0) {
          await api.put(`/professionals/${response.data.id}/specialties`, {
            specialty_ids: formData.specialty_ids,
          });
        }

        setSnackbar({
          open: true,
          message: 'Profesional creado exitosamente',
          severity: 'success',
        });
      }

      fetchProfessionals();
      setDialogOpen(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error al guardar el profesional',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este profesional?')) return;

    try {
      await api.delete(`/professionals/${id}`);
      setSnackbar({
        open: true,
        message: 'Profesional eliminado exitosamente',
        severity: 'success',
      });
      fetchProfessionals();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error al eliminar el profesional',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Gestión de Profesionales
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Profesional
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Rol</strong></TableCell>
              <TableCell><strong>Especialidades</strong></TableCell>
              <TableCell align="center"><strong>Horarios</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {professionals.map((prof) => (
              <TableRow key={prof.id}>
                <TableCell>{prof.name}</TableCell>
                <TableCell>{prof.email}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      prof.role === 'admin' ? 'Administrador' :
                      prof.role === 'member' ? 'Miembro' : 'Solo Lectura'
                    }
                    color={
                      prof.role === 'admin' ? 'error' :
                      prof.role === 'member' ? 'primary' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {prof.role === 'admin' ? (
                      <Chip label="Sin especialidades" size="small" variant="outlined" />
                    ) : prof.specialties.length === 0 ? (
                      <Chip label="Sin asignar" size="small" color="warning" />
                    ) : (
                      prof.specialties.map((spec) => (
                        <Chip key={spec.id} label={spec.name} size="small" />
                      ))
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  {prof.role !== 'admin' && prof.specialties.length > 0 && (
                    <IconButton
                      onClick={() => handleOpenScheduleDialog(prof)}
                      color="primary"
                      size="small"
                    >
                      <ScheduleIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton onClick={() => handleOpenDialog(prof)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(prof.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar profesional */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProfessional ? 'Editar Profesional' : 'Nuevo Profesional'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <TextField
              label={editingProfessional ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              type="password"
              fullWidth
              required={!editingProfessional}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <FormControl fullWidth required>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  role: e.target.value as any,
                  // Limpiar especialidades si se selecciona admin
                  specialty_ids: e.target.value === 'admin' ? [] : formData.specialty_ids
                })}
                label="Rol"
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="member">Miembro</MenuItem>
                <MenuItem value="limited">Solo Lectura</MenuItem>
              </Select>
            </FormControl>

            {/* Solo mostrar especialidades si NO es admin */}
            {formData.role !== 'admin' && (
              <FormControl fullWidth>
                <InputLabel>Especialidades</InputLabel>
                <Select
                  multiple
                  value={formData.specialty_ids}
                  onChange={(e) => setFormData({ ...formData, specialty_ids: e.target.value as number[] })}
                  label="Especialidades"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const spec = specialties.find((s) => s.id === id);
                        return spec ? <Chip key={id} label={spec.name} size="small" /> : null;
                      })}
                    </Box>
                  )}
                >
                  {specialties.map((spec) => (
                    <MenuItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {formData.role === 'admin' && (
              <Alert severity="info">
                Los administradores no tienen especialidades asignadas
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para horarios por especialidad */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={() => setScheduleDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <ScheduleIcon />
            <Typography variant="h6">
              Horarios de {scheduleProfessional?.name}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Selector de especialidad */}
            <FormControl fullWidth>
              <InputLabel>Especialidad</InputLabel>
              <Select
                value={selectedSpecialtyForSchedule}
                onChange={handleSpecialtyForScheduleChange}
                label="Especialidad"
              >
                {scheduleProfessional?.specialties.map((spec) => (
                  <MenuItem key={spec.id} value={spec.id}>
                    {spec.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedSpecialtyForSchedule && (
              <>
                <Alert severity="info">
                  Configura los horarios de atención para <strong>{specialties.find(s => s.id === selectedSpecialtyForSchedule)?.name}</strong>
                </Alert>

                {DAYS.map((day) => {
                  const daySchedule = specialtySchedule[day.key] || {};
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
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              label="Hora inicio"
                              type="time"
                              fullWidth
                              value={daySchedule.start || ''}
                              onChange={(e) => handleScheduleChange(day.key, 'start', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              label="Hora fin"
                              type="time"
                              fullWidth
                              value={daySchedule.end || ''}
                              onChange={(e) => handleScheduleChange(day.key, 'end', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
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
                          <Grid item xs={12} sm={6} md={3}>
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
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveSchedule} variant="contained" startIcon={<SaveIcon />}>
            Guardar Horarios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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