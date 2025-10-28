import { useState } from "react";
import { TextField, Button, Box, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const professionals = ["admin@centro.com", "juan@centro.com", "ana@centro.com"];

    if (email === "" || password === "") return;

    if (professionals.includes(email)) {
      localStorage.setItem("user", JSON.stringify({ email, role: "professional" }));
      navigate("/dashboard");
    } else {
      localStorage.setItem("user", JSON.stringify({ email, role: "patient" }));
      navigate("/patient/dashboard");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Box sx={{ width: 350 }}>
        <Typography variant="h5" textAlign="center" mb={3}>
          Iniciar Sesión
        </Typography>

        <TextField label="Correo" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Contraseña" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>
          Entrar
        </Button>

        <Typography textAlign="center" mt={2}>
          ¿No tienes cuenta?
          <Link sx={{ ml: 1 }} onClick={() => navigate("/register")}>
            Regístrate
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}