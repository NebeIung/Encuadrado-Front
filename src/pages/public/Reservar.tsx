import { useState, useEffect } from "react";
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  useTheme
} from "@mui/material";
import { 
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Specialty {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  professionals_count: number;
}

export default function Reservar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/services");
      if (!response.ok) throw new Error("Error al cargar especialidades");
      
      const data = await response.json();
      setSpecialties(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (specialty: Specialty) => {
    localStorage.setItem("selectedService", JSON.stringify(specialty));
    navigate("/public/select-professional");
  };

  const handleBack = () => {
    navigate("/public");
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? specialties.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === specialties.length - 1 ? 0 : prev + 1));
  };

  const getVisibleCards = () => {
    if (specialties.length === 0) return [];
    
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      let index = currentIndex + i;
      if (index < 0) index = specialties.length + index;
      if (index >= specialties.length) index = index - specialties.length;
      visible.push({ specialty: specialties[index], position: i });
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

  if (specialties.length === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay especialidades disponibles en este momento.
        </Alert>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" onClick={handleBack}>
            Volver
          </Button>
        </Box>
      </Box>
    );
  }

  const visibleCards = getVisibleCards();

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
            Reservar una Hora
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selecciona la especialidad que necesitas
          </Typography>
        </Box>
      </Box>

      <Box sx={{ 
        position: "relative", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: 450,
        py: 4
      }}>
        {/* Botón izquierdo */}
        <IconButton
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: 0,
            zIndex: 2,
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": { bgcolor: "action.hover" }
          }}
        >
          <ArrowBackIcon />
        </IconButton>

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
          {visibleCards.map(({ specialty, position }) => {
            const isCurrent = position === 0;
            const scale = isCurrent ? 1 : 0.8;
            const opacity = isCurrent ? 1 : 0.5;
            const zIndex = isCurrent ? 10 : 1;

            return (
              <Card 
                key={specialty.id}
                sx={{ 
                  width: isCurrent ? 400 : 300,
                  height: isCurrent ? 400 : 320,
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
                  onClick={() => isCurrent && handleSelect(specialty)}
                  sx={{ height: "100%", p: 2 }}
                  disabled={!isCurrent}
                >
                  <CardContent>
                    <Typography 
                      variant={isCurrent ? "h4" : "h5"} 
                      gutterBottom 
                      color="primary"
                      sx={{ fontWeight: isCurrent ? "bold" : "normal" }}
                    >
                      {specialty.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      mb={2}
                      sx={{ minHeight: isCurrent ? 80 : 60 }}
                    >
                      {specialty.description || "Atención especializada profesional"}
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant={isCurrent ? "body1" : "body2"}>
                          <strong>Duración:</strong> {specialty.duration} minutos
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant={isCurrent ? "body1" : "body2"}>
                          <strong>Precio:</strong> ${specialty.price.toLocaleString('es-CL')} CLP
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant={isCurrent ? "body1" : "body2"}>
                          <strong>{specialty.professionals_count}</strong> {specialty.professionals_count === 1 ? "profesional" : "profesionales"}
                        </Typography>
                      </Box>
                    </Box>

                    {isCurrent && (
                      <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Chip 
                          label="Reservar ahora" 
                          color="primary" 
                          size="medium"
                          sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }}
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
        <IconButton
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: 0,
            zIndex: 2,
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": { bgcolor: "action.hover" }
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      {/* Indicadores */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}>
        {specialties.map((_, index) => (
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
    </Box>
  );
}