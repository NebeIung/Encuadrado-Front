import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemText, 
  Button,
  Divider,
  ListItemIcon
} from "@mui/material";
import { 
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  MedicalServices as ServicesIcon,
  Public as PublicIcon,
  Group as GroupIcon
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth, RoleBadge, CanAccess } from "../contexts/AuthContext";

const drawerWidth = 240;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            Centro Médico Cuad
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user && (
              <>
                <Typography variant="body2">
                  {user.name}
                </Typography>
                <RoleBadge />
              </>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { 
            width: drawerWidth, 
            boxSizing: "border-box" 
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {/* Dashboard - Todos pueden ver */}
            <ListItemButton component={Link} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            {/* Configuración del Centro - Solo Admin */}
            <CanAccess permission="canEditCenter">
              <ListItemButton component={Link} to="/settings">
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Configuración" />
              </ListItemButton>
            </CanAccess>

            {/* Servicios - Solo Admin */}
            <CanAccess permission="canManageServices">
              <ListItemButton component={Link} to="/services">
                <ListItemIcon>
                  <ServicesIcon />
                </ListItemIcon>
                <ListItemText primary="Servicios" />
              </ListItemButton>
            </CanAccess>

            {/* Profesionales - Solo Admin */}
            <CanAccess permission="canManageProfessionals">
              <ListItemButton component={Link} to="/professionals">
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary="Profesionales" />
              </ListItemButton>
            </CanAccess>

            <Divider sx={{ my: 1 }} />

            {/* Vista Pública - Todos pueden ver */}
            <ListItemButton component={Link} to="/public">
              <ListItemIcon>
                <PublicIcon />
              </ListItemIcon>
              <ListItemText primary="Vista Pública" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          ml: `${drawerWidth}px`,
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
}