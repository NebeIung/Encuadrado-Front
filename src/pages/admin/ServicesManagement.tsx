import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface Service {
  id: number;
  name: string;
  duration: number;
  price?: number;
}

export default function ServicesManagement() {
  const { hasPermission } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: "", duration: 30, price: 0 });
  const [error, setError] = useState("");

  // Cargar servicios
  useEffect(() => {
    fetch("http://localhost:5000/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => console.log("Error al cargar servicios"));
  }, []);

  const handleOpen = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        duration: service.duration,
        price: service.price || 0,
      });
    } else {
      setEditingService(null);
      setFormData({ name: "", duration: 30, price: 0 });
    }
    setOpen(true);
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    setEditingService(null);
    setFormData({ name: "", duration: 30, price: 0 });
    setError("");
  };

  const handleSave = async () => {
    if (!hasPermission("canManageServices")) {
      setError("No tienes permisos para gestionar servicios");
      return;
    }

    if (!formData.name.trim()) {
      setError("El nombre del servicio es requerido");
      return;
    }

    if (formData.duration <= 0) {
      setError("La duración debe ser mayor a 0");
      return;
    }

    try {
      const url = editingService
        ? `http://localhost:5000/services/${editingService.id}`
        : "http://localhost:5000/services";

      const method = editingService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al guardar");

      const updatedService = await response.json();

      if (editingService) {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? updatedService : s))
        );
      } else {
        setServices((prev) => [...prev, updatedService]);
      }

      handleClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el servicio");
    }
  };

  const handleDelete = async (id: number) => {
    if (!hasPermission("canManageServices")) {
      alert("No tienes permisos para eliminar servicios");
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      const response = await fetch(`http://localhost:5000/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Error al eliminar el servicio");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Gestión de Servicios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nuevo Servicio
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Duración (min)</strong></TableCell>
              <TableCell><strong>Precio (CLP)</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay servicios registrados
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>
                    {service.price ? `$${service.price.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(service)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(service.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? "Editar Servicio" : "Nuevo Servicio"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Nombre del Servicio"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            label="Duración (minutos)"
            type="number"
            fullWidth
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
            }
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Precio (CLP)"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
            }
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingService ? "Guardar Cambios" : "Crear Servicio"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}