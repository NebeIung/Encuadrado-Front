import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface CenterConfig {
  name: string;
  description: string;
  openTime: string;
  closeTime: string;
}

export default function Settings() {
  const { hasPermission } = useAuth();
  const [config, setConfig] = useState<CenterConfig>({
    name: "Centro Médico Cuad",
    description: "Centro de atención médica integral con profesionales especializados en distintas áreas de la salud.",
    openTime: "09:00",
    closeTime: "18:00",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Cargar configuración actual
  useEffect(() => {
    fetch("http://localhost:5000/center-config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => {
        console.log("Usando configuración por defecto");
      });
  }, []);

  const handleChange = (field: keyof CenterConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!hasPermission("canEditCenter")) {
      setError("No tienes permisos para editar la configuración del centro");
      return;
    }

    // Validaciones
    if (!config.name.trim()) {
      setError("El nombre del centro es requerido");
      return;
    }

    if (config.description.length > 400) {
      setError("La descripción no puede exceder 400 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/center-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Error al guardar");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Configuración del Centro
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ Configuración guardada exitosamente
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Nombre del centro */}
          <Grid item xs={12}>
            <Typography variant="h6" mb={2}>
              Información Básica
            </Typography>
            <TextField
              label="Nombre del Centro"
              fullWidth
              value={config.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
              helperText="Este nombre será visible para los pacientes"
            />
          </Grid>

          {/* Descripción */}
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              value={config.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={loading}
              helperText={`${config.description.length}/400 caracteres`}
              error={config.description.length > 400}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Horarios de atención */}
          <Grid item xs={12}>
            <Typography variant="h6" mb={2}>
              Horario de Atención
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Define el horario general del centro (se asume el mismo para todos los días)
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Hora de Apertura"
              type="time"
              fullWidth
              value={config.openTime}
              onChange={(e) => handleChange("openTime", e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Hora de Cierre"
              type="time"
              fullWidth
              value={config.closeTime}
              onChange={(e) => handleChange("closeTime", e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Botón guardar */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Información adicional */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <strong>Nota:</strong> Los cambios en el horario de atención afectarán 
        la disponibilidad de citas para todos los profesionales del centro.
      </Alert>
    </Box>
  );
}