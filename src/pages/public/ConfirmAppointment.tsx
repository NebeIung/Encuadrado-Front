import { useState } from "react";
import { TextField, Button, Typography, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ConfirmAppointment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const selectedService = JSON.parse(localStorage.getItem("selectedService") || "{}");
  const selectedProfessional = JSON.parse(localStorage.getItem("selectedProfessional") || "{}");
  const selectedDateTime = JSON.parse(localStorage.getItem("selectedDateTime") || "{}");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newAppointment = {
      id: Math.random(),
      patient: form.name,
      serviceId: selectedService.id,
      professionId: selectedProfessional.id,
      date: `${selectedDateTime.date} ${selectedDateTime.hour}`,
    };

    fetch("http://localhost:5000/create-appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppointment),
    }).then(() => {
      navigate("/public/success");
    });
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 450, mx: "auto" }}>
      <Typography variant="h5" mb={3}>
        Tus datos
      </Typography>

      <Stack spacing={2}>
        <TextField label="Nombre" name="name" fullWidth onChange={handleChange} />
        <TextField label="Correo" name="email" fullWidth onChange={handleChange} />
        <TextField label="Teléfono" name="phone" fullWidth onChange={handleChange} />

        <Button variant="contained" onClick={handleSubmit}>Confirmar</Button>
      </Stack>
    </Paper>
  );
}