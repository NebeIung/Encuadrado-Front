import { Outlet, useNavigate } from "react-router-dom";
import { 
  Container, 
  AppBar, 
  Toolbar, 
  Button,
  Box
} from "@mui/material";

export default function PublicLayout() {
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="static" color="secondary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box 
            component="img"
            src="/Cuad.svg"
            alt="Logo"
            sx={{ 
              height: 100, 
              cursor: "pointer"
            }}
            onClick={() => navigate("/")}
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button color="inherit" onClick={() => navigate("/public/reservar")}>
              Reservar hora
            </Button>
            <Button color="inherit" onClick={() => navigate("/public/especialidades")}>
              Especialidades
            </Button>
            <Button color="inherit" onClick={() => navigate("/public/profesionales")}>
              Profesionales
            </Button>
            <Button color="inherit" onClick={() => navigate("/public/nosotros")}>
              Nosotros
            </Button>
            <Button color="inherit" onClick={() => navigate("/public/terminos")}>
              Términos y Condiciones
            </Button>
            <Button 
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
              sx={{ 
                ml: 2,
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "primary.dark"
                }
              }}
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