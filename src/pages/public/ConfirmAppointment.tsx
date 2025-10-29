import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Card, CardContent, List, ListItem, Divider, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { api } from "../../api/apiClient";

interface Service {
  id: number;
  name: string;
  duration?: number;
  price?: number;
}

interface Professional {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export default function ConfirmAppointment() {
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("selectedService");
    const p = localStorage.getItem("selectedProfessional");
    const d = localStorage.getItem("selectedDate");

    if (!s || !d) {
      // Necesitamos al menos servicio y fecha -> volver a reservar
      navigate("/public/reservar");
      return;
    }

    setService(s ? JSON.parse(s) : null);
    setProfessional(p ? JSON.parse(p) : null);
    setDateISO(d ? JSON.parse(d) : d);
  }, [navigate]);

  const handleConfirm = async () => {
    setError(null);
    if (!service || !dateISO) {
      setError("Faltan datos de la reserva.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        specialty_id: service.id,
        scheduled_at: dayjs(dateISO).toISOString(),
      };

      if (professional) payload.professional_id = professional.id;

      // Si hay usuario logueado, enviar email (opcional según backend)
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed?.email) payload.patient_email = parsed.email;
      }

      await api.post("/appointments", payload);

      // limpiar selecciones opcionales
      localStorage.removeItem("selectedService");
      localStorage.removeItem("selectedProfessional");
      localStorage.removeItem("selectedDate");

      navigate("/public/success");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Error al confirmar la cita. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/public/select-date");

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Confirmar cita
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <List>
            <ListItem>
              <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" color="text.secondary">Servicio</Typography>
                <Typography variant="h6">{service?.name || "-"}</Typography>
                {service?.duration && <Typography variant="body2">Duración: {service.duration} min</Typography>}
                {service?.price && <Typography variant="body2">Precio: ${service.price}</Typography>}
              </Box>
            </ListItem>
            <Divider />
            <ListItem>
              <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" color="text.secondary">Profesional</Typography>
                <Typography variant="body1">{professional?.name || "Cualquiera disponible"}</Typography>
                {professional?.phone && <Typography variant="body2">Tel: {professional.phone}</Typography>}
              </Box>
            </ListItem>
            <Divider />
            <ListItem>
              <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" color="text.secondary">Fecha y hora</Typography>
                <Typography variant="body1">
                  {dateISO ? dayjs(dateISO).format("DD/MM/YYYY [a las] HH:mm") : "-"}
                </Typography>
              </Box>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={handleBack} disabled={loading}>
          Volver
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={loading}
          sx={{ fontWeight: "bold" }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Confirmar cita"}
        </Button>
      </Box>
    </Box>
  );
}