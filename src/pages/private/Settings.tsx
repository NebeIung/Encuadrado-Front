import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { api } from "../../api/apiClient";

interface CenterConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  vision: string;
  logo_url: string;
}

export default function Settings() {
  const [config, setConfig] = useState<CenterConfig>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    vision: "",
    logo_url: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/center-config');
      setConfig({
        name: response.data.name || "",
        address: response.data.address || "",
        phone: response.data.phone || "",
        email: response.data.email || "",
        description: response.data.description || "",
        vision: response.data.vision || "",
        logo_url: response.data.logo_url || "",
      });
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar la configuración",
        severity: "error",
      });
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/center-config', config);

      setSnackbar({
        open: true,
        message: "Configuración guardada exitosamente",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error al guardar configuración:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al guardar la configuración",
        severity: "error",
      });
    }
  };

  const handleChange = (field: keyof CenterConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Configuración del Centro
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <TextField
                  label="Nombre del Centro"
                  fullWidth
                  value={config.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  helperText="Aparecerá en la página 'Nosotros'"
                />
                <TextField
                  label="Dirección"
                  fullWidth
                  value={config.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={config.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <TextField
                  label="Email"
                  fullWidth
                  type="email"
                  value={config.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Quiénes Somos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                label="Descripción del Centro"
                fullWidth
                multiline
                rows={6}
                value={config.description}
                onChange={(e) => handleChange("description", e.target.value)}
                helperText="Describe tu centro, historia, servicios y misión. Aparecerá en la sección 'Quiénes Somos'"
              />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Nuestra Visión
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                label="Visión del Centro"
                fullWidth
                multiline
                rows={5}
                value={config.vision}
                onChange={(e) => handleChange("vision", e.target.value)}
                helperText="Describe la visión y objetivos a futuro del centro. Aparecerá en la sección 'Nuestra Visión'"
              />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Branding
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                label="URL del Logo"
                fullWidth
                value={config.logo_url}
                onChange={(e) => handleChange("logo_url", e.target.value)}
                helperText="URL de la imagen del logo (opcional)"
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                size="large"
              >
                Guardar Cambios
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}