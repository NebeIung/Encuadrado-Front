import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  Divider,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Circle as CircleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { MuiColorInput } from 'mui-color-input';
import { api } from "../../api/apiClient";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  professionals_count?: number;
  professionals?: Array<{ id: number; name: string; }>;
}

export default function ServicesManagement() {
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
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
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price,
        color: service.color || "#1976d2",
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        duration: 60,
        price: 0,
        color: "#1976d2",
      });
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
  };

  const handleSave = async () => {
    try {
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
    
    // Verificar si hay profesionales asignados
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

  const handleColorChange = (newColor: string) => {
    setFormData({ ...formData, color: newColor });
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
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Gestión de Servicios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Servicio
        </Button>
      </Box>

      {services.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No hay servicios registrados. Haz clic en "Nuevo Servicio" para crear uno.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {services.map((service) => (
            <Card key={service.id} sx={{ 
              transition: 'all 0.2s',
              borderLeft: `4px solid ${service.color}`,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CircleIcon sx={{ fontSize: 16, color: service.color }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {service.name}
                      </Typography>
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
                        label={`$${service.price.toLocaleString()}`} 
                        size="medium" 
                        sx={{
                          bgcolor: service.color,
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                      
                      <Tooltip 
                        title={getProfessionalsTooltip(service)}
                        arrow
                        placement="top"
                      >
                        <Chip
                          avatar={
                            <Avatar 
                              sx={{ 
                                bgcolor: service.professionals_count && service.professionals_count > 0 
                                  ? 'success.main' 
                                  : 'grey.400',
                                width: 24,
                                height: 24,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                          }
                          label={`${service.professionals_count || 0} profesional${(service.professionals_count || 0) !== 1 ? 'es' : ''}`}
                          size="medium"
                          variant="outlined"
                          color={service.professionals_count && service.professionals_count > 0 ? "success" : "default"}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        />
                      </Tooltip>
                    </Stack>
                  </Box>
                  
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
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
        keepMounted={false}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingService ? "Editar Servicio" : "Nuevo Servicio"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
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
              <Typography variant="subtitle2" gutterBottom>
                Color del Servicio
              </Typography>
              <MuiColorInput 
                value={formData.color} 
                onChange={handleColorChange}
                format="hex"
                fullWidth
                helperText="Selecciona un color representativo para este servicio"
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
              type="number"
              fullWidth
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              helperText="Precio del servicio en pesos"
              inputProps={{ min: 0, step: 1000 }}
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