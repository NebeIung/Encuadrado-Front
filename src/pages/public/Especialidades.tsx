import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Container,
  Divider
} from "@mui/material";
import { 
  KeyboardArrowLeft, 
  KeyboardArrowRight,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon
} from "@mui/icons-material";
import { api } from "../../api/apiClient";

interface Specialty {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  has_terms: boolean;
}

interface SpecialtyWithCount extends Specialty {
  professionals_count: number;
}

export default function Especialidades() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<SpecialtyWithCount[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const specialtiesResponse = await api.get("/services");
      const allSpecialties: Specialty[] = specialtiesResponse.data;

      const specialtiesWithCount = await Promise.all(
        allSpecialties.map(async (specialty) => {
          try {
            const profResponse = await api.get("/public/professionals", {
              params: { specialty_id: specialty.id }
            });
            
            return {
              ...specialty,
              professionals_count: profResponse.data.length
            };
          } catch (error) {
            return {
              ...specialty,
              professionals_count: 0
            };
          }
        })
      );

      // Filtrar solo especialidades con profesionales disponibles
      const availableSpecialties = specialtiesWithCount.filter(
        specialty => specialty.professionals_count > 0
      );

      setSpecialties(availableSpecialties);
    } catch (err: any) {
      setError(err.message || "Error al cargar especialidades");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = (specialty: SpecialtyWithCount) => {
    navigate('/centro-de-salud-cuad/public/select-professional', {
      state: { specialty }
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < specialties.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const getVisibleCards = () => {
    if (specialties.length === 0) return [];

    if (specialties.length <= 2) {
      return specialties.map((spec, idx) => ({
        specialty: spec,
        position: idx - currentIndex
      }));
    }

    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < specialties.length) {
        visible.push({ specialty: specialties[index], position: i });
      }
    }
    return visible;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (specialties.length === 0) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
          No hay especialidades con profesionales disponibles en este momento.
        </Alert>
      </Container>
    );
  }

  const visibleCards = getVisibleCards();
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < specialties.length - 1;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Nuestras Especialidades
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Contamos con profesionales especializados en distintas áreas
        </Typography>
      </Box>

      <Box sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 500,
        py: 4
      }}>
        {/* Botón izquierdo */}
        {specialties.length > 1 && (
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
            <KeyboardArrowLeft />
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
          {visibleCards.map(({ specialty, position }) => {
            const isCurrent = position === 0;
            const scale = isCurrent ? 1 : 0.85;
            const opacity = isCurrent ? 1 : 0.5;
            const zIndex = isCurrent ? 10 : 1;

            return (
              <Card
                key={specialty.id}
                sx={{
                  width: isCurrent ? 500 : 400,
                  height: 480,
                  transition: "all 0.4s ease-in-out",
                  transform: `scale(${scale})`,
                  opacity,
                  zIndex,
                  border: isCurrent ? "3px solid" : "1px solid",
                  borderColor: isCurrent ? "primary.main" : "divider",
                  boxShadow: isCurrent ? 6 : 2,
                  cursor: isCurrent ? "default" : "default",
                  pointerEvents: isCurrent ? "auto" : "none",
                }}
              >
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}>
                  <Typography 
                    variant={isCurrent ? "h5" : "h6"}
                    sx={{ 
                      fontWeight: "bold",
                      mb: 2,
                      textAlign: "center"
                    }}
                  >
                    {specialty.name}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 3, 
                      textAlign: "center",
                      minHeight: isCurrent ? 60 : 40,
                      lineHeight: 1.6 
                    }}
                  >
                    {specialty.description || "Atención especializada profesional"}
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  {isCurrent && (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 1.5,
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }}>
                          <TimeIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Duración: {specialty.duration} minutos
                          </Typography>
                        </Box>

                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 1.5,
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }}>
                          <MoneyIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Precio: ${specialty.price.toLocaleString('es-CL')} CLP
                          </Typography>
                        </Box>

                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 1.5,
                          bgcolor: 'success.lighter',
                          borderRadius: 1
                        }}>
                          <PeopleIcon 
                            fontSize="small" 
                            sx={{ color: 'success.main' }} 
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: 'success.main'
                            }}
                          >
                            {specialty.professionals_count} profesional{specialty.professionals_count !== 1 ? 'es' : ''} disponible{specialty.professionals_count !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<CalendarIcon />}
                        onClick={() => handleReserve(specialty)}
                        sx={{
                          mt: 'auto',
                          py: 1.5,
                          fontWeight: 'bold'
                        }}
                      >
                        Reservar Hora
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Botón derecho */}
        {specialties.length > 1 && (
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
            <KeyboardArrowRight />
          </IconButton>
        )}
      </Box>

      {/* Indicadores */}
      {specialties.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}>
          {specialties.map((_, index) => (
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