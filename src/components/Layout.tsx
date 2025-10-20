import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Outlet, Link } from "react-router-dom";
import HomeButton from "../components/HomeButton";

export default function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ position: "relative", justifyContent: "center" }}>

          <Box sx={{position: "absolute", left: 16 }}>
            <HomeButton />
          </Box>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="inherit" component={Link} to="/freeScheduler">
              FreeScheduler
            </Button>
            <Button color="inherit" component={Link} to="/chapter1">
              Chapter 1
            </Button>
            <Button color="inherit" component={Link} to="/chapter2">
              Chapter 2
            </Button>
            <Button color="inherit" component={Link} to="/chapter3">
              Chapter 3
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hier erscheinen die Seiteninhalte */}
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
