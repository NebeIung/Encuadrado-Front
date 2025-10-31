import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Circle as CircleIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { MuiColorInput } from "mui-color-input";
import { api } from "../../api/apiClient";
import { useAuth } from "../../contexts/AuthContext";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  professionals_count?: number;
  professionals?: Array<{ id: number; name: string; has_terms?: boolean }>;
}

interface Professional {
  id: number;
  name: string;
  email: string;
}

export default function ServicesManagement() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    color: "#1976d2",
  });
  const [priceInput, setPriceInput] = useState("0");
  
  // Estados para términos y condiciones
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [selectedServiceForTerms, setSelectedServiceForTerms] = useState<Service | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [termsContent, setTermsContent] = useState("");
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [savingTerms, setSavingTerms] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Determinar permisos según rol
  const canEdit = user?.role === 'admin';
  const canEditTerms = user?.role === 'admin' || user?.role === 'member';
  const isReadOnly = user?.role === 'limited';

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services?include_professionals=true');
      
      // Si es member o limited, filtrar solo SUS especialidades
      if (user?.role === 'member' || user?.role === 'limited') {
        const userResponse = await api.get(`/professionals/${user.id}`);
        const userSpecialtyIds = userResponse.data.specialties.map((s: any) => s.id);
        const filteredServices = response.data.filter((s: Service) => 
          userSpecialtyIds.includes(s.id)
        );
        setServices(filteredServices);
      } else {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar servicios",
        severity: "error",
      });
    }
  };

  const handleOpenDialog = (service?: Service) => {
    if (!canEdit) return;

    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price,
        color: service.color || "#1976d2",
      });
      setPriceInput(service.price.toString());
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        duration: 60,
        price: 0,
        color: "#1976d2",
      });
      setPriceInput("");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      duration: 60,
      price: 0,
      color: "#1976d2",
    });
    setPriceInput("");
  };

  const isNameDuplicated = () => {
    if (!formData.name.trim()) return false;
    
    return services.some(
      service => service.name.toLowerCase() === formData.name.toLowerCase().trim() && 
                 service.id !== editingService?.id
    );
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setSnackbar({
          open: true,
          message: 'El nombre del servicio no puede estar vacío',
          severity: 'error',
        });
        return;
      }

      // VALIDACIÓN: Nombre duplicado
      if (isNameDuplicated()) {
        const existingService = services.find(
          service => service.name.toLowerCase() === formData.name.toLowerCase().trim() && 
                     service.id !== editingService?.id
        );
        
        setSnackbar({
          open: true,
          message: `Ya existe un servicio con el nombre "${existingService?.name}"`,
          severity: 'error',
        });
        return;
      }

      // Descripción requerida
      if (!formData.description.trim()) {
        setSnackbar({
          open: true,
          message: 'La descripción del servicio no puede estar vacía',
          severity: 'error',
        });
        return;
      }

      // Duración mínima
      if (formData.duration < 15) {
        setSnackbar({
          open: true,
          message: 'La duración mínima es de 15 minutos',
          severity: 'error',
        });
        return;
      }

      // Precio positivo
      if (formData.price < 0) {
        setSnackbar({
          open: true,
          message: 'El precio no puede ser negativo',
          severity: 'error',
        });
        return;
      }

      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
        setSnackbar({
          open: true,
          message: "Servicio actualizado exitosamente",
          severity: "success",
        });
      } else {
        await api.post('/services', formData);
        setSnackbar({
          open: true,
          message: "Servicio creado exitosamente",
          severity: "success",
        });
      }
      fetchServices();
      handleCloseDialog();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al guardar el servicio",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    const service = services.find(s => s.id === id);
    
    if (service && service.professionals_count && service.professionals_count > 0) {
      setSnackbar({
        open: true,
        message: `No se puede eliminar. Hay ${service.professionals_count} profesional(es) asignado(s) a esta especialidad.`,
        severity: "error",
      });
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      await api.delete(`/services/${id}`);
      setSnackbar({
        open: true,
        message: "Servicio eliminado exitosamente",
        severity: "success",
      });
      fetchServices();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al eliminar el servicio",
        severity: "error",
      });
    }
  };
  
  const handleOpenTermsDialog = (service: Service) => {
    setSelectedServiceForTerms(service);
    setTermsContent("");
    setSelectedProfessionalId(null);
    
    // Si es member o limited, auto-seleccionar al usuario actual
    if (user?.role === 'member' || user?.role === 'limited') {
      setSelectedProfessionalId(user.id);
      loadTermsForProfessional(user.id, service.id);
    }
    
    setTermsDialogOpen(true);
  };

  const handleCloseTermsDialog = () => {
    setTermsDialogOpen(false);
    setSelectedServiceForTerms(null);
    setSelectedProfessionalId(null);
    setTermsContent("");
  };

  const handleProfessionalChange = (professionalId: number) => {
    setSelectedProfessionalId(professionalId);
    if (selectedServiceForTerms) {
      loadTermsForProfessional(professionalId, selectedServiceForTerms.id);
    }
  };

  const loadTermsForProfessional = async (professionalId: number, specialtyId: number) => {
    setLoadingTerms(true);
    try {
      const response = await api.get(`/public/terms/${professionalId}/${specialtyId}`);
      setTermsContent(response.data.content || "");
    } catch (error) {
      console.error("Error loading terms:", error);
      setTermsContent("");
    } finally {
      setLoadingTerms(false);
    }
  };

  const handleSaveTerms = async () => {
    if (!selectedProfessionalId || !selectedServiceForTerms) return;

    setSavingTerms(true);
    try {
      await api.put(
        `/professionals/${selectedProfessionalId}/specialties/${selectedServiceForTerms.id}/terms`,
        { terms_and_conditions: termsContent }
      );
      
      setSnackbar({
        open: true,
        message: "Términos y condiciones actualizados exitosamente",
        severity: "success",
      });
      
      fetchServices();
      handleCloseTermsDialog();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al guardar términos",
        severity: "error",
      });
    } finally {
      setSavingTerms(false);
    }
  };

  const handleColorChange = (newColor: string) => {
    setFormData({ ...formData, color: newColor });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === "") {
      setPriceInput("");
      setFormData({ ...formData, price: 0 });
      return;
    }

    const cleanValue = value.replace(/\./g, "");
    const numValue = parseInt(cleanValue) || 0;

    setPriceInput(cleanValue);
    setFormData({ ...formData, price: numValue });
  };

  const formatPriceDisplay = (value: string) => {
    if (!value) return "";
    return parseInt(value).toLocaleString("es-CL");
  };

  const getProfessionalsTooltip = (service: Service) => {
    if (!service.professionals || service.professionals.length === 0) {
      return "Sin profesionales asignados";
    }
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Profesionales asignados:
        </Typography>
        {service.professionals.map((prof) => (
          <Typography key={prof.id} variant="body2" sx={{ fontSize: '0.85rem' }}>
            • {prof.name}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {isReadOnly ? 'Mis Especialidades' : 'Gestión de Servicios'}
          </Typography>
          {isReadOnly && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Vista de solo lectura - Las especialidades asignadas a ti
            </Typography>
          )}
        </Box>
        
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Servicio
          </Button>
        )}
      </Box>

      {services.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              {isReadOnly 
                ? "No tienes especialidades asignadas." 
                : "No hay servicios registrados. Haz clic en 'Nuevo Servicio' para crear uno."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {services.map((service) => {
            const hasNoProfessionals = (service.professionals_count || 0) === 0;
            
            return (
              <Card 
                key={service.id} 
                sx={{ 
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${service.color}`,
                  bgcolor: hasNoProfessionals && canEdit ? '#fff9e6' : 'white',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CircleIcon sx={{ fontSize: 16, color: service.color }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {service.name}
                        </Typography>
                        {hasNoProfessionals && canEdit && (
                          <Chip 
                            label="Sin profesionales" 
                            size="small" 
                            color="warning"
                            icon={<WarningIcon />}
                          />
                        )}
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          lineHeight: 1.6,
                          minHeight: '40px'
                        }}
                      >
                        {service.description || "Sin descripción"}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip 
                          icon={<AccessTimeIcon />}
                          label={`${service.duration} minutos`} 
                          size="medium" 
                          variant="outlined"
                          color="default"
                        />
                        <Chip 
                          icon={<AttachMoneyIcon />}
                          label={`$${service.price.toLocaleString("es-CL")}`} 
                          size="medium" 
                          sx={{
                            bgcolor: service.color,
                            color: 'white',
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                        />
                        
                        {canEdit && (
                          <Tooltip title={getProfessionalsTooltip(service)} arrow>
                            <Chip
                              icon={<PeopleIcon />}
                              label={`${service.professionals_count || 0} profesional${(service.professionals_count || 0) !== 1 ? 'es' : ''}`}
                              size="medium"
                              variant="outlined"
                              color={hasNoProfessionals ? "warning" : "success"}
                            />
                          </Tooltip>
                        )}
                        
                        {/* Botón Términos y Condiciones */}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DescriptionIcon />}
                          onClick={() => handleOpenTermsDialog(service)}
                          sx={{ ml: 'auto' }}
                        >
                          Términos y Condiciones
                        </Button>
                      </Stack>

                      {hasNoProfessionals && canEdit && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Typography variant="caption">
                            Esta especialidad no tiene profesionales asignados. Asigna profesionales desde la sección "Profesionales".
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                    
                    {canEdit && (
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          onClick={() => handleOpenDialog(service)} 
                          color="primary"
                          aria-label={`Editar ${service.name}`}
                          sx={{
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white',
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(service.id)} 
                          color="error"
                          aria-label={`Eliminar ${service.name}`}
                          disabled={(service.professionals_count ?? 0) > 0}
                          sx={{
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'white',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Dialog de edición de servicio (solo para admin) */}
      {canEdit && (
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {editingService ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Nombre del Servicio"
                fullWidth
                required
                autoFocus
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                helperText="Ejemplo: Terapia Individual, Evaluación Psicológica"
              />
              <TextField
                label="Descripción"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                helperText="Describe el servicio, qué incluye y sus beneficios"
              />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                  Color del Servicio
                </Typography>
                <MuiColorInput 
                  value={formData.color} 
                  onChange={handleColorChange}
                  format="hex"
                  fullWidth
                  isAlphaHidden
                  helperText="Selecciona un color representativo para este servicio"
                  PopoverProps={{
                    disableRestoreFocus: true,
                    disableEnforceFocus: true,
                    disableAutoFocus: true,
                  }}
                  sx={{
                    '& .MuiColorInput-Button': {
                      pointerEvents: 'auto',
                    }
                  }}
                />
              </Box>

              <TextField
                label="Duración (minutos)"
                type="number"
                fullWidth
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                helperText="Duración típica de la sesión"
                inputProps={{ min: 15, step: 15 }}
              />
              
              <TextField
                label="Precio"
                fullWidth
                required
                value={formatPriceDisplay(priceInput)}
                onChange={handlePriceChange}
                helperText="Precio del servicio en pesos chilenos"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                placeholder="0"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} size="large">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              size="large"
              disabled={!formData.name || !formData.description}
              sx={{ 
                bgcolor: formData.color, 
                '&:hover': { 
                  bgcolor: formData.color, 
                  filter: 'brightness(0.9)' 
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground'
                }
              }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog de Términos y Condiciones */}
      <Dialog 
        open={termsDialogOpen} 
        onClose={handleCloseTermsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Términos y Condiciones - {selectedServiceForTerms?.name}
          <IconButton onClick={handleCloseTermsDialog} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Select de profesional (solo para admin) */}
            {user?.role === 'admin' && selectedServiceForTerms && (
              <FormControl fullWidth>
                <InputLabel>Seleccionar Profesional</InputLabel>
                <Select
                  value={selectedProfessionalId || ''}
                  onChange={(e) => handleProfessionalChange(e.target.value as number)}
                  label="Seleccionar Profesional"
                >
                  {selectedServiceForTerms.professionals?.map((prof) => (
                    <MenuItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Loading */}
            {loadingTerms && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Contenido de términos */}
            {!loadingTerms && selectedProfessionalId && (
              <TextField
                label="Términos y Condiciones"
                multiline
                rows={15}
                fullWidth
                value={termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                disabled={isReadOnly}
                placeholder={isReadOnly 
                  ? "No hay términos configurados" 
                  : "Ingrese los términos y condiciones para esta especialidad..."}
                helperText={
                  isReadOnly 
                    ? "No puedes editar los términos y condiciones"
                    : canEditTerms 
                      ? "Escribe o pega los términos y condiciones. Puedes usar saltos de línea."
                      : ""
                }
              />
            )}

            {/* Mensaje si no hay profesional seleccionado */}
            {!selectedProfessionalId && user?.role === 'admin' && (
              <Alert severity="warning">
                Selecciona un profesional para ver o editar sus términos y condiciones
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseTermsDialog} color="inherit">
            {isReadOnly ? 'Cerrar' : 'Cancelar'}
          </Button>
          {canEditTerms && selectedProfessionalId && (
            <Button
              variant="contained"
              onClick={handleSaveTerms}
              disabled={savingTerms || !termsContent.trim()}
              startIcon={savingTerms ? <CircularProgress size={20} /> : null}
            >
              {savingTerms ? 'Guardando...' : 'Guardar Términos'}
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
    </Box>
  );
}