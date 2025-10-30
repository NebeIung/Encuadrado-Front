import { useState, useEffect } from "react";
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert,
  Box,
  Avatar,
  Chip,
  Button,
  IconButton,
  useTheme,
  Divider
} from "@mui/material";
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  MedicalServices as MedicalIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as TimeIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Professional {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialties: Array<{
    id: number;
    name: string;
  }>;
  schedule?: {
    [key: string]: { start: string; end: string } | null;
  };
}

const DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" }
];

export default function ProfessionalSelect() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const selectedService = JSON.parse(localStorage.getItem("selectedService") || "{}");

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/professionals");
      if (!response.ok) throw new Error("Error al cargar profesionales");
      
      const data = await response.json();
      
      // Filtrar profesionales con la especialidad seleccionada
      const filtered = data.filter((prof: Professional) => 
        prof.specialties.some(spec => spec.id === selectedService.id)
      );
      
      setProfessionals(filtered);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (professional: Professional) => {
    localStorage.setItem("selectedProfessional", JSON.stringify(professional));
    navigate("/public/select-date");
  };

  const handleBack = () => {
    navigate("/public/reservar");
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getVisibleCards = () => {
    if (professionals.length === 0) return [];
    
    // Si hay 1 o 2 profesionales, mostrar solo los disponibles sin repetir
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" onClick={handleBack}>
            Volver
          </Button>
        </Box>
      </Box>
    );
  }

  if (professionals.length === 0) {
    return (
      <Box>
        <Typography variant="h4" mb={1}>
          Selecciona un Profesional
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Para el servicio: <strong>{selectedService.name}</strong>
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay profesionales disponibles para esta especialidad en este momento.
        </Alert>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" onClick={handleBack} size="large">
            Volver
          </Button>
        </Box>
      </Box>
    );
  }

  const visibleCards = getVisibleCards();
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < professionals.length - 1;

  return (
    <Box>
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
            Selecciona un Profesional
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Para el servicio: <strong>{selectedService.name}</strong>
          </Typography>
        </Box>
      </Box>

      <Box sx={{ 
        position: "relative", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: 550,
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
          maxWidth: 1200,
          px: 8
        }}>
          {visibleCards.map(({ professional, position }) => {
            const isCurrent = position === 0;
            const scale = isCurrent ? 1 : 0.8;
            const opacity = isCurrent ? 1 : 0.5;
            const zIndex = isCurrent ? 10 : 1;

            return (
              <Card 
                key={professional.id}
                sx={{ 
                  width: isCurrent ? 450 : 350,
                  height: 520,
                  transition: "all 0.4s ease-in-out",
                  transform: `scale(${scale})`,
                  opacity,
                  zIndex,
                  border: isCurrent ? `3px solid ${theme.palette.primary.main}` : "none",
                  boxShadow: isCurrent ? 6 : 2,
                  cursor: isCurrent ? "pointer" : "default",
                  pointerEvents: isCurrent ? "auto" : "none"
                }}
              >
                <CardActionArea 
                  onClick={() => isCurrent && handleSelect(professional)}
                  sx={{ height: "100%", p: 3 }}
                  disabled={!isCurrent}
                >
                  <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    {/* Avatar y Nombre */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: isCurrent ? 70 : 55, 
                          height: isCurrent ? 70 : 55, 
                          bgcolor: "primary.main",
                          fontSize: isCurrent ? "1.3rem" : "1rem",
                          fontWeight: "bold",
                          mr: 2
                        }}
                      >
                        {getInitials(professional.name)}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant={isCurrent ? "h5" : "h6"} 
                          sx={{ fontWeight: "bold" }}
                        >
                          {professional.name}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Información de Contacto */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {professional.email}
                        </Typography>
                      </Box>

                      {professional.phone && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {professional.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Especialidades */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <MedicalIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Especialidades
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {professional.specialties.map((spec) => (
                          <Chip
                            key={spec.id}
                            label={spec.name}
                            size="small"
                            color="secondary"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Horarios - Solo en tarjeta activa */}
                    {isCurrent && (
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                            Horarios de atención
                          </Typography>
                        </Box>
                        <Box 
                          sx={{ 
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 0.5,
                            fontSize: "0.75rem"
                          }}
                        >
                          {DAYS.map(day => {
                            const schedule = professional.schedule?.[day.key];
                            return (
                              <Box 
                                key={day.key}
                                sx={{ 
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  py: 0.25,
                                  px: 0.5,
                                  bgcolor: schedule ? "action.hover" : "transparent",
                                  borderRadius: 0.5
                                }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: "medium", minWidth: 50 }}>
                                  {day.label.slice(0, 3)}:
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color={schedule ? "text.primary" : "text.disabled"}
                                  sx={{ fontSize: "0.7rem" }}
                                >
                                  {schedule 
                                    ? `${schedule.start}-${schedule.end}`
                                    : "—"
                                  }
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}

                    {isCurrent && (
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Chip 
                          label="Seleccionar profesional" 
                          color="primary" 
                          size="medium"
                          sx={{ fontWeight: "bold", fontSize: "0.9rem", py: 1.5 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
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
                bgcolor: currentIndex === index ? "primary.main" : "action.disabled",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}