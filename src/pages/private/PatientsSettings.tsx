import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { api } from "../../api/apiClient";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  rut?: string;
  birth_date?: string;
  address?: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rut: '',
    birth_date: null as Dayjs | null,
    address: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  // Función para verificar si el RUT está duplicado
  const isRutDuplicated = () => {
    if (!formData.rut.trim()) return false;
    
    return patients.some(
      patient => patient.rut === formData.rut && patient.id !== editingPatient?.id
    );
  };

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        rut: patient.rut || '',
        birth_date: patient.birth_date ? dayjs(patient.birth_date) : null,
        address: patient.address || '',
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        rut: '',
        birth_date: null,
        address: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPatient(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setSnackbar({
          open: true,
          message: 'El nombre no puede estar vacío',
          severity: 'error',
        });
        return;
      }

      if (!formData.email.trim()) {
        setSnackbar({
          open: true,
          message: 'El email no puede estar vacío',
          severity: 'error',
        });
        return;
      }

      if (!formData.phone.trim()) {
        setSnackbar({
          open: true,
          message: 'El teléfono no puede estar vacío',
          severity: 'error',
        });
        return;
      }
      
      if (isRutDuplicated()) {
        const existingPatient = patients.find(
          patient => patient.rut === formData.rut && patient.id !== editingPatient?.id
        );
        
        setSnackbar({
          open: true,
          message: `El RUT ${formData.rut} ya está registrado con el paciente "${existingPatient?.name}"`,
          severity: 'error',
        });
        return;
      }

      const payload = {
        ...formData,
        birth_date: formData.birth_date?.format('YYYY-MM-DD'),
      };

      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, payload);
        setSnackbar({
          open: true,
          message: 'Paciente actualizado exitosamente',
          severity: 'success',
        });
      } else {
        await api.post('/patients', payload);
        setSnackbar({
          open: true,
          message: 'Paciente creado exitosamente',
          severity: 'success',
        });
      }
      
      fetchPatients();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error al guardar el paciente',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este paciente?')) {
      try {
        await api.delete(`/patients/${id}`);
        setSnackbar({
          open: true,
          message: 'Paciente eliminado exitosamente',
          severity: 'success',
        });
        fetchPatients();
      } catch (error: any) {
        console.error('Error deleting patient:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.error || 'Error al eliminar el paciente',
          severity: 'error',
        });
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Gestión de Pacientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Paciente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>RUT</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell><strong>Fecha Nacimiento</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.rut || '-'}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>
                  {patient.birth_date ? dayjs(patient.birth_date).format('DD/MM/YYYY') : '-'}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDialog(patient)} size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(patient.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="RUT"
              fullWidth
              value={formData.rut}
              onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
              placeholder="12345678-9"
              error={isRutDuplicated()}
              helperText={
                isRutDuplicated()
                  ? `⚠️ El RUT ${formData.rut} ya está en uso`
                  : 'Formato: 12345678-9'
              }
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Teléfono"
              fullWidth
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <DatePicker
              label="Fecha de Nacimiento"
              value={formData.birth_date}
              onChange={(newValue) => setFormData({ ...formData, birth_date: newValue ? dayjs(newValue) : null })}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={isRutDuplicated()}
          >
            {editingPatient ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}