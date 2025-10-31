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
} from "@mui/material";
import { 
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/apiClient";

interface Specialty {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  professionals_count: number;
}

export default function Reservar() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties?include_professionals=true');
      
      // Filtrar solo especialidades con profesionales disponibles (excluyendo admins)
      const availableSpecialties = response.data.filter(
        (spec: Specialty) => (spec.professionals_count || 0) > 0
      );
      
      setSpecialties(availableSpecialties);
      
      if (availableSpecialties.length === 0) {
        setError("No hay especialidades disponibles en este momento");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar especialidades");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (specialty: Specialty) => {
    navigate("/centro-de-salud-cuad/public/select-professional", {
      state: { 
        specialty: {
          id: specialty.id,
          name: specialty.name,
          description: specialty.description,
          duration: specialty.duration,
          price: specialty.price,
          color: specialty.color,
        }
      }
    });
  };

  const handleBack = () => {
    navigate("/centro-de-salud-cuad/public");
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? specialties.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === specialties.length - 1 ? 0 : prev + 1));
  };

  const getVisibleCards = () => {
    if (specialties.length === 0) return [];
    
    // Si solo hay 1 o 2 especialidades, mostrarlas sin wrap-around
    if (specialties.length <= 2) {
      return specialties.map((specialty, idx) => ({
        specialty,
        position: idx - currentIndex
      }));
    }
    
    // Para 3 o más, hacer wrap-around
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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6">Cargando especialidades...</Typography>
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
          <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
            Volver al inicio
          </Button>
        </Box>
      </Box>
    );
  }

  if (specialties.length === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay especialidades con profesionales disponibles en este momento.
        </Alert>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
            Volver al inicio
          </Button>
        </Box>
      </Box>
    );
  }

  const visibleCards = getVisibleCards();
  const canNavigate = specialties.length > 1;

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
          <Typography variant="h4" mb={0.5} sx={{ fontWeight: 'bold' }}>
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
        {/* Botón izquierdo - Solo mostrar si hay más de 1 especialidad */}
        {canNavigate && (
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
        )}

        {/* Contenedor del carrusel */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "100%",
          maxWidth: 1200,
          px: canNavigate ? 8 : 2
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
                  height: isCurrent ? 420 : 340,
                  transition: "all 0.4s ease-in-out",
                  transform: `scale(${scale})`,
                  opacity,
                  zIndex,
                  border: isCurrent ? `3px solid primary.main` : "none",
                  boxShadow: isCurrent ? 6 : 2,
                  cursor: isCurrent ? "pointer" : "default",
                  pointerEvents: isCurrent ? "auto" : "none"
                }}
              >
                <CardActionArea 
                  onClick={() => isCurrent && handleSelect(specialty)}
                  sx={{ height: "100%", display: "flex", flexDirection: "column" }}
                  disabled={!isCurrent}
                >
                  {/* Header simple sin color */}
                  <Box 
                    sx={{ 
                      width: "100%",
                      height: isCurrent ? 100 : 80,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.4s ease-in-out"
                    }}
                  >
                    <Typography 
                      variant={isCurrent ? "h4" : "h5"}
                      sx={{ 
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                        px: 2,
                      }}
                    >
                      {specialty.name}
                    </Typography>
                  </Box>

                  {/* Contenido */}
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      mb={2}
                      sx={{ 
                        minHeight: isCurrent ? 60 : 50,
                        flex: 1
                      }}
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
                          <strong>Precio:</strong> ${specialty.price.toLocaleString('es-CL')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant={isCurrent ? "body1" : "body2"}>
                          <strong>{specialty.professionals_count}</strong> {specialty.professionals_count === 1 ? "profesional disponible" : "profesionales disponibles"}
                        </Typography>
                      </Box>
                    </Box>

                    {isCurrent && (
                      <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Chip 
                          label="Seleccionar" 
                          icon={<ArrowForwardIcon />}
                          color="primary"
                          size="medium"
                          sx={{ 
                            fontWeight: "bold", 
                            fontSize: "1rem", 
                            py: 2.5,
                            px: 3,
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        {/* Botón derecho - Solo mostrar si hay más de 1 especialidad */}
        {canNavigate && (
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
        )}
      </Box>

      {/* Indicadores */}
      {canNavigate && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}>
          {specialties.map((specialty, index) => (
            <Box
              key={specialty.id}
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