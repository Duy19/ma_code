import {
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <Container
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Willkommen zu Real-Time Games!
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Starte deinen Einstieg in die Welt der Real-Time Systems! (Besserer Text folgt noch)
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/tutorial"
          sx={{ mt: 4 }}
        >
          Tutorial
        </Button>
      </Container>

      <Box component="footer" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Real-Time Games. Alle Rechte vorbehalten.
        </Typography>
      </Box>
    </Box>
  );
}
