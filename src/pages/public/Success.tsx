import { Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  return (
    <Stack alignItems="center" spacing={2} mt={10}>
      <Typography variant="h4">¡Cita agendada con éxito! 🎉</Typography>
      <Button variant="contained" onClick={() => navigate("centro-de-salud-cuad/")}>
        Volver al inicio
      </Button>
    </Stack>
  );
}
