import { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from "@mui/material";
import { 
  LocalHospital as HospitalIcon,
  VerifiedUser as VerifiedIcon,
  Groups as GroupsIcon,
  FavoriteBorder as HeartIcon,
  Business as BusinessIcon
} from "@mui/icons-material";
import { api } from "../../api/apiClient";

interface CenterInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  vision: string;
  logo_url?: string;
}

export default function Nosotros() {
  const [centerInfo, setCenterInfo] = useState<CenterInfo>({
    name: "Centro de Salud",
    address: "",
    phone: "",
    email: "",
    description: "",
    vision: "",
    logo_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchCenterInfo();
  }, []);

  const fetchCenterInfo = async () => {
    try {
      const response = await api.get('/public/center-info');
      setCenterInfo(response.data);
    } catch (err: any) {
      console.error("Error al cargar información del centro:", err);
      setError("Error al cargar la información del centro");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
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

  const hasLogo = centerInfo.logo_url && !imageError;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          {centerInfo.name}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Tu salud es nuestra prioridad
        </Typography>
      </Box>

      {/* Grid principal */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: "1/1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: hasLogo ? "transparent" : "grey.100",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            {hasLogo ? (
              <img
                src={centerInfo.logo_url}
                alt={`Logo de ${centerInfo.name}`}
                onError={() => setImageError(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "20px"
                }}
              />
            ) : (
              <BusinessIcon
                sx={{
                  fontSize: 120,
                  color: "primary.main",
                  opacity: 0.3
                }}
              />
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Quiénes Somos */}
            <Grid item xs={12}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: "primary.main", mb: 3 }}>
                  Quiénes Somos
                </Typography>
                
                {centerInfo.description ? (
                  <Typography paragraph sx={{ whiteSpace: "pre-line", textAlign: "justify" }}>
                    {centerInfo.description}
                  </Typography>
                ) : (
                  <Typography paragraph color="text.secondary" fontStyle="italic">
                    La información sobre el centro aún no ha sido configurada.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Nuestra Visión */}
            <Grid item xs={12}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: "primary.main", mb: 3 }}>
                  Nuestra Visión
                </Typography>

                {centerInfo.vision ? (
                  <Typography paragraph sx={{ whiteSpace: "pre-line", textAlign: "justify" }}>
                    {centerInfo.vision}
                  </Typography>
                ) : (
                  <Typography paragraph color="text.secondary" fontStyle="italic">
                    La visión del centro aún no ha sido configurada.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Valores */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", mb: 3, textAlign: "center" }}>
        Nuestros Valores
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: "center", 
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-8px)", boxShadow: 4 }
            }}
          >
            <HospitalIcon sx={{ fontSize: 50, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Profesionalismo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contamos con un equipo médico altamente capacitado y en constante actualización.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: "center", 
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-8px)", boxShadow: 4 }
            }}
          >
            <HeartIcon sx={{ fontSize: 50, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Empatía
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tratamos a cada paciente con el cuidado y respeto que merece.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: "center", 
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-8px)", boxShadow: 4 }
            }}
          >
            <VerifiedIcon sx={{ fontSize: 50, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Calidad
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nos comprometemos con la excelencia en cada aspecto de nuestro servicio.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: "center", 
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-8px)", boxShadow: 4 }
            }}
          >
            <GroupsIcon sx={{ fontSize: 50, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Cercanía
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Construimos relaciones de confianza con nuestros pacientes y sus familias.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Información de Contacto */}
      {(centerInfo.address || centerInfo.phone || centerInfo.email) && (
        <Paper sx={{ p: 4, bgcolor: "grey.50" }}>
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
            Visítanos
          </Typography>
          {centerInfo.address && (
            <Typography paragraph>
              <strong>Dirección:</strong> {centerInfo.address}
            </Typography>
          )}
          {centerInfo.phone && (
            <Typography paragraph>
              <strong>Teléfono:</strong> {centerInfo.phone}
            </Typography>
          )}
          {centerInfo.email && (
            <Typography paragraph>
              <strong>Email:</strong> {centerInfo.email}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}