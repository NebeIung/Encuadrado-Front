import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";

export default function PatientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const login = () => {
    if (email.trim() === "") return;
    localStorage.setItem("patient", JSON.stringify({ email }));
    navigate("/patient/dashboard");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Box sx={{ width: 350 }}>
        <Typography variant="h5" textAlign="center" mb={3}>
          Iniciar Sesión Paciente
        </Typography>
        <TextField fullWidth label="Correo" onChange={(e) => setEmail(e.target.value)} />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={login}>
          Entrar
        </Button>
      </Box>
    </Box>
  );
}