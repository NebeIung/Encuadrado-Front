import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  Chip,
  Stack,
  IconButton,
  Button,
  Divider,
  Alert,
  Snackbar,
  Popover,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import CreateAppointmentModal from "./CreateAppointmentModal";
import AppointmentDetailsModal from "./AppointmentDetailsModal";

const SPECIALTY_COLORS: Record<number, string> = {
  1: '#1976d2',
  2: '#2e7d32',
  3: '#ed6c02',
  4: '#9c27b0',
  5: '#d32f2f',
};

interface DailyViewProps {
  professionals: any[];
  patients: any[];
  selectedProfessional: number | '';
  setSelectedProfessional: (id: number) => void;
  appointments: any[];
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
  onAppointmentsUpdate: () => void;
  selectedProf: any;
  isAdmin: boolean;
  onBackToMonth: () => void;
}

export default function DailyView({
  professionals,
  patients,
  selectedProfessional,
  setSelectedProfessional,
  appointments,
  currentDate,
  setCurrentDate,
  onAppointmentsUpdate,
  selectedProf,
  isAdmin,
  onBackToMonth,
}: DailyViewProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);

  // Inicializar especialidades seleccionadas
  React.useEffect(() => {
    if (selectedProf?.specialties) {
      setSelectedSpecialties(selectedProf.specialties.map((s: any) => s.id));
    }
  }, [selectedProf]);

  const generateDayHours = () => {
    const hours = [];
    for (let i = 8; i <= 20; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => 
      selectedSpecialties.includes(apt.specialty.id)
    );
  };

  const getAppointmentsForHour = (hour: number) => {
    return getFilteredAppointments().filter(apt => {
      const aptHour = dayjs(apt.date).hour();
      return aptHour === hour;
    });
  };

  const isPastAppointment = (appointment: any): boolean => {
    return dayjs(appointment.date).isBefore(dayjs(), 'minute');
  };

  const handlePrevDay = () => {
    setCurrentDate(currentDate.subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setCurrentDate(currentDate.add(1, 'day'));
  };

  const handleHourClick = (hour: number) => {
    const selectedDateTime = currentDate.hour(hour).minute(0).second(0);
    
    if (selectedDateTime.isBefore(dayjs())) {
      setSnackbar({ 
        open: true, 
        message: 'No se pueden crear citas en horas pasadas', 
        severity: 'error' 
      });
      return;
    }

    setSelectedHour(hour);
    setAddDialogOpen(true);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setDetailsDialogOpen(true);
  };

  const handleRemoveSpecialty = (specialtyId: number) => {
    setSelectedSpecialties(prev => prev.filter(id => id !== specialtyId));
  };

  const handleToggleSpecialty = (specialtyId: number) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialtyId)
        ? prev.filter(id => id !== specialtyId)
        : [...prev, specialtyId]
    );
    setFilterMenuAnchor(null);
  };

  const handleSelectAllSpecialties = () => {
    if (selectedProf?.specialties) {
      setSelectedSpecialties(selectedProf.specialties.map((s: any) => s.id));
    }
    setFilterMenuAnchor(null);
  };

  const availableSpecialties = selectedProf?.specialties || [];
  const hiddenSpecialties = availableSpecialties.filter((s: any) => 
    !selectedSpecialties.includes(s.id)
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={onBackToMonth}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {isAdmin ? 'Agenda de Profesionales' : 'Mi Agenda'}
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {isAdmin && (
            <FormControl sx={{ minWidth: 250 }}>
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
          )}
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedHour(null);
              setAddDialogOpen(true);
            }}
            disabled={!selectedProfessional}
          >
            Nueva Cita
          </Button>
        </Stack>
      </Box>

      {/* Filtros de especialidades */}
      {selectedProf && availableSpecialties.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 1 }}>
              Especialidades:
            </Typography>
            
            {/* Especialidades activas */}
            {availableSpecialties
              .filter((spec: any) => selectedSpecialties.includes(spec.id))
              .map((spec: any) => (
                <Chip
                  key={spec.id}
                  label={spec.name}
                  onDelete={() => handleRemoveSpecialty(spec.id)}
                  deleteIcon={<CloseIcon />}
                  sx={{
                    bgcolor: SPECIALTY_COLORS[spec.id] || '#666',
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'white',
                      '&:hover': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  }}
                />
              ))}

            {/* Botón para agregar especialidades ocultas */}
            {hiddenSpecialties.length > 0 && (
              <IconButton
                size="small"
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          {/* Popover para agregar especialidades */}
          <Popover
            open={Boolean(filterMenuAnchor)}
            anchorEl={filterMenuAnchor}
            onClose={() => setFilterMenuAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 2, minWidth: 250 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Agregar especialidades:
              </Typography>
              {hiddenSpecialties.map((spec: any) => (
                <Box
                  key={spec.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleToggleSpecialty(spec.id)}
                >
                  <Checkbox
                    checked={selectedSpecialties.includes(spec.id)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: SPECIALTY_COLORS[spec.id] || '#666',
                      mr: 1,
                    }}
                  />
                  <ListItemText 
                    primary={spec.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </Box>
              ))}
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleSelectAllSpecialties}
                sx={{ mt: 1 }}
              >
                Seleccionar todas
              </Button>
            </Box>
          </Popover>
        </Box>
      )}

      {/* Navegación de día */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePrevDay}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
          {currentDate.format('dddd, D [de] MMMM [de] YYYY')}
        </Typography>
        <IconButton onClick={handleNextDay}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Vista de horario */}
      <Card>
        <Box>
          {generateDayHours().map((hour) => {
            const hourAppointments = getAppointmentsForHour(hour);
            const hourTime = currentDate.hour(hour).minute(0);
            const isPastHour = hourTime.isBefore(dayjs());
            const isCurrentHour = dayjs().hour() === hour && currentDate.isSame(dayjs(), 'day');

            return (
              <Box
                key={hour}
                sx={{
                  display: 'flex',
                  borderBottom: '1px solid #e0e0e0',
                  minHeight: 60,
                  bgcolor: isCurrentHour ? '#e3f2fd' : 'transparent',
                  '&:hover': !isPastHour ? {
                    bgcolor: '#f5f5f5',
                  } : {},
                }}
              >
                {/* Columna de hora */}
                <Box
                  sx={{
                    width: 80,
                    p: 1,
                    borderRight: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    bgcolor: '#fafafa',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isPastHour ? 'text.disabled' : 'text.secondary',
                      fontWeight: isCurrentHour ? 'bold' : 'normal',
                    }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </Typography>
                </Box>

                {/* Columna de citas */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    cursor: hourAppointments.length === 0 && !isPastHour ? 'pointer' : 'default',
                    position: 'relative',
                  }}
                  onClick={() => {
                    if (hourAppointments.length === 0 && !isPastHour) {
                      handleHourClick(hour);
                    }
                  }}
                >
                  {hourAppointments.length === 0 ? (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.disabled',
                        fontSize: '0.8rem',
                      }}
                    >
                      {!isPastHour && 'Click para agendar'}
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {hourAppointments.map((apt) => {
                        const isPast = isPastAppointment(apt);
                        const minutes = dayjs(apt.date).minute();
                        
                        return (
                          <Card
                            key={apt.id}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: `2px solid ${
                                isPast ? '#9e9e9e' : 
                                apt.status === 'cancelled' ? '#bdbdbd' :
                                SPECIALTY_COLORS[apt.specialty.id] || '#666'
                              }`,
                              '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)',
                              },
                            }}
                            onClick={() => handleAppointmentClick(apt)}
                          >
                            <Box sx={{ p: 1.5 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                {/* Hora exacta */}
                                <Box
                                  sx={{
                                    minWidth: 60,
                                    textAlign: 'center',
                                    p: 0.5,
                                    bgcolor: isPast ? '#9e9e9e' : 
                                            apt.status === 'cancelled' ? '#bdbdbd' :
                                            SPECIALTY_COLORS[apt.specialty.id] || '#666',
                                    color: 'white',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {hour.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                                  </Typography>
                                </Box>

                                <Divider orientation="vertical" flexItem />

                                {/* Detalles */}
                                <Box sx={{ flex: 1 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                      {apt.patient.name}
                                    </Typography>
                                    <Chip
                                      label={
                                        apt.status === 'confirmed' ? 'Confirmada' :
                                        apt.status === 'cancelled' ? 'Cancelada' :
                                        apt.status === 'pending' ? 'Pendiente' : 
                                        apt.status
                                      }
                                      size="small"
                                      color={
                                        apt.status === 'confirmed' ? 'success' :
                                        apt.status === 'cancelled' ? 'error' : 
                                        'default'
                                      }
                                    />
                                    {isPast && (
                                      <Chip label="Pasada" size="small" color="default" />
                                    )}
                                  </Stack>
                                  <Stack direction="row" spacing={2}>
                                    <Typography variant="caption" color="text.secondary">
                                      📧 {apt.patient.email}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      📱 {apt.patient.phone}
                                    </Typography>
                                  </Stack>
                                </Box>

                                {/* Especialidad */}
                                <Chip
                                  label={apt.specialty.name}
                                  size="small"
                                  sx={{
                                    bgcolor: SPECIALTY_COLORS[apt.specialty.id] || '#666',
                                    color: 'white',
                                  }}
                                />
                              </Stack>
                            </Box>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* Modal de nueva cita */}
      <CreateAppointmentModal
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setSelectedHour(null);
        }}
        patients={patients}
        selectedProfessional={selectedProfessional}
        selectedProf={selectedProf}
        selectedDay={currentDate}
        preselectedHour={selectedHour}
        onSuccess={() => {
          setAddDialogOpen(false);
          setSelectedHour(null);
          onAppointmentsUpdate();
          setSnackbar({ open: true, message: 'Cita creada exitosamente', severity: 'success' });
        }}
        onError={(message) => {
          setSnackbar({ open: true, message, severity: 'error' });
        }}
      />

      {/* Modal de detalles de cita */}
      <AppointmentDetailsModal
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={() => {
          setDetailsDialogOpen(false);
          setSelectedAppointment(null);
          onAppointmentsUpdate();
          setSnackbar({ open: true, message: 'Operación exitosa', severity: 'success' });
        }}
        onError={(message) => {
          setSnackbar({ open: true, message, severity: 'error' });
        }}
      />

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