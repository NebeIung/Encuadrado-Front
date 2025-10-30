import { useState, useEffect } from "react";
import { 
  Grid, 
  Typography, 
  Button, 
  Chip, 
  Paper, 
  Box, 
  CircularProgress,
  Alert 
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";

export default function DateSelect() {
  const navigate = useNavigate();
  const selectedService = JSON.parse(localStorage.getItem("selectedService") || "{}");
  const selectedProfessionalStr = localStorage.getItem("selectedProfessional");
  const selectedProfessional = selectedProfessionalStr ? JSON.parse(selectedProfessionalStr) : null;

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Traer horas disponibles desde backend
  useEffect(() => {
    if (!selectedDate) return;
    
    fetchAvailableHours();
  }, [selectedDate]);

  const fetchAvailableHours = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setError("");
    setSelectedHour(null);

    try {
      const dateStr = selectedDate.format("YYYY-MM-DD");
      
      // Si hay profesional seleccionado, usar su ID, sino buscar cualquiera
      const professionalId = selectedProfessional?.id || "";
      
      const url = `http://localhost:5000/api/available-hours?date=${dateStr}&professionalId=${professionalId}&serviceId=${selectedService.id}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error al cargar horarios disponibles");
      }
      
      const data = await response.json();
      
      // El backend ahora debería devolver un objeto con available y booked
      // Si devuelve un array simple, asumimos que son todas disponibles
      if (Array.isArray(data)) {
        setAvailableHours(data);
        setBookedHours([]);
      } else {
        setAvailableHours(data.available || []);
        setBookedHours(data.booked || []);
      }
    } catch (err: any) {
      setError(err.message);
      setAvailableHours([]);
      setBookedHours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedHour) return;

    // Combinar fecha y hora en formato ISO
    const [hours, minutes] = selectedHour.split(":");
    const dateTime = selectedDate
      .hour(parseInt(hours))
      .minute(parseInt(minutes))
      .second(0)
      .millisecond(0);

    localStorage.setItem("selectedDate", JSON.stringify(dateTime.toISOString()));
    navigate("/public/confirm");
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    setSelectedDate(newDate);
    setSelectedHour(null);
  };

  const handleBack = () => {
    navigate("/public/select-professional");
  };

  // Deshabilitar fechas pasadas
  const shouldDisableDate = (date: Dayjs) => {
    return date.isBefore(dayjs(), 'day');
  };

  const isHourBooked = (hour: string) => {
    return bookedHours.includes(hour);
  };

  // Generar todos los slots de horario posibles (de 8:00 a 20:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  return (
    <Box sx={{ px: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="h4" mb={0.5}>
            Selecciona Fecha y Hora
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Servicio: <strong>{selectedService.name}</strong>
          </Typography>
          {selectedProfessional && (
            <Typography variant="body2" color="text.secondary">
              Profesional: <strong>{selectedProfessional.name}</strong>
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
        {/* Calendario */}
        <Box sx={{ flex: { md: "0 0 400px" } }}>
          <Typography variant="h6" mb={2}>
            Selecciona una Fecha
          </Typography>
          <Paper sx={{ p: 2 }}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              shouldDisableDate={shouldDisableDate}
              minDate={dayjs()}
            />
          </Paper>
        </Box>

        {/* Lista de horas - A LA DERECHA */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" mb={2}>
            Horarios Disponibles
          </Typography>

          {selectedDate && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              Fecha seleccionada: <strong>{selectedDate.format("DD/MM/YYYY")}</strong>
            </Typography>
          )}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && availableHours.length === 0 && (
            <Alert severity="info">
              No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha.
            </Alert>
          )}

          {!loading && !error && availableHours.length > 0 && (
            <Paper 
              sx={{ 
                p: 2, 
                maxHeight: 450, 
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px"
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "primary.main",
                  borderRadius: "4px"
                }
              }}
            >
              <Grid container spacing={1.5}>
                {allTimeSlots.map((hour) => {
                  const isAvailable = availableHours.includes(hour);
                  const isBooked = isHourBooked(hour);
                  const isDisabled = !isAvailable || isBooked;

                  return (
                    <Grid item xs={6} sm={4} md={3} key={hour}>
                      <Chip
                        label={hour}
                        onClick={() => !isDisabled && setSelectedHour(hour)}
                        disabled={isDisabled}
                        color={selectedHour === hour ? "primary" : "default"}
                        sx={{ 
                          width: "100%",
                          fontSize: "14px",
                          py: 2,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.5 : 1,
                          backgroundColor: isBooked 
                            ? "error.light" 
                            : selectedHour === hour 
                              ? undefined 
                              : "background.paper",
                          "&:hover": {
                            backgroundColor: isDisabled 
                              ? undefined 
                              : selectedHour === hour 
                                ? undefined 
                                : "action.hover"
                          },
                          "&.Mui-disabled": {
                            opacity: 0.4,
                            backgroundColor: isBooked ? "error.light" : "grey.200"
                          }
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: "primary.main", borderRadius: 1 }} />
                  <Typography variant="caption">Seleccionado</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: "secondary.light", borderRadius: 1 }} />
                  <Typography variant="caption">No disponible</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              disabled={!selectedHour || loading}
              onClick={handleContinue}
              size="large"
              sx={{ fontWeight: "bold" }}
            >
              Continuar
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}