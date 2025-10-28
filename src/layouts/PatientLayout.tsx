import { Outlet, Link } from "react-router-dom";
import { Box, Drawer, List, ListItemButton, ListItemText, AppBar, Toolbar, Button } from "@mui/material";

export default function PatientLayout() {
  const handleLogout = () => {
    localStorage.removeItem("patient");
    window.location.href = "/patient/login";
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer variant="permanent" sx={{ width: 240 }}>
        <Toolbar />
        <List sx={{ width: 240 }}>
          <ListItemButton component={Link} to="/patient/dashboard">
            <ListItemText primary="Reservar Hora" />
          </ListItemButton>
          <ListItemButton disabled>
            <ListItemText primary="Evaluaciones" />
          </ListItemButton>
          <ListItemButton disabled>
            <ListItemText primary="Recetas" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* Top bar */}
      <AppBar position="fixed" sx={{ ml: 240 }}>
        <Toolbar sx={{ justifyContent: "flex-end" }}>
          <Button color="inherit" onClick={handleLogout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}