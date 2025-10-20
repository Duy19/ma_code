import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // kannst du lassen oder ändern
    },
    background: {
      default: "#f5f5f5", // <-- hellgrau, neutraler Hintergrund
      paper: "#ffffff",   // für Karten und Flächen
    },
    text: {
      primary: "#000000",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
