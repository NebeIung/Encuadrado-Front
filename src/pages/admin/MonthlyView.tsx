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
  Badge,
  Snackbar,
  Alert,
  Popover,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import CreateAppointmentModal from "./CreateAppointmentModal";

const SPECIALTY_COLORS: Record<number, string> = {
  1: '#1976d2',
  2: '#2e7d32',
  3: '#ed6c02',
  4: '#9c27b0',
  5: '#d32f2f',
};

interface MonthlyViewProps {
  professionals: any[];
  patients: any[];
  selectedProfessional: number | '';
  setSelectedProfessional: (id: number) => void;
  appointments: any[];
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
  onDayClick: (day: Dayjs) => void;
  onAppointmentsUpdate: () => void;
  selectedProf: any;
  isAdmin: boolean;
}

export default function MonthlyView({
  professionals,
  patients,
  selectedProfessional,
  setSelectedProfessional,
  appointments,
  currentDate,
  setCurrentDate,
  onDayClick,
  onAppointmentsUpdate,
  selectedProf,
  isAdmin,
}: MonthlyViewProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);

  // Inicializar especialidades seleccionadas cuando cambia el profesional
  React.useEffect(() => {
    if (selectedProf?.specialties) {
      setSelectedSpecialties(selectedProf.specialties.map((s: any) => s.id));
    }
  }, [selectedProf]);

  const getDaysInMonth = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const daysInMonth = endOfMonth.date();
    const firstDayOfWeek = startOfMonth.day();
    
    const days = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => 
      selectedSpecialties.includes(apt.specialty.id)
    );
  };

  const getAppointmentsForDay = (day: number) => {
    const dateStr = currentDate.date(day).format('YYYY-MM-DD');
    return getFilteredAppointments().filter(apt => 
      dayjs(apt.date).format('YYYY-MM-DD') === dateStr
    ).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  };

  const getAppointmentCountForDay = (day: number) => {
    return getAppointmentsForDay(day).length;
  };

  const getFirstAppointmentForDay = (day: number) => {
    const dayAppointments = getAppointmentsForDay(day);
    return dayAppointments[0] || null;
  };

  const isPastAppointment = (appointment: any): boolean => {
    return dayjs(appointment.date).isBefore(dayjs(), 'minute');
  };

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isAdmin ? 'Agenda de Profesionales' : 'Mi Agenda'}
        </Typography>
        
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
            onClick={() => setAddDialogOpen(true)}
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

      {/* Navegación de mes */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
          {currentDate.format('MMMM YYYY')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Calendario */}
      <Card sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ p: 2 }}>
          {/* Días de la semana */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1, 
            mb: 1 
          }}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <Box 
                key={day} 
                sx={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  py: 1,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2">{day}</Typography>
              </Box>
            ))}
          </Box>

          {/* Días del mes */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1,
            minHeight: 'calc(100vh - 500px)'
          }}>
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <Box key={`empty-${index}`} sx={{ minHeight: 140 }} />;
              }

              const appointmentCount = getAppointmentCountForDay(day);
              const firstAppointment = getFirstAppointmentForDay(day);
              const isToday = currentDate.date(day).isSame(dayjs(), 'day');
              const isPastDay = currentDate.date(day).isBefore(dayjs(), 'day');

              return (
                <Box
                  key={day}
                  onClick={() => onDayClick(currentDate.date(day))}
                  sx={{
                    border: '2px solid',
                    borderColor: isToday ? 'primary.main' : '#e0e0e0',
                    borderRadius: 2,
                    p: 1.5,
                    minHeight: 140,
                    bgcolor: isToday ? '#e3f2fd' : isPastDay ? '#fafafa' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  {/* Encabezado del día */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1.5 
                  }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? 'primary.main' : isPastDay ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      {day}
                    </Typography>
                    {appointmentCount > 0 && (
                      <Badge 
                        badgeContent={appointmentCount} 
                        color="primary"
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            fontSize: '0.75rem',
                            minWidth: 20,
                            height: 20
                          } 
                        }}
                      />
                    )}
                  </Box>

                  {/* Primera cita */}
                  {firstAppointment && (
                    <Box
                      sx={{
                        bgcolor: isPastAppointment(firstAppointment)
                          ? '#9e9e9e'
                          : firstAppointment.status === 'cancelled'
                          ? '#bdbdbd'
                          : SPECIALTY_COLORS[firstAppointment.specialty.id] || '#666',
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        textDecoration: firstAppointment.status === 'cancelled' ? 'line-through' : 'none',
                        opacity: isPastAppointment(firstAppointment) ? 0.6 : 1,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {dayjs(firstAppointment.date).format('HH:mm')}
                        </Typography>
                      </Box>
                      <Typography 
                        sx={{ 
                          fontSize: '0.75rem', 
                          opacity: 0.95,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {firstAppointment.patient.name}
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontSize: '0.7rem', 
                          opacity: 0.8,
                          mt: 0.5
                        }}
                      >
                        {firstAppointment.specialty.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Indicador de citas adicionales */}
                  {appointmentCount > 1 && (
                    <Typography 
                      sx={{ 
                        fontSize: '0.7rem', 
                        color: 'primary.main',
                        fontWeight: 'bold',
                        mt: 1,
                        textAlign: 'center',
                        bgcolor: 'primary.light',
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        opacity: 0.8
                      }}
                    >
                      +{appointmentCount - 1} más
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* Modal de nueva cita */}
      <CreateAppointmentModal
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        patients={patients}
        selectedProfessional={selectedProfessional}
        selectedProf={selectedProf}
        selectedDay={null}
        onSuccess={() => {
          setAddDialogOpen(false);
          onAppointmentsUpdate();
          setSnackbar({ open: true, message: 'Cita creada exitosamente', severity: 'success' });
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