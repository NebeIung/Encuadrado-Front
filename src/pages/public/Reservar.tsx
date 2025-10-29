import { useState, useEffect } from "react";
import { 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon 
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
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        Reservar una Hora
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
        Selecciona la especialidad que necesitas
      </Typography>

      {specialties.length === 0 ? (
        <Alert severity="info">
          No hay especialidades disponibles en este momento.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {specialties.map((specialty) => (
            <Grid item xs={12} sm={6} md={4} key={specialty.id}>
              <Card 
                sx={{ 
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleSelect(specialty)}
                  sx={{ height: "100%", p: 2 }}
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom color="primary">
                      {specialty.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      mb={2}
                      sx={{ minHeight: 60 }}
                    >
                      {specialty.description || "Atención especializada profesional"}
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Duración:</strong> {specialty.duration} minutos
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Precio:</strong> ${specialty.price.toLocaleString('es-CL')} CLP
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>{specialty.professionals_count}</strong> {specialty.professionals_count === 1 ? "profesional disponible" : "profesionales disponibles"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label="Reservar ahora" 
                        color="primary" 
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}