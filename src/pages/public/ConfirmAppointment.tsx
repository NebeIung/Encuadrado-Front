import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Divider,
  Stack,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
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
  const [openDatePicker, setOpenDatePicker] = useState(false);

  // Patient fields
  const [patientName, setPatientName] = useState<string>("");
  const [patientRut, setPatientRut] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("+56");
  const [patientBirthdate, setPatientBirthdate] = useState<Dayjs | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("selectedService");
    const p = localStorage.getItem("selectedProfessional");
    const d = localStorage.getItem("selectedDate");

    if (!s || !d) {
      navigate("/public/reservar");
      return;
    }

    setService(s ? JSON.parse(s) : null);
    setProfessional(p ? JSON.parse(p) : null);
    setDateISO(d ? JSON.parse(d) : d);

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.email) setPatientEmail(u.email);
        if (u?.name) setPatientName(u.name);
        if (u?.phone) setPatientPhone(u.phone);
        if (u?.birthdate) setPatientBirthdate(dayjs(u.birthdate));
      } catch {}
    }
  }, [navigate]);

  const validatePatient = () => {
    const nameRegex = /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)+$/;
    if (!patientName.trim() || !nameRegex.test(patientName.trim())) {
      setError("Nombre y apellido inválidos.");
      return false;
    }

    const rutRegex = /^\d{7,8}-[\dkK]$/;
    if (!patientRut.trim() || !rutRegex.test(patientRut.trim())) {
      setError("RUT inválido.");
      return false;
    }

    if (!patientBirthdate || !patientBirthdate.isValid()) {
      setError("Fecha de nacimiento inválida.");
      return false;
    }

    // Validar que no sea fecha futura
    if (patientBirthdate.isAfter(dayjs())) {
      setError("La fecha de nacimiento no puede ser futura.");
      return false;
    }

    // Validar edad mínima (por ejemplo, al menos 1 año)
    if (patientBirthdate.isAfter(dayjs().subtract(1, 'year'))) {
      setError("El paciente debe tener al menos 1 año de edad.");
      return false;
    }

    const emailRegex = /^\S+@\S+\.(com|cl|net|org|edu|gov|io|es|biz|info)$/i;
    if (!patientEmail.trim() || !emailRegex.test(patientEmail.trim())) {
      setError("Correo inválido.");
      return false;
    }

    const chilePhoneRegex = /^\+56[29]\d{8}$/;
    if (!patientPhone.trim() || !chilePhoneRegex.test(patientPhone.trim())) {
      setError("Teléfono inválido.");
      return false;
    }

    setError(null);
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (!value.startsWith("+56")) {
      value = "+56";
    }
    
    const digitsOnly = value.slice(3).replace(/\D/g, "");
    const limited = digitsOnly.slice(0, 9);
    
    setPatientPhone("+56" + limited);
  };

  const handleConfirm = async () => {
    setError(null);

    if (!service || !dateISO) {
      setError("Faltan datos de la reserva.");
      return;
    }

    if (!validatePatient()) return;

    setLoading(true);

    try {
      const payload: any = {
        specialty_id: service.id,
        scheduled_at: dayjs(dateISO).toISOString(),
        patient_name: patientName,
        patient_rut: patientRut,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        patient_birthdate: patientBirthdate?.format("YYYY-MM-DD"),
      };

      if (professional) payload.professional_id = professional.id;

      await api.post("/appointments", payload);

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
    <Box sx={{ px: 2, maxWidth: 1200, mx: "auto" }}>
      {/* Header con botón volver */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Confirmar Cita
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
        {/* Columna izquierda: Resumen */}
        <Box sx={{ flex: { md: "0 0 45%" } }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Resumen de la Cita
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Servicio
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                  {service?.name || "-"}
                </Typography>
                {(service?.duration || service?.price) && (
                  <Typography variant="body2" color="text.secondary">
                    {service.duration && `${service.duration} min`}
                    {service.duration && service.price && " • "}
                    {service.price && `$${service.price.toLocaleString('es-CL')}`}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Profesional
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                  {professional?.name || "Cualquiera disponible"}
                </Typography>
                {professional?.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Tel: {professional.phone}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fecha y Hora
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                  {dateISO ? dayjs(dateISO).format("DD/MM/YYYY") : "-"}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                  {dateISO ? dayjs(dateISO).format("HH:mm") : "-"} hrs
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Columna derecha: Formulario vertical */}
        <Box sx={{ flex: 1 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Datos del Paciente
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Nombre y Apellido"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  fullWidth
                  required
                  size="small"
                />
                
                <TextField
                  label="RUT"
                  value={patientRut}
                  onChange={(e) => setPatientRut(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  placeholder="12345678-9"
                />

                <DatePicker
                  label="Fecha de Nacimiento"
                  value={patientBirthdate}
                  onChange={(newValue) => setPatientBirthdate(newValue)}
                  open={openDatePicker}
                  onClose={() => setOpenDatePicker(false)}
                  maxDate={dayjs()}
                  minDate={dayjs().subtract(120, 'years')}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      required: true,
                      onClick: () => setOpenDatePicker(true),
                      onKeyDown: (e) => {
                        e.preventDefault();
                      },
                      inputProps: {
                        readOnly: true,
                        style: { cursor: 'pointer' }
                      },
                      sx: {
                        '& .MuiInputBase-root': {
                          cursor: 'pointer'
                        }
                      }
                    },
                  }}
                />
                
                <TextField
                  label="Teléfono"
                  value={patientPhone}
                  onChange={handlePhoneChange}
                  fullWidth
                  required
                  size="small"
                  placeholder="+56 9XXXXXXXX"
                />
                
                <TextField
                  label="Correo"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  placeholder="ejemplo@dominio.cl"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Botón confirmar centrado */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={loading}
          size="large"
          sx={{ fontWeight: "bold", minWidth: 200 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Cita"}
        </Button>
      </Box>
    </Box>
  );
}