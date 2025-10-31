import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  Alert,
  Avatar,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../api/apiClient";

const DAY_LABELS: Record<string, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface Professional {
  id: number;
  name: string;
  email: string;
  role: string;
  specialties: Array<{
    id: number;
    name: string;
    color: string;
    duration: number;
  }>;
  schedule: Record<string, Record<string, any>>;
}

export default function ProfessionalSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { specialty } = location.state || {};

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!specialty) {
      navigate('/public/reservar');
      return;
    }
    
    fetchProfessionals();
  }, [specialty]);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/public/professionals', {
        params: {
          specialty_id: specialty.id
        }
      });
      
      setProfessionals(response.data);
      
      if (response.data.length === 0) {
        setError('No hay profesionales disponibles para esta especialidad');
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setError('Error al cargar los profesionales. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getScheduleForSpecialty = (professional: Professional) => {
    if (!professional.schedule || Object.keys(professional.schedule).length === 0) {
      return null;
    }
    
    // Verificar si el schedule tiene la estructura esperada (días de la semana)
    const hasWeekDays = Object.keys(professional.schedule).some(key => 
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 
       'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key)
    );
    
    if (!hasWeekDays) {
      return null;
    }
    
    return professional.schedule;
  };

  const formatSchedule = (schedule: Record<string, any> | null) => {
    if (!schedule) {
      return [];
    }

    // Mapeo para manejar nombres completos y abreviados
    const dayMapping: Record<string, string> = {
      'monday': 'mon',
      'tuesday': 'tue',
      'wednesday': 'wed',
      'thursday': 'thu',
      'friday': 'fri',
      'saturday': 'sat',
      'sunday': 'sun',
      'mon': 'mon',
      'tue': 'tue',
      'wed': 'wed',
      'thu': 'thu',
      'fri': 'fri',
      'sat': 'sat',
      'sun': 'sun',
    };

    const enabledDays = Object.entries(schedule)
      .filter(([day, daySchedule]) => {
        // Normalizar el nombre del día
        const normalizedDay = dayMapping[day.toLowerCase()];
        const isValidDay = normalizedDay && DAY_ORDER.includes(normalizedDay);
        const hasSchedule = daySchedule && typeof daySchedule === 'object';
        const isEnabled = daySchedule?.enabled === true;
        
        return isValidDay && hasSchedule && isEnabled;
      })
      .map(([day, daySchedule]) => {
        // Normalizar el nombre del día para el orden
        const normalizedDay = dayMapping[day.toLowerCase()];
        
        return {
          day: normalizedDay,
          label: DAY_LABELS[normalizedDay],
          start: daySchedule.start,
          end: daySchedule.end,
          lunch_start: daySchedule.lunch_start,
          lunch_end: daySchedule.lunch_end,
        };
      })
      .sort((a, b) => {
        return DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
      });

    return enabledDays;
  };

  const formatTimeRange = (dayInfo: any) => {
    const hasLunch = dayInfo.lunch_start && dayInfo.lunch_end;
    
    if (hasLunch) {
      return `${dayInfo.start} - ${dayInfo.lunch_start} y ${dayInfo.lunch_end} - ${dayInfo.end}`;
    }
    
    return `${dayInfo.start} - ${dayInfo.end}`;
  };

  const handleSelectProfessional = (professional: Professional) => {
    const scheduleForSpecialty = getScheduleForSpecialty(professional);

    if (!scheduleForSpecialty) {
      setError(`El profesional ${professional.name} no tiene horarios configurados para ${specialty.name}`);
      return;
    }

    navigate('/centro-de-salud-cuad/public/select-date', {
      state: {
        specialty,
        professional: {
          id: professional.id,
          name: professional.name,
          schedule: scheduleForSpecialty,
        },
      },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < professionals.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const getVisibleCards = () => {
    if (professionals.length === 0) return [];

    if (professionals.length <= 2) {
      return professionals.map((prof, idx) => ({
        professional: prof,
        position: idx - currentIndex
      }));
    }

    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < professionals.length) {
        visible.push({ professional: professionals[index], position: i });
      }
    }
    return visible;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6">Cargando profesionales...</Typography>
        </Stack>
      </Container>
    );
  }

  if (error || professionals.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/public/reservar')}
          sx={{ mb: 3 }}
        >
          Volver
        </Button>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          Selecciona un Profesional
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Especialidad seleccionada: <strong>{specialty?.name}</strong>
        </Alert>

        <Alert severity="warning">
          {error || 'No hay profesionales disponibles para esta especialidad en este momento.'}
        </Alert>
      </Container>
    );
  }

  const visibleCards = getVisibleCards();
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < professionals.length - 1;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/public/reservar')}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="h4" mb={0.5} sx={{ fontWeight: 'bold' }}>
            Selecciona un Profesional
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Para el servicio: <strong>{specialty?.name}</strong> ({specialty?.duration} minutos)
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 600,
        py: 4
      }}>
        {/* Botón izquierdo */}
        {professionals.length > 1 && (
          <IconButton
            onClick={handlePrev}
            disabled={!canGoPrev}
            sx={{
              position: "absolute",
              left: 0,
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "action.hover" },
              "&:disabled": { opacity: 0.3 }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        {/* Contenedor del carrusel */}
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "100%",
          maxWidth: 1400,
          px: 8
        }}>
          {visibleCards.map(({ professional, position }) => {
            const isCurrent = position === 0;
            const scale = isCurrent ? 1 : 0.85;
            const opacity = isCurrent ? 1 : 0.5;
            const zIndex = isCurrent ? 10 : 1;
            const scheduleForSpecialty = getScheduleForSpecialty(professional);
            const formattedSchedule = formatSchedule(scheduleForSpecialty);
            const hasValidSchedule = scheduleForSpecialty && formattedSchedule.length > 0;

            return (
              <Card
                key={professional.id}
                sx={{
                  width: isCurrent ? 500 : 400,
                  height: 560,
                  transition: "all 0.4s ease-in-out",
                  transform: `scale(${scale})`,
                  opacity,
                  zIndex,
                  border: isCurrent ? "3px solid primary.main" : "none",
                  boxShadow: isCurrent ? 6 : 2,
                  cursor: isCurrent && hasValidSchedule ? "pointer" : "default",
                  pointerEvents: isCurrent ? "auto" : "none",
                }}
                onClick={() => isCurrent && hasValidSchedule && handleSelectProfessional(professional)}
              >
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2.5 }}>
                  {/* Avatar y Nombre */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: isCurrent ? 56 : 48,
                        height: isCurrent ? 56 : 48,
                        bgcolor: 'primary.main',
                        fontSize: isCurrent ? "1.25rem" : "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      {getInitials(professional.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant={isCurrent ? "h6" : "subtitle1"}
                        sx={{ 
                          fontWeight: "bold",
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {professional.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {professional.email}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  {/* Horarios de atención */}
                  {isCurrent && (
                    <Box sx={{ flex: 1, mb: 1.5, overflow: 'hidden' }}>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 18 }} color="action" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                          Horarios para {specialty.name}
                        </Typography>
                      </Stack>

                      {hasValidSchedule ? (
                        <Box
                          sx={{
                            maxHeight: 240,
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': {
                              width: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: 'rgba(0,0,0,.2)',
                              borderRadius: '2px',
                            },
                          }}
                        >
                          {formattedSchedule.map((dayInfo: any) => (
                            <Box
                              key={dayInfo.day}
                              sx={{
                                mb: 0.75,
                                p: 1,
                                bgcolor: 'action.hover',
                                borderRadius: 0.5,
                                borderLeft: "3px solid primary.main",
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 'bold',
                                    color: 'text.primary',
                                    fontSize: '0.813rem',
                                    minWidth: '70px',
                                  }}
                                >
                                  {dayInfo.label}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: '0.813rem',
                                    textAlign: 'right',
                                    flex: 1,
                                  }}
                                >
                                  {formatTimeRange(dayInfo)}
                                </Typography>
                              </Stack>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Alert severity="warning" sx={{ py: 0.5, fontSize: '0.813rem' }}>
                          Sin horario configurado
                        </Alert>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  {/* Especialidades del profesional */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Todas las especialidades:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {professional.specialties.map((spec) => (
                        <Chip
                          key={spec.id}
                          label={spec.name}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            bgcolor: spec.name === specialty.name ? 'primary.main' : 'default',
                            color: spec.name === specialty.name ? 'white' : 'inherit',
                            fontWeight: spec.name === specialty.name ? 'bold' : 'normal',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Botón de selección */}
                  {isCurrent && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      endIcon={<ArrowForwardIcon />}
                      disabled={!hasValidSchedule}
                      sx={{
                        mt: 'auto',
                        '&:disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled',
                        },
                      }}
                    >
                      {hasValidSchedule ? 'Seleccionar' : 'Sin horarios'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Botón derecho */}
        {professionals.length > 1 && (
          <IconButton
            onClick={handleNext}
            disabled={!canGoNext}
            sx={{
              position: "absolute",
              right: 0,
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "action.hover" },
              "&:disabled": { opacity: 0.3 }
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        )}
      </Box>

      {/* Indicadores */}
      {professionals.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}>
          {professionals.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: currentIndex === index ? 32 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: currentIndex === index ? 'primary.main' : 'action.disabled',
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}