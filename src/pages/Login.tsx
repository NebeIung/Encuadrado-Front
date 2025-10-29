import { useState } from "react";
import { TextField, Button, Box, Typography, Link, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Llamada al backend
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: email, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const userData = await response.json();
      
      // Login usando el contexto
      login({
        email: userData.user,
        name: userData.name,
        role: userData.role,
      });

      // Redirigir según el rol
      if (userData.role === "admin" || userData.role === "member" || userData.role === "limited") {
        navigate("/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Box sx={{ width: 400 }}>
        <Typography variant="h5" textAlign="center" mb={3}>
          Iniciar Sesión
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Correo"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />

        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Entrar"}
        </Button>

        <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="caption" display="block" gutterBottom>
            <strong>Usuarios de prueba:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            • admin@centro.com (Administrador)
          </Typography>
          <Typography variant="caption" display="block">
            • juan@centro.com (Miembro)
          </Typography>
          <Typography variant="caption" display="block">
            • ana@centro.com (Solo Lectura)
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Contraseña: <strong>1234</strong>
          </Typography>
        </Box>

        <Typography textAlign="center" mt={2}>
          ¿No tienes cuenta?
          <Link sx={{ ml: 1, cursor: "pointer" }} onClick={() => navigate("/register")}>
            Regístrate
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}