import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItemButton, ListItemText, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const drawerWidth = 200;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            Encuadrado Admin
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Salir</Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
        }}
      >
        <Toolbar />
        <List>
          <ListItemButton component={Link} to="/dashboard">
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton component={Link} to="/paciente">
            <ListItemText primary="Vista Paciente" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}