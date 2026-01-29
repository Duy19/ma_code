import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Fade } from "@mui/material";
import { Outlet, Link, useLocation } from "react-router-dom";
import HomeButton from "./HomeButton";
import React from "react";

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
    
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
      {!isHomePage && (
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{ 
            height: "6vh", 
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            bgcolor: "rgba(255, 255, 255, 0.8)",
          }}
        >

          <Toolbar sx={{ position: "relative", justifyContent: "center" }}>
          {/* Home Button at top-left corner */}
          <Box sx={{ position: "absolute", left: 16 }}>
            <HomeButton />
          </Box>

          {/* Navigation centered with links to the pages */}
          <Box sx={{ display: "flex", gap: 2, position: "absolute" }}>
            <Button 
              id="freeScheduler" 
              component={Link} 
              to="/freeScheduler"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: "#6366f1",
                },
              }}
            >
              FreeScheduler
            </Button>
            <Button 
              id="tutorial" 
              component={Link} 
              to="/tutorial"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: "#6366f1",
                },
              }}
            >
              Tutorial
            </Button> 
            <Button 
              id="Chapter1" 
              aria-controls={open ? 'menu' : undefined} 
              aria-haspopup="true" 
              aria-expanded={open ? 'true' : undefined} 
              onClick={handleClick}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: "#6366f1",
                },
              }}
            >
              Chapter 1
            </Button>
            <Menu
              id="fade-menu-chapter1"
              slotProps={{
                list: {
                  'aria-labelledby': 'Chapter1',
                  sx: {
                    padding: 1,
                  },
                },
                paper: {
                  sx: {
                    backgroundColor: "#ffffff",
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    minWidth: 200,
                    mt: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  },
                },
              }}
              slots={{ transition: Fade }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem 
                onClick={handleClose} 
                component={Link} 
                to="/Chapter1_A"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#6366f120",
                    color: "#6366f1",
                  },
                }}
              >
                Earliest Deadline First
              </MenuItem>
              <MenuItem 
                onClick={handleClose} 
                component={Link} 
                to="/Chapter1_B"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#6366f120",
                    color: "#6366f1",
                  },
                }}
              >
                Fixed-Priority Scheduling
              </MenuItem>
              <MenuItem 
                onClick={handleClose} 
                component={Link} 
                to="/Chapter1_C"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#6366f120",
                    color: "#6366f1",
                  },
                }}
              >
                Scheduling Strategies Comparison
              </MenuItem>
              <MenuItem 
                onClick={handleClose} 
                component={Link} 
                to="/Chapter1_D"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#6366f120",
                    color: "#6366f1",
                  },
                }}
              >
                Draw Schedules
              </MenuItem>
              <MenuItem 
                onClick={handleClose} 
                component={Link} 
                to="/Chapter1_Quiz"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#6366f120",
                    color: "#6366f1",
                  },
                }}
              >
                Chapter 1 Quiz
              </MenuItem>
            </Menu>
            <Button 
              id="Chapter2" 
              aria-controls={open2 ? 'menu' : undefined} 
              aria-haspopup="true" 
              aria-expanded={open2 ? 'true' : undefined} 
              onClick={handleClick2}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: "#8b5cf6",
                },
              }}
            >
              Chapter 2
            </Button>
            <Menu
              id="fade-menu-chapter2"
              slotProps={{
                list: {
                  'aria-labelledby': 'Chapter2',
                  sx: {
                    padding: 1,
                  },
                },
                paper: {
                  sx: {
                    backgroundColor: "#ffffff",
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    minWidth: 200,
                    mt: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  },
                },
              }}
              slots={{ transition: Fade }}
              anchorEl={anchorEl2}
              open={open2}
              onClose={handleClose2}
            >
              <MenuItem 
                onClick={handleClose2} 
                component={Link} 
                to="/Chapter2_A"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#8b5cf620",
                    color: "#8b5cf6",
                  },
                }}
              >
                Critical Instant Theorem
              </MenuItem>
              <MenuItem 
                onClick={handleClose2} 
                component={Link} 
                to="/Chapter2_B"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#8b5cf620",
                    color: "#8b5cf6",
                  },
                }}
              >
                Time Demand Analysis
              </MenuItem>
              <MenuItem 
                onClick={handleClose2} 
                component={Link} 
                to="/Chapter2_C"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#8b5cf620",
                    color: "#8b5cf6",
                  },
                }}
              >
                Utilization Bounds
              </MenuItem>
              <MenuItem 
                onClick={handleClose2} 
                component={Link} 
                to="/Chapter2_Quiz"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#8b5cf620",
                    color: "#8b5cf6",
                  },
                }}
              >
                Chapter 2 Quiz
              </MenuItem>
              <MenuItem 
                onClick={handleClose2} 
                component={Link} 
                to="/Chapter2_DragDrop"
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&:hover": {
                    bgcolor: "#8b5cf620",
                    color: "#8b5cf6",
                  },
                }}
              >
                Drag & Drop Game
              </MenuItem>
            </Menu>
            
            <Button 
              id="Chapter3" 
              component={Link} 
              to="/Chapter3"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: "#ec4899",
                },
              }}
            >
              Chapter 3
            </Button>
            <Button 
              component={Link} 
              to="/drag-drop"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: "#10b981",
                },
              }}
            >
              Games
            </Button>
          </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Main content area where routed components will be rendered */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
