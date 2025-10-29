import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import { 
  LocalHospital as HospitalIcon,
  VerifiedUser as VerifiedIcon,
  Groups as GroupsIcon,
  FavoriteBorder as HeartIcon
} from "@mui/icons-material";

export default function Nosotros() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          Centro de Salud Cuad
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Tu salud es nuestra prioridad
        </Typography>
      </Box>

      {/* Contenido Principal */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: "primary.main", mb: 3 }}>
          Quiénes Somos
        </Typography>
        
        <Typography paragraph>
          El Centro de Salud Cuad nace con la misión de brindar atención médica integral de calidad, 
          centrada en el bienestar de nuestros pacientes. Desde nuestros inicios, nos hemos comprometido 
          a ofrecer servicios de salud accesibles, profesionales y humanizados.
        </Typography>

        <Typography paragraph>
          Nuestro equipo está conformado por profesionales altamente calificados en diversas 
          especialidades médicas, quienes trabajan en conjunto para proporcionar un enfoque holístico 
          del cuidado de la salud. Creemos firmemente que cada paciente es único y merece un tratamiento 
          personalizado que considere sus necesidades específicas.
        </Typography>

        <Typography paragraph>
          En Cuad, combinamos la experiencia clínica con tecnología moderna para garantizar diagnósticos 
          precisos y tratamientos efectivos. Nuestras instalaciones están diseñadas para crear un ambiente 
          cómodo y seguro, donde nuestros pacientes puedan sentirse en confianza durante su atención médica.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom sx={{ color: "primary.main", mb: 3 }}>
          Nuestra Visión
        </Typography>

        <Typography paragraph>
          Aspiramos a ser el centro de salud de referencia en la comunidad, reconocidos por nuestra 
          excelencia en el servicio, la calidez humana de nuestro equipo y nuestro compromiso constante 
          con la innovación en salud. Trabajamos cada día para mejorar la calidad de vida de nuestros 
          pacientes a través de una atención médica integral y preventiva.
        </Typography>

        <Typography paragraph>
          Queremos construir relaciones duraderas con nuestros pacientes, basadas en la confianza mutua 
          y el respeto. Nos esforzamos por ser más que un centro médico: queremos ser aliados en el 
          cuidado de tu salud y la de tu familia.
        </Typography>
      </Paper>

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
      <Paper sx={{ p: 4, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          Visítanos
        </Typography>
        <Typography paragraph>
          <strong>Dirección:</strong> Av. Providencia 1234, Santiago, Chile
        </Typography>
        <Typography paragraph>
          <strong>Teléfono:</strong> +56 9 1234 5678
        </Typography>
        <Typography paragraph>
          <strong>Email:</strong> contacto@centrocuad.cl
        </Typography>
        <Typography paragraph>
          <strong>Horario de Atención:</strong> Lunes a Viernes de 09:00 a 18:00 hrs
        </Typography>
      </Paper>
    </Box>
  );
}