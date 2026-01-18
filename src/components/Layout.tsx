import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Outlet, Link } from "react-router-dom";
import HomeButton from "../components/HomeButton";

export default function Layout() {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column"}}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ height: "6vh", justifyContent: "center" }}
      >

        <Toolbar sx={{ position: "relative", justifyContent: "center" }}>
          {/* Home Button at top-left corner */}
          <Box sx={{ position: "absolute", left: 16 }}>
            <HomeButton />
          </Box>

          {/* Navigation centered with links to the pages */}
          <Box sx={{ display: "flex", gap: 2, position: "absolute" }}>
            <Button component={Link} to="/freeScheduler">FreeScheduler</Button>
            <Button component={Link} to="/chapter1_1">Chapter 1</Button>
            <Button component={Link} to="/chapter2_1">Chapter 2</Button>
            <Button component={Link} to="/chapter3">Chapter 3</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content area where routed components will be rendered */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
