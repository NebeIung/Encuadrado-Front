import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Paper,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../api/apiClient";

dayjs.locale("es");

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function DateSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { specialty, professional } = location.state || {};

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDays, setLoadingDays] = useState(true);
  const [availableDates, setAvailableDates] = useState<Dayjs[]>([]);

  useEffect(() => {
    if (!specialty || !professional) {
      navigate("/public/reservar");
      return;
    }

    loadAvailableDays();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    } else {
      setAvailableSlots([]);
      setSelectedTime(null);
    }
  }, [selectedDate]);

  const loadAvailableDays = async () => {
    if (!professional || !specialty) return;
    
    setLoadingDays(true);
    try {
      const response = await api.get("/available-days", {
        params: {
          professional_id: professional.id,
          specialty_id: specialty.id,
        },
      });

      const daysData = response.data.available_days || response.data;
      
      const dates = daysData.map((day: any) => {
        const dateStr = typeof day === 'string' ? day : day.date;
        return dayjs(dateStr);
      });
      
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error loading available days:", error);
      setAvailableDates([]);
    } finally {
      setLoadingDays(false);
    }
  };

  const fetchAvailableSlots = async (date: Dayjs) => {
    setLoadingSlots(true);
    setSelectedTime(null);
    setAvailableSlots([]);
    
    try {
      const response = await api.get("/available-slots", {
        params: {
          professional_id: professional.id,
          specialty_id: specialty.id,
          date: date.format("YYYY-MM-DD"),
        },
      });

      const slotsData = response.data.available_slots || response.data;

      const slots: TimeSlot[] = slotsData.map((time: string) => ({
        time,
        available: true,
      }));

      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      const today = dayjs().startOf('day');
      if (date.isSame(today, 'day')) {
        return;
      }

      const hasSlots = availableDates.some(d => d.isSame(date, 'day'));
      if (hasSlots) {
        setSelectedDate(date);
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    navigate("/centro-de-salud-cuad/public/patient-info", {
      state: {
        specialty,
        professional,
        date: selectedDate.format("YYYY-MM-DD"),
        time: selectedTime,
      },
    });
  };

  const shouldDisableDate = (date: Dayjs) => {
    const today = dayjs().startOf('day');
    
    if (date.isSame(today, 'day')) return true;
    if (date.isBefore(today, 'day')) return true;
    if (loadingDays) return false;
    
    return !availableDates.some(d => d.isSame(date, 'day'));
  };

  if (!specialty || !professional) {
    return null;
  }

  const minDate = dayjs().add(1, 'day');
  const maxDate = dayjs().add(60, 'day');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/public/select-professional", { state: { specialty } })}
            sx={{ mb: 2 }}
          >
            Volver
          </Button>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Selecciona Fecha y Hora
          </Typography>

          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Box>
                <strong>Profesional:</strong> {professional.name}
              </Box>
              <Box>
                <strong>Especialidad:</strong> {specialty.name} ({specialty.duration} minutos)
              </Box>
            </Stack>
          </Alert>
        </Box>

        {/* Loading inicial de días */}
        {loadingDays && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                Cargando calendario...
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Layout Principal */}
        {!loadingDays && (
          <Grid container spacing={3}>
            {/* Calendario - Siempre visible */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CalendarIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    1. Selecciona una fecha
                  </Typography>
                </Stack>

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={handleDateChange}
                    minDate={minDate}
                    maxDate={maxDate}
                    shouldDisableDate={shouldDisableDate}
                    sx={{
                      width: "100%",
                      maxHeight: 400,
                      "& .MuiPickersDay-root": {
                        fontSize: "0.9rem",
                      },
                      "& .MuiPickersDay-root.Mui-selected": {
                        bgcolor: "primary.main",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Columna 2: Horarios */}
            {selectedDate && (
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <ScheduleIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      2. Selecciona una hora
                    </Typography>
                  </Stack>

                  {loadingSlots ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                      <Stack spacing={2} alignItems="center">
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                          Cargando horarios...
                        </Typography>
                      </Stack>
                    </Box>
                  ) : availableSlots.length === 0 ? (
                    <Alert severity="warning">
                      No hay horarios disponibles para esta fecha
                    </Alert>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 1.5,
                        maxHeight: 400,
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "rgba(0,0,0,.2)",
                          borderRadius: "3px",
                        },
                      }}
                    >
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "contained" : "outlined"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          sx={{
                            minHeight: 50,
                            fontSize: "1.1rem",
                            fontWeight: selectedTime === slot.time ? "bold" : "normal",
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                            },
                          }}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Columna 3: Resumen*/}
            {selectedDate && selectedTime && (
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: "100%",
                    bgcolor: "success.50",
                    border: "2px solid",
                    borderColor: "success.main",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "success.main" }}>
                      Resumen de tu cita
                    </Typography>
                  </Stack>

                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Fecha
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {selectedDate.format('dddd, D [de] MMMM')}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Hora
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {selectedTime}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Duración
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {specialty.duration} minutos
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Profesional
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {professional.name}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleContinue}
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      bgcolor: "success.main",
                      "&:hover": {
                        bgcolor: "success.dark",
                      },
                    }}
                  >
                    CONTINUAR
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
}