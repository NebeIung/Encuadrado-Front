import { useState, useEffect } from "react";
import { Grid, Typography, Button, Chip, Paper } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";

export default function DateSelect() {
  const navigate = useNavigate();
  const selectedService = JSON.parse(localStorage.getItem("selectedService") || "{}");
  const selectedProfessional = JSON.parse(localStorage.getItem("selectedProfessional") || "{}");

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [hours, setHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  // Traer horas desde backend
  useEffect(() => {
    if (!selectedDate) return;
    fetch(`http://localhost:5000/available-hours?date=${selectedDate.format("YYYY-MM-DD")}&professionalId=${selectedProfessional.id}&serviceId=${selectedService.id}`)
      .then((res) => res.json())
      .then((data) => setHours(data))
  }, [selectedDate]);

  const handleContinue = () => {
    localStorage.setItem("selectedDateTime", JSON.stringify({
      date: selectedDate?.format("YYYY-MM-DD"),
      hour: selectedHour,
    }));
    navigate("/public/confirm");
  };

  return (
    <Grid container spacing={4}>
      
      {/* Calendario */}
      <Grid item xs={12} md={6}>
        <Typography variant="h5" mb={2}>Seleccionar Fecha</Typography>
        <Paper sx={{ p: 2 }}>
          <DateCalendar
            value={selectedDate}
            onChange={(newVal) => {
              setSelectedDate(newVal);
              setSelectedHour(null);
            }}
          />
        </Paper>
      </Grid>

      {/* Lista de horas */}
      <Grid item xs={12} md={6}>
        <Typography variant="h5" mb={2}>
          Horarios disponibles
        </Typography>

        {hours.length === 0 && (
          <Typography>No hay horarios disponibles este día</Typography>
        )}

        <Grid container spacing={1}>
          {hours.map((hour) => (
            <Grid item key={hour}>
              <Chip
                label={hour}
                onClick={() => setSelectedHour(hour)}
                color={selectedHour === hour ? "primary" : "default"}
                sx={{ fontSize: "16px", p: 1 }}
              />
            </Grid>
          ))}
        </Grid>

        <Button
          variant="contained"
          disabled={!selectedHour}
          sx={{ mt: 3 }}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </Grid>

    </Grid>
  );
}