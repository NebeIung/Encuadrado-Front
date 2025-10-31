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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  InputAdornment,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { api } from "../../api/apiClient";

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const EMAIL_DOMAIN = "@cuad.cl";
const SUPER_ADMIN_EMAIL = "admin@cuad.cl";

interface Professional {
  id: number;
  name: string;
  email: string;
  role: string;
  specialties: Array<{ 
    id: number; 
    name: string;
    color?: string;
    has_terms?: boolean;
    is_active?: boolean;
    terms_and_conditions?: string;
  }>;
  schedule: any;
  has_pending_terms?: boolean;
  pending_terms_count?: number;
}

interface Specialty {
  id: number;
  name: string;
  color: string;
  description?: string;
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
  
  const [specialtyTerms, setSpecialtyTerms] = useState<{ [key: number]: string }>({});
  const [emailLocal, setEmailLocal] = useState('');
  
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

  // Determinar si el email actual es el super admin
  const isSuperAdmin = formData.email === SUPER_ADMIN_EMAIL;
  const canHaveSpecialties = formData.role !== 'admin' || !isSuperAdmin;

  useEffect(() => {
    fetchProfessionals();
    fetchSpecialties();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/professionals?include_terms=true');
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
    monday: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    friday: { enabled: true, start: "09:00", end: "18:00", lunch_start: "13:00", lunch_end: "14:00" },
    saturday: { enabled: false, start: "", end: "", lunch_start: "", lunch_end: "" },
    sunday: { enabled: false, start: "", end: "", lunch_start: "", lunch_end: "" },
  });

  const handleOpenDialog = (professional?: Professional) => {
    if (professional) {
      setEditingProfessional(professional);
      
      const localPart = professional.email.split('@')[0];
      setEmailLocal(localPart);
      
      setFormData({
        name: professional.name,
        email: professional.email,
        password: '',
        role: professional.role as any,
        specialty_ids: professional.specialties.map(s => s.id),
      });
      
      const termsMap: { [key: number]: string } = {};
      professional.specialties.forEach(spec => {
        if (spec.terms_and_conditions) {
          termsMap[spec.id] = spec.terms_and_conditions;
        }
      });
      setSpecialtyTerms(termsMap);
    } else {
      setEditingProfessional(null);
      setEmailLocal('');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'member',
        specialty_ids: [],
      });
      setSpecialtyTerms({});
    }
    setDialogOpen(true);
  };

  const handleEmailLocalChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    setEmailLocal(sanitized);
    
    const fullEmail = sanitized + EMAIL_DOMAIN;
    
    // Si el nuevo email es el super admin y tiene rol admin, limpiar especialidades
    if (fullEmail === SUPER_ADMIN_EMAIL && formData.role === 'admin') {
      setFormData({ 
        ...formData, 
        email: fullEmail,
        specialty_ids: []
      });
    } else {
      setFormData({ ...formData, email: fullEmail });
    }
  };

  const handleRoleChange = (newRole: 'member' | 'limited' | 'admin') => {
    // Si cambia a admin y es el super admin, limpiar especialidades
    if (newRole === 'admin' && formData.email === SUPER_ADMIN_EMAIL) {
      setFormData({ 
        ...formData, 
        role: newRole,
        specialty_ids: []
      });
    } else {
      setFormData({ 
        ...formData, 
        role: newRole
      });
    }
  };

  const handleOpenScheduleDialog = (professional: Professional) => {
    setScheduleProfessional(professional);
    
    if (professional.specialties.length > 0) {
      const firstSpecialtyId = professional.specialties[0].id;
      setSelectedSpecialtyForSchedule(firstSpecialtyId);
      
      const scheduleForSpecialty = professional.schedule?.[firstSpecialtyId.toString()] || getDefaultSchedule();
      setSpecialtySchedule(scheduleForSpecialty);
    }
    
    setScheduleDialogOpen(true);
  };

  const handleSpecialtyForScheduleChange = (event: SelectChangeEvent<number>) => {
    const specialtyId = event.target.value as number;
    setSelectedSpecialtyForSchedule(specialtyId);
    
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

      const fullSchedule = { ...scheduleProfessional.schedule };
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

  const isEmailDuplicated = () => {
    return professionals.some(
      prof => prof.email === formData.email && prof.id !== editingProfessional?.id
    );
  };

  const handleSave = async () => {
    try {
      if (!emailLocal.trim()) {
        setSnackbar({
          open: true,
          message: 'El email no puede estar vacío',
          severity: 'error',
        });
        return;
      }

      if (!formData.name.trim()) {
        setSnackbar({
          open: true,
          message: 'El nombre no puede estar vacío',
          severity: 'error',
        });
        return;
      }

      // Verificar si el email ya existe
      if (isEmailDuplicated()) {
        const existingProf = professionals.find(
          prof => prof.email === formData.email && prof.id !== editingProfessional?.id
        );
        
        setSnackbar({
          open: true,
          message: `El email ${formData.email} ya está registrado con el profesional "${existingProf?.name}"`,
          severity: 'error',
        });
        return;
      }

      if (editingProfessional) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.put(`/professionals/${editingProfessional.id}`, updateData);

        // Solo actualizar especialidades si puede tenerlas
        if (canHaveSpecialties && formData.specialty_ids.length > 0) {
          const specialtiesData = formData.specialty_ids.map(id => ({
            specialty_id: id,
            terms_and_conditions: specialtyTerms[id] || ''
          }));

          await api.put(`/professionals/${editingProfessional.id}/specialties`, {
            specialties: specialtiesData,
          });
        }

        setSnackbar({
          open: true,
          message: 'Profesional actualizado exitosamente',
          severity: 'success',
        });
      } else {
        const response = await api.post('/professionals', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        // Solo asignar especialidades si puede tenerlas
        if (canHaveSpecialties && formData.specialty_ids.length > 0) {
          const specialtiesData = formData.specialty_ids.map(id => ({
            specialty_id: id,
            terms_and_conditions: specialtyTerms[id] || ''
          }));

          await api.put(`/professionals/${response.data.id}/specialties`, {
            specialties: specialtiesData,
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
      setEmailLocal('');
      setSpecialtyTerms({});
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
            {professionals.map((prof) => {
              const isProfSuperAdmin = prof.email === SUPER_ADMIN_EMAIL;
              
              return (
                <TableRow key={prof.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>{prof.name}</Typography>
                      {prof.has_pending_terms && (
                        <Tooltip title={`${prof.pending_terms_count} especialidad(es) sin términos`}>
                          <Badge badgeContent={prof.pending_terms_count} color="warning">
                            <WarningIcon color="warning" fontSize="small" />
                          </Badge>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
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
                      {isProfSuperAdmin && prof.role === 'admin' ? (
                        <Chip 
                          label="Super Admin - Sin especialidades" 
                          size="small" 
                          variant="outlined"
                          sx={{
                            borderColor: 'black',
                            color: 'black',
                          }}
                        />
                      ) : prof.specialties.length === 0 ? (
                        <Chip 
                          label="Sin asignar" 
                          size="small" 
                          variant="outlined"
                          sx={{
                            borderColor: 'black',
                            color: 'black',
                          }}
                        />
                      ) : (
                        prof.specialties.map((spec) => (
                          <Tooltip 
                            key={spec.id} 
                            title={
                              spec.has_terms 
                                ? spec.is_active ? "✓ Activa con términos" : "✓ Con términos (Inactiva)"
                                : "⚠ Sin términos - No visible públicamente"
                            }
                          >
                            <Chip 
                              label={spec.name} 
                              size="small"
                              sx={{
                                bgcolor: spec.color,
                                color: 'white',
                                opacity: spec.is_active ? 1 : 0.5,
                              }}
                              icon={
                                spec.has_terms 
                                  ? <CheckCircleIcon sx={{ color: 'white !important' }} />
                                  : <WarningIcon sx={{ color: 'white !important' }} />
                              }
                            />
                          </Tooltip>
                        ))
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    {!isProfSuperAdmin && prof.specialties.length > 0 && (
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar profesional */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProfessional ? 'Editar Profesional' : 'Nuevo Profesional'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="Email"
              fullWidth
              required
              value={emailLocal}
              onChange={(e) => handleEmailLocalChange(e.target.value)}
              placeholder="nombre.apellido"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'primary.main',
                        bgcolor: 'action.hover',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      {EMAIL_DOMAIN}
                    </Typography>
                  </InputAdornment>
                ),
              }}
              helperText={`Email completo: ${emailLocal || '[usuario]'}${EMAIL_DOMAIN}`}
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
                onChange={(e) => handleRoleChange(e.target.value as any)}
                label="Rol"
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="member">Miembro</MenuItem>
                <MenuItem value="limited">Solo Lectura</MenuItem>
              </Select>
            </FormControl>

            {isSuperAdmin && formData.role === 'admin' && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>admin@cuad.cl</strong> es el super administrador del sistema y no puede tener especialidades asignadas.
                </Typography>
              </Alert>
            )}

            {canHaveSpecialties && (
              <>
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
                          return spec ? (
                            <Chip 
                              key={id} 
                              label={spec.name} 
                              size="small"
                              sx={{
                                bgcolor: spec.color,
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                  >
                    {specialties.map((spec) => (
                      <MenuItem key={spec.id} value={spec.id}>
                        <Checkbox checked={formData.specialty_ids.indexOf(spec.id) > -1} />
                        <CircleIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: spec.color,
                            mr: 1,
                            ml: 1,
                          }} 
                        />
                        <ListItemText 
                          primary={spec.name}
                          secondary={spec.description}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formData.specialty_ids.length > 0 && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <DescriptionIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Términos y Condiciones por Especialidad
                      </Typography>
                    </Stack>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Puedes definir los términos ahora o dejarlos vacíos. Si están vacíos, el profesional 
                        deberá completarlos antes de que la especialidad esté disponible públicamente.
                      </Typography>
                    </Alert>

                    {formData.specialty_ids.map((specId) => {
                      const specialty = specialties.find(s => s.id === specId);
                      if (!specialty) return null;

                      return (
                        <Accordion key={specId} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                              <Chip
                                icon={<CircleIcon sx={{ color: 'white !important' }} />}
                                label={specialty.name}
                                size="small"
                                sx={{ bgcolor: specialty.color, color: "white", fontWeight: 'bold' }}
                              />
                              {specialtyTerms[specId] ? (
                                <Chip 
                                  icon={<CheckCircleIcon />}
                                  label="Con términos" 
                                  size="small" 
                                  color="success" 
                                />
                              ) : (
                                <Chip 
                                  icon={<WarningIcon />}
                                  label="Sin términos" 
                                  size="small" 
                                  color="warning" 
                                />
                              )}
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextField
                              label={`Términos y Condiciones para ${specialty.name}`}
                              multiline
                              rows={6}
                              fullWidth
                              value={specialtyTerms[specId] || ""}
                              onChange={(e) => setSpecialtyTerms({
                                ...specialtyTerms,
                                [specId]: e.target.value
                              })}
                              placeholder={`Ejemplo de términos para ${specialty.name}:\n\n1. El paciente debe llegar 10 minutos antes.\n2. Cancelaciones con 24h de anticipación.\n3. Presentar documento de identidad.\n4. ...\n\n(Deja vacío si prefieres que el profesional lo complete)`}
                              helperText={
                                specialtyTerms[specId] 
                                  ? `${specialtyTerms[specId].length} caracteres - ✓ Especialidad estará activa` 
                                  : "Vacío - El profesional deberá completar los términos"
                              }
                            />
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!emailLocal.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de horarios */}
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
            <FormControl fullWidth>
              <InputLabel>Especialidad</InputLabel>
              <Select
                value={selectedSpecialtyForSchedule}
                onChange={handleSpecialtyForScheduleChange}
                label="Especialidad"
              >
                {scheduleProfessional?.specialties.map((spec) => (
                  <MenuItem key={spec.id} value={spec.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircleIcon sx={{ fontSize: 16, color: spec.color }} />
                      <Typography>{spec.name}</Typography>
                    </Stack>
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