import { Typography, Box } from "@mui/material";

export default function Welcome() {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh' 
    }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        Bienvenido a Centro de Salud Cuad
      </Typography>
      <Typography variant="h6" textAlign="center" color="text.secondary">
        Tu salud es nuestra prioridad
      </Typography>
    </Box>
  );
}