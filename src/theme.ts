import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff441c",
    },
    secondary: {
      main: "#f3f3f3ff",
    },
    background: {
      default: "#f5f6fa",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h4: { fontWeight: "bold" },
    h6: { fontWeight: 600 },
  },
});

export default theme;