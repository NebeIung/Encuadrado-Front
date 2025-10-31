import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        </Typography>

        {user ? (
          <Button color="inherit" onClick={handleLogout}>Salir</Button>
        ) : (
          <Button color="inherit" onClick={() => navigate("/centro-de-salud-cuad/login")}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}