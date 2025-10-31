import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, Container } from "@mui/material";

export default function PublicLayout() {
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="static" color="secondary" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Box
            component="img"
            src="/Cuad.svg"
            alt="Cuad"
            sx={{ height: 48, cursor: "pointer" }}
            onClick={() => navigate("/centro-de-salud-cuad/public")}
          />

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button variant="contained"
              color="primary" onClick={() => navigate("reservar")}>
              Reservar hora
            </Button>
            <Button color="inherit" onClick={() => navigate("especialidades")}>
              Especialidades
            </Button>
            <Button color="inherit" onClick={() => navigate("profesionales")}>
              Profesionales
            </Button>
            <Button color="inherit" onClick={() => navigate("nosotros")}>
              Nosotros
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/centro-de-salud-cuad/login")}
              sx={{ ml: 2, fontWeight: "bold" }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}