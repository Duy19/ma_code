import SchedulerCanvas from "../components/SchedulerCanvas";
import type { Task } from "../core/task";
import { Box, Typography, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

const sampleTasks: Task[] = [
  { id: "t1", name: "τ1", color: "#d8e68f", C: 3, T: 8, D: 8 },
  { id: "t2", name: "τ2", color: "#e3b47d", C: 2, T: 6, D: 6 },
  { id: "t3", name: "τ3", color: "#e17c7c", C: 2, T: 12, D: 12 },
];

export default function FreeScheduler() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return ( 
    <Box sx={{ display: "flex", overflow: "hidden" }}>


      {!sidebarOpen && (
        <Box sx={{ position: "fixed", top: 64 + 16, right: 16, zIndex: (theme) => theme.zIndex.appBar + 1 }}>
          <IconButton onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Box>)}

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "left",
          alignItems: "left",
          overflow: "auto",
          p: 2,
        }}
      >
        <SchedulerCanvas tasks={sampleTasks as Task[]} hyperperiod={80} pxPerStep={28} timeStepLabelEvery={2} />
      </Box>

      <Drawer         
        variant="persistent"
        anchor="right"
        open={sidebarOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", p: 2, top: 64},
        }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={() => setSidebarOpen(false)}>
            <MenuIcon />
          </IconButton>
        </Box>
        <Typography variant="h6">Sidebar</Typography>
        <Typography></Typography>
      </Drawer>
    </Box>
  );
}
