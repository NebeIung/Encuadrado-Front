import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale/es";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { api } from "../../api/apiClient";

interface TermsData {
  content: string;
  professional_name: string;
  specialty_name: string;
  has_terms: boolean;
  updated_at?: string;
}

export default function PatientInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { specialty, professional, date, time } = location.state || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rut: "",
  });

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para términos y condiciones
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Cargar términos y condiciones al abrir el dialog
  useEffect(() => {
    if (dialogOpen && !termsData) {
      fetchTermsAndConditions();
    }
  }, [dialogOpen]);

  const fetchTermsAndConditions = async () => {
    setLoadingTerms(true);
    try {
      const response = await api.get(`/public/terms/${professional.id}/${specialty.id}`);
      setTermsData(response.data);
    } catch (err: any) {
      console.error("Error al cargar términos y condiciones:", err);
      setTermsData({
        content: "Error al cargar los términos y condiciones. Por favor, intente nuevamente.",
        professional_name: professional.name,
        specialty_name: specialty.name,
        has_terms: false
      });
    } finally {
      setLoadingTerms(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const filteredValue = value.replace(/[^0-9+]/g, "");
    setFormData((prev) => ({ ...prev, phone: filteredValue }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleDateChange = (newDate: Date | null) => {
    setBirthDate(newDate);
    if (errors.birth_date) {
      setErrors((prev) => ({ ...prev, birth_date: "" }));
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setShowTermsError(false);
    setHasScrolledToBottom(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setDialogOpen(false);
    setShowTermsError(false);
  };

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (dialogOpen && contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      if (scrollHeight <= clientHeight) {
        setHasScrolledToBottom(true);
      }
    }
  }, [dialogOpen, termsData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Teléfono inválido";
    }

    if (!formData.rut.trim()) {
      newErrors.rut = "El RUT es requerido";
    }

    if (!birthDate) {
      newErrors.birth_date = "La fecha de nacimiento es requerida";
    } else if (birthDate > new Date()) {
      newErrors.birth_date = "La fecha no puede ser futura";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      setShowTermsError(true);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        professional_id: professional.id,
        specialty_id: specialty.id,
        date: date,
        time: time,
        patient: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          rut: formData.rut,
          birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : "",
        },
      };

      const response = await api.post("/public/appointment", payload);

      navigate("/centro-de-salud-cuad/public/success", {
        state: {
          specialty,
          professional,
          date,
          time,
        },
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.error || 
        "Error al confirmar la cita. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!specialty || !professional || !date || !time) {
    navigate("/centro-de-salud-cuad/public/reservar");
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ maxWidth: 1800, mx: "auto", p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate("/public/select-date", {
                state: { specialty, professional },
              })
            }
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Volver
          </Button>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Información del Paciente
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            Completa tus datos para confirmar la reserva de tu cita
          </Alert>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {/* Formulario */}
          <Grid item xs={12} md={9}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
                Datos Personales
              </Typography>

              <Stack spacing={3} sx={{ flex: 1 }}>
                <TextField
                  label="Nombre Completo"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                />

                <TextField
                  label="Correo Electrónico"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                />

                <TextField
                  label="Teléfono"
                  fullWidth
                  required
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone || "Ejemplo: +56912345678"}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                />

                <TextField
                  label="RUT"
                  fullWidth
                  required
                  value={formData.rut}
                  onChange={(e) => handleChange("rut", e.target.value)}
                  error={!!errors.rut}
                  helperText={errors.rut || "Ejemplo: 12345678-9"}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <BadgeIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                />

                <DatePicker
                  label="Fecha de Nacimiento"
                  value={birthDate}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                  format="dd/MM/yyyy"
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.birth_date,
                      helperText: errors.birth_date,
                      InputProps: {
                        startAdornment: <CakeIcon sx={{ mr: 1, color: "action.active" }} />,
                      },
                    },
                  }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Resumen */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "success.50",
                border: "2px solid",
                borderColor: "success.main",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "success.main" }}>
                Resumen de tu Cita
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2} sx={{ flex: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Especialidad
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {specialty.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Profesional
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {professional.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Fecha
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Hora
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {time}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Duración
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {specialty.duration} minutos
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Términos y Condiciones */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      disabled
                      sx={{
                        color: showTermsError ? "error.main" : "action.disabled",
                      }}
                    />
                  }
                  label={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: showTermsError ? "error.main" : "text.primary",
                      }}
                    >
                      Acepto los{" "}
                      <Typography
                        component="span"
                        sx={{
                          color: "primary.main",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontWeight: "bold",
                          "&:hover": {
                            color: "primary.dark",
                          },
                        }}
                        onClick={handleOpenDialog}
                      >
                        Términos y Condiciones
                      </Typography>
                    </Typography>
                  }
                  sx={{ alignItems: "flex-start" }}
                />
                {showTermsError && (
                  <Typography variant="caption" color="error" sx={{ ml: 4, display: "block" }}>
                    Debes aceptar los términos y condiciones para continuar
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                onClick={handleConfirm}
                disabled={loading}
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
                {loading ? "CONFIRMANDO..." : "CONFIRMAR CITA"}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Dialog de Términos y Condiciones */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Términos y Condiciones
            <IconButton onClick={handleCloseDialog} edge="end">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent 
            ref={contentRef}
            onScroll={handleScroll}
            dividers
            sx={{ 
              maxHeight: "60vh",
              overflowY: "auto"
            }}
          >
            {loadingTerms ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : termsData ? (
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                  {termsData.professional_name} - {termsData.specialty_name}
                </Typography>

                <Typography 
                  variant="body1" 
                  paragraph 
                  sx={{ whiteSpace: "pre-line", textAlign: "justify" }}
                >
                  {termsData.content}
                </Typography>

                {termsData.updated_at && (
                  <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic", color: "text.secondary" }}>
                    Última actualización: {format(new Date(termsData.updated_at), "dd/MM/yyyy HH:mm")}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Alert severity="info">
                No se pudieron cargar los términos y condiciones. Por favor, intente nuevamente.
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cerrar
            </Button>
            <Button
              variant="contained"
              onClick={handleAcceptTerms}
              disabled={!hasScrolledToBottom || loadingTerms}
              sx={{
                fontWeight: "bold",
              }}
            >
              Aceptar Términos
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}