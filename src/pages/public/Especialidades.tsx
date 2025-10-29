import { useState, useEffect } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";
import { 
  KeyboardArrowLeft, 
  KeyboardArrowRight,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon
} from "@mui/icons-material";

interface Specialty {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  professionals_count: number;
}

export default function Especialidades() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const itemsPerView = 3;

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

  const handleNext = () => {
    setCurrentIndex(prev => 
      prev + 1 >= specialties.length - itemsPerView + 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, specialties.length - itemsPerView) : prev - 1
    );
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
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" mb={1} textAlign="center">
        Nuestras Especialidades
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
        Contamos con profesionales especializados en distintas áreas de la salud
      </Typography>

      {specialties.length === 0 ? (
        <Alert severity="info">
          No hay especialidades disponibles en este momento.
        </Alert>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            justifyContent: 'center'
          }}>
            <IconButton 
              onClick={handlePrev}
              disabled={specialties.length <= itemsPerView}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' }
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>

            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              overflow: 'hidden',
              flex: 1,
              maxWidth: 1200,
              justifyContent: 'center'
            }}>
              {specialties
                .slice(currentIndex, currentIndex + itemsPerView)
                .map((specialty) => (
                  <Card 
                    key={specialty.id} 
                    sx={{ 
                      flex: 1, 
                      minWidth: 280,
                      maxWidth: 350,
                      boxShadow: 3,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h5" 
                        gutterBottom 
                        color="primary"
                        sx={{ fontWeight: 'bold', mb: 2 }}
                      >
                        {specialty.name}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 3, minHeight: 60 }}
                      >
                        {specialty.description || "Atención especializada profesional"}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {specialty.duration} minutos por sesión
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            ${specialty.price.toLocaleString('es-CL')} CLP
                          </Typography>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={`${specialty.professionals_count} profesionales`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>

            <IconButton 
              onClick={handleNext}
              disabled={specialties.length <= itemsPerView}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' }
              }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Mostrando {Math.min(currentIndex + itemsPerView, specialties.length)} de {specialties.length} especialidades
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}