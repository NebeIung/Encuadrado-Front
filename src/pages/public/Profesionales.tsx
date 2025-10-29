import { useState, useEffect } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";
import { 
  Email as EmailIcon,
  Phone as PhoneIcon,
  MedicalServices as MedicalIcon
} from "@mui/icons-material";

interface Professional {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: Array<{
    id: number;
    name: string;
    duration: number;
    price: number;
  }>;
}

export default function Profesionales() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/professionals");
      if (!response.ok) throw new Error("Error al cargar profesionales");
      
      const data = await response.json();
      setProfessionals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        Nuestro Equipo Profesional
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
        Conoce a los profesionales que te atenderán
      </Typography>

      {professionals.length === 0 ? (
        <Alert severity="info">
          No hay profesionales disponibles en este momento.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {professionals.map((professional) => (
            <Grid item xs={12} md={6} lg={4} key={professional.id}>
              <Card 
                sx={{ 
                  height: "100%",
                  boxShadow: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)"
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Avatar y Nombre */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: "primary.main",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        mr: 2
                      }}
                    >
                      {getInitials(professional.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {professional.name}
                      </Typography>
                      <Chip 
                        label={professional.role === "admin" ? "Director Médico" : "Profesional"}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Información de Contacto */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contacto
                    </Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {professional.email}
                      </Typography>
                    </Box>

                    {professional.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {professional.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Especialidades */}
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <MedicalIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Especialidades
                      </Typography>
                    </Box>
                    
                    {professional.specialties && professional.specialties.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                        {professional.specialties.map((specialty) => (
                          <Chip
                            key={specialty.id}
                            label={specialty.name}
                            size="small"
                            color="secondary"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin especialidades asignadas
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4, p: 3, bgcolor: "grey.100", borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          ¿Necesitas más información sobre algún profesional? 
          Contáctanos al <strong>+56 9 1234 5678</strong> o escríbenos a <strong>contacto@centrocuad.cl</strong>
        </Typography>
      </Box>
    </Box>
  );
}