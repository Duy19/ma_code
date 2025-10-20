import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero Section */}
      <Container
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Willkommen 🚀
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Starte deinen Einstieg in die Welt der Real-Time Systems!
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="/chapter1"
          sx={{ mt: 4 }}
        >
          Beginnen
        </Button>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Real-Time Games. Alle Rechte vorbehalten.
        </Typography>
      </Box>
    </Box>
  );
}
