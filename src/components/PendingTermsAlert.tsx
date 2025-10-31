import { useState, useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Typography,
  Box,
  Snackbar,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/apiClient";

interface PendingSpecialty {
  specialty_id: number;
  specialty_name: string;
  specialty_color: string;
  assigned_at: string;
}

export default function PendingTermsAlert() {
  const { user } = useAuth();
  const [pendingSpecialties, setPendingSpecialties] = useState<PendingSpecialty[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<PendingSpecialty | null>(null);
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (user && user.role !== 'patient') {
      fetchPendingTerms();
    }
  }, [user]);

  const fetchPendingTerms = async () => {
    try {
      const response = await api.get(`/professionals/${user?.id}/pending-terms`);
      setPendingSpecialties(response.data.pending_specialties || []);
    } catch (error) {
      console.error("Error fetching pending terms:", error);
    }
  };

  const handleOpenDialog = (specialty: PendingSpecialty) => {
    setSelectedSpecialty(specialty);
    setTerms("");
    setDialogOpen(true);
  };

  const handleSaveTerms = async () => {
    if (!selectedSpecialty || !terms.trim()) {
      setSnackbar({
        open: true,
        message: "Los términos y condiciones no pueden estar vacíos",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await api.put(
        `/professionals/${user?.id}/specialties/${selectedSpecialty.specialty_id}/terms`,
        { terms_and_conditions: terms.trim() }
      );

      setSnackbar({
        open: true,
        message: "Términos guardados exitosamente. Tu especialidad ya está activa.",
        severity: "success",
      });

      setDialogOpen(false);
      fetchPendingTerms();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al guardar los términos",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pendingSpecialties.length === 0) {
    return null;
  }

  return (
    <>
      <Alert
        severity="warning"
        icon={<WarningIcon sx={{ fontSize: 32 }} />}
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small" onClick={() => setDialogOpen(true)}>
            Completar Ahora
          </Button>
        }
      >
        <AlertTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          ⚠️ Acción Requerida: Términos y Condiciones Pendientes
        </AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Tienes <strong>{pendingSpecialties.length}</strong> especialidad(es) que requieren
          términos y condiciones antes de estar disponibles para agendamiento público:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {pendingSpecialties.map((spec) => (
            <Chip
              key={spec.specialty_id}
              label={spec.specialty_name}
              size="small"
              sx={{
                bgcolor: spec.specialty_color,
                color: "white",
                fontWeight: "bold",
              }}
            />
          ))}
        </Stack>
      </Alert>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6">Términos y Condiciones</Typography>
              <Typography variant="caption" color="text.secondary">
                Define tus términos para cada especialidad
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {!selectedSpecialty ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selecciona una especialidad para agregar sus términos y condiciones:
              </Typography>
              <List>
                {pendingSpecialties.map((spec) => (
                  <ListItem
                    key={spec.specialty_id}
                    button
                    onClick={() => handleOpenDialog(spec)}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Chip
                          label={spec.specialty_name}
                          size="small"
                          sx={{
                            bgcolor: spec.specialty_color,
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                      }
                      secondary={`Asignada el ${new Date(spec.assigned_at).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Stack spacing={2}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Especialidad:</strong>{" "}
                  <Chip
                    label={selectedSpecialty.specialty_name}
                    size="small"
                    sx={{
                      bgcolor: selectedSpecialty.specialty_color,
                      color: "white",
                      fontWeight: "bold",
                      ml: 1,
                    }}
                  />
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Define los términos y condiciones que los pacientes deberán aceptar al agendar
                  una cita contigo para esta especialidad.
                </Typography>
              </Alert>

              <TextField
                label="Términos y Condiciones"
                multiline
                rows={12}
                fullWidth
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder={`Ejemplo:\n\n1. El paciente debe llegar 10 minutos antes de la hora programada.\n2. Las cancelaciones deben hacerse con al menos 24 horas de anticipación.\n3. No se realizarán reembolsos por inasistencias sin aviso previo.\n4. Es obligatorio presentar documento de identidad al momento de la atención.\n5. El profesional se reserva el derecho de reagendar la cita por motivos de fuerza mayor.\n\n[Agrega tus términos específicos aquí...]`}
                helperText={`${terms.length} caracteres. Mínimo 50 caracteres recomendado.`}
              />

              <Alert severity="success" icon={<CheckCircleIcon />}>
                <Typography variant="body2">
                  Una vez guardados, tu especialidad estará <strong>activa</strong> y visible para
                  agendamiento público.
                </Typography>
              </Alert>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              if (selectedSpecialty) {
                setSelectedSpecialty(null);
                setTerms("");
              } else {
                setDialogOpen(false);
              }
            }}
          >
            {selectedSpecialty ? "Volver" : "Cerrar"}
          </Button>
          {selectedSpecialty && (
            <Button
              variant="contained"
              onClick={handleSaveTerms}
              disabled={loading || terms.trim().length < 20}
              startIcon={<CheckCircleIcon />}
            >
              {loading ? "Guardando..." : "Guardar y Activar"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
    </>
  );
}