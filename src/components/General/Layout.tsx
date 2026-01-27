import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Fade } from "@mui/material";
import { Outlet, Link } from "react-router-dom";
import HomeButton from "./HomeButton";
import React from "react";

export default function Layout() {
    
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorEl2, setAnchorEl2] = React.useState<null | HTMLElement>(null);
  const open2 = Boolean(anchorEl2);
  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

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
            <Button id="freeScheduler" component={Link} to="/freeScheduler">FreeScheduler</Button> 
            <Button id="Chapter1" aria-controls={open ? 'menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick}>Chapter 1</Button>
            <Menu
              id="fade-menu-chapter1"
              slotProps={{
                list: {
                  'aria-labelledby': 'Chapter1',
                  sx: {
                    padding: 0,
                  },
                },
                paper: {
                  sx: {
                    backgroundColor: "#ffffff",
                    color: "#5b87cc",
                    borderRadius: 3,
                    boxShadow: 5,
                    minWidth: 150,
                  },
                },
              }}
              slots={{ transition: Fade }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} component={Link} to="/Chapter1_A">Chapter1_A</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/Chapter1_B">Chapter1_B</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/Chapter1_C">Chapter1_C</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/Chapter1_D">Chapter1_D</MenuItem>
            </Menu>
            <Button id="Chapter2" aria-controls={open2 ? 'menu' : undefined} aria-haspopup="true" aria-expanded={open2 ? 'true' : undefined} onClick={handleClick2}>Chapter 2</Button>
            <Menu
              id="fade-menu-chapter2"
              slotProps={{
                list: {
                  'aria-labelledby': 'Chapter2',
                  sx: {
                    padding: 0,
                  },
                },
                paper: {
                  sx: {
                    backgroundColor: "#ffffff",
                    color: "#5b87cc",
                    borderRadius: 3,
                    boxShadow: 5,
                    minWidth: 150,
                  },
                },
              }}
              slots={{ transition: Fade }}
              anchorEl={anchorEl2}
              open={open2}
              onClose={handleClose2}
            >
              <MenuItem onClick={handleClose2} component={Link} to="/Chapter2_A">Chapter2_A</MenuItem>
              <MenuItem onClick={handleClose2} component={Link} to="/Chapter2_B">Chapter2_B</MenuItem>
              <MenuItem onClick={handleClose2} component={Link} to="/Chapter2_C">Chapter2_C</MenuItem>
            </Menu>
            
            <Button id="Chapter3" component={Link} to="/Chapter3">Chapter 3</Button>
            <Button component={Link} to="/drag-drop">Games</Button>
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
