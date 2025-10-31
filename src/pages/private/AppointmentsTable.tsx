import { useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import {
  Notes as NotesIcon,
  CheckCircle as CheckCircleIcon,
  PersonOff as PersonOffIcon,
  AccessTime as AccessTimeIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { api } from "../../api/apiClient";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

interface AppointmentsTableProps {
  appointments: any[];
  selectedStatus: string;
  onAppointmentsUpdate: () => void;
}

export default function AppointmentsTable({
  appointments,
  selectedStatus,
  onAppointmentsUpdate,
}: AppointmentsTableProps) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const getFilteredAppointments = () => {
    if (selectedStatus === 'all') {
      return appointments;
    }
    
    return appointments.filter(apt => {
      if (selectedStatus === 'to_confirm') {
        return apt.displayStatus === 'to_confirm';
      }
      return apt.status === selectedStatus;
    });
  };

  const filteredAppointments = getFilteredAppointments();

  const getStatusInfo = (appointment: any) => {
    const displayStatus = appointment.displayStatus || appointment.status;
    
    switch (displayStatus) {
      case 'pending':
        return { label: 'Pendiente', color: 'warning', icon: <AccessTimeIcon /> };
      case 'to_confirm':
        return { label: 'Por Confirmar', color: 'info', icon: <AccessTimeIcon /> };
      case 'confirmed':
        return { label: 'Confirmada', color: 'success', icon: <CheckCircleIcon /> };
      case 'cancelled':
        return { label: 'Cancelada', color: 'error', icon: <CancelIcon /> };
      case 'missed':
        return { label: 'Perdida', color: 'error', icon: <PersonOffIcon /> };
      default:
        return { label: displayStatus, color: 'default', icon: null };
    }
  };

  const canChangeStatus = (appointment: any) => {
    return appointment.displayStatus === 'to_confirm';
  };

  const handleOpenNotes = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      await api.put(`/appointments/${selectedAppointment.id}`, {
        notes: notes.trim(),
      });

      setSnackbar({
        open: true,
        message: "Notas guardadas exitosamente",
        severity: "success",
      });

      setNotesDialogOpen(false);
      onAppointmentsUpdate();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al guardar las notas",
        severity: "error",
      });
    }
  };

  const handleOpenConfirmDialog = (appointment: any, status: string) => {
    setSelectedAppointment(appointment);
    setNewStatus(status);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedAppointment || !newStatus) return;

    try {
      await api.put(`/appointments/${selectedAppointment.id}`, {
        status: newStatus,
      });

      setSnackbar({
        open: true,
        message: `Cita marcada como ${newStatus === 'confirmed' ? 'confirmada' : 'perdida'}`,
        severity: "success",
      });

      setConfirmDialogOpen(false);
      onAppointmentsUpdate();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al actualizar el estado",
        severity: "error",
      });
    }
  };

  if (filteredAppointments.length === 0) {
    return (
      <Alert severity="info">
        No hay citas en esta categoría
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Paciente</strong></TableCell>
                <TableCell><strong>Fecha y Hora</strong></TableCell>
                <TableCell><strong>Profesional</strong></TableCell>
                <TableCell><strong>Especialidad</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((appointment: any) => {
                const statusInfo = getStatusInfo(appointment);
                const canChange = canChangeStatus(appointment);

                return (
                  <TableRow key={appointment.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {appointment.patient.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.patient.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(appointment.date).format("DD/MM/YYYY")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {dayjs(appointment.date).format("HH:mm")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {appointment.professional.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={appointment.specialty.name}
                        size="small"
                        sx={{
                          bgcolor: appointment.specialty.color,
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color as any}
                        icon={statusInfo.icon}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Ver/Editar Notas">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenNotes(appointment)}
                          >
                            <Badge badgeContent={appointment.notes ? "!" : 0} color="secondary">
                              <NotesIcon />
                            </Badge>
                          </IconButton>
                        </Tooltip>

                        {canChange && (
                          <>
                            <Tooltip title="Confirmar Asistencia">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleOpenConfirmDialog(appointment, 'confirmed')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Marcar como Perdida">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenConfirmDialog(appointment, 'missed')}
                              >
                                <PersonOffIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal de Notas */}
      <Dialog open={notesDialogOpen} onClose={() => setNotesDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <DescriptionIcon color="primary" />
            <Typography variant="h6">Notas de la Cita</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Paciente:</strong> {selectedAppointment.patient.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha:</strong> {dayjs(selectedAppointment.date).format("DD/MM/YYYY HH:mm")}
                </Typography>
                <Typography variant="body2">
                  <strong>Especialidad:</strong> {selectedAppointment.specialty.name}
                </Typography>
              </Alert>
              <TextField
                label="Notas de la consulta"
                multiline
                rows={6}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe aquí las notas de la consulta..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNotesDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveNotes} startIcon={<NotesIcon />}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {newStatus === 'confirmed' ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h6">Confirmar Asistencia</Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonOffIcon color="error" sx={{ fontSize: 32 }} />
              <Typography variant="h6">Marcar como Perdida</Typography>
            </Stack>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Alert severity={newStatus === 'confirmed' ? 'success' : 'warning'}>
              {newStatus === 'confirmed' ? (
                <>¿Confirmas que el paciente <strong>{selectedAppointment.patient.name}</strong> asistió?</>
              ) : (
                <>¿Confirmas que el paciente <strong>{selectedAppointment.patient.name}</strong> NO asistió?</>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmStatus}
            color={newStatus === 'confirmed' ? 'success' : 'error'}
            startIcon={newStatus === 'confirmed' ? <CheckCircleIcon /> : <PersonOffIcon />}
          >
            {newStatus === 'confirmed' ? 'Confirmar' : 'Marcar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}