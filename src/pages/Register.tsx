import { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const register = () => {
    if (!email.trim()) return;
    localStorage.setItem("user", JSON.stringify({ email, role: "patient" }));
    navigate("/patient/dashboard");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Box sx={{ width: 350 }}>
        <Typography variant="h5" textAlign="center" mb={3}>
          Registro de Paciente
        </Typography>
        <TextField fullWidth label="Correo" sx={{ mb: 2 }} value={email} onChange={(e) => setEmail(e.target.value)} />

        {/* Podríamos agregar nombre, teléfono, etc si quieres */}
        
        <Button variant="contained" fullWidth onClick={register}>
          Crear cuenta
        </Button>
      </Box>
    </Box>
  );
}