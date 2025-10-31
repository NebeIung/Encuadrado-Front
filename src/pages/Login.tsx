import { useState } from "react";
import { TextField, Button, Box, Typography, Link, Alert, Card, CardContent, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
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
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Credenciales inválidas");
      }

      const userData = await response.json();
      login({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      });

      // Redirigir según el rol
      if (userData.role === "admin" || userData.role === "member" || userData.role === "limited") {
        navigate("centro-de-salud-cuad/dashboard");
      } else {
        navigate("centro-de-salud-cuad/patient/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box 
        sx={{ 
          position: "absolute", 
          top: 20, 
          left: 20, 
          cursor: "pointer",
          zIndex: 10
        }}
        onClick={() => navigate("centro-de-salud-cuad/public")}
      >
        <img 
          src="../public/cuad.svg" 
          alt="Logo" 
          style={{ height: 50 }}
        />
      </Box>

      <Box sx={{ display: "flex", flex: 1, minHeight: "100vh" }}>
        <Box 
          sx={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            bgcolor: "background.default"
          }}
        >
          <img 
            src="../public/cuad.svg" 
            alt="Logo Encuadrado" 
            style={{ 
              maxWidth: "70%", 
              maxHeight: "70%",
              objectFit: "contain"
            }}
          />
        </Box>

        <Box 
          sx={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            bgcolor: "secondary.main",
            p: 4
          }}
        >
          <Card 
            sx={{ 
              width: "100%",
              maxWidth: 450,
              borderRadius: 3,
              boxShadow: 6,
              position: "relative"
            }}
          >
            <IconButton
              onClick={() => navigate("centro-de-salud-cuad/public")}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                  boxShadow: 2
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <CardContent sx={{ p: 4, pt: 6 }}>
              <Typography variant="h4" textAlign="center" mb={1} sx={{ fontWeight: "bold" }}>
                Iniciar Sesión
              </Typography>
              
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
                Ingresa tus credenciales para continuar
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
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
                size="medium"
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
                size="medium"
              />

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
                onClick={handleLogin}
                disabled={loading}
                size="large"
              >
                {loading ? "Cargando..." : "Entrar"}
              </Button>

              <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: "bold" }}>
                  Usuarios de prueba:
                </Typography>
                <Typography variant="caption" display="block">
                  • admin@cuad.cl (Admin)
                </Typography>
                <Typography variant="caption" display="block">
                  • juan@cuad.cl (Member)
                </Typography>
                <Typography variant="caption" display="block">
                  • ana@cuad.cl (Member)
                </Typography>
                <Typography variant="caption" display="block">
                  • laura@cuad.cl (Member)
                </Typography>
                <Typography variant="caption" display="block">
                  • carlos@cuad.cl (Limited)
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Contraseña: <strong>1234</strong>
                </Typography>
              </Box>

            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}