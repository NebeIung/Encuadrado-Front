import { Typography } from "@mui/material";
import AppointmentsTable from "../../components/AppointmentsTable";
import { useAppointments } from "../../hooks/useAppointments";
import { useMemo } from "react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: appointments = [], isLoading } = useAppointments(user.user);

  return (
    <>
      <Typography variant="h4" mb={2}>Dashboard</Typography>
      <Typography variant="h6" mb={3}>
        Hola {user.name ?? user.user} 👋 ({user.role})
      </Typography>

      {isLoading && <p>Cargando...</p>}

      {!isLoading && (
        <>
          <Typography variant="h6" mb={1}>
            Total de citas: {appointments.length}
          </Typography>

          <AppointmentsTable appointments={appointments} />
        </>
      )}
    </>
  );
}