import SchedulerCanvas from "../components/SchedulerCanvas";
import type { Task } from "../core/task";
import FreeSchedulerSidebar from "../components/FreeSchedulerSidebar";
import { Box, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useState } from "react";
import { simulateEDF, type ScheduleEntry } from "../logic/simulator";
import { lcmArray } from "../utils/formulas";

const initialTasks: Task[] = [
  { id: "t1", name: "τ1", color: "#d8e68f", C: 3, T: 8, D: 8 },
  { id: "t2", name: "τ2", color: "#e3b47d", C: 2, T: 6, D: 6 },
  { id: "t3", name: "τ3", color: "#e17c7c", C: 2, T: 12, D: 12 },
];

export default function FreeScheduler() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const[algorithm, setAlgorithm] = useState<string>("EDF");
  const [hyperperiod, setHyperperiod] = useState(24);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  useEffect(() => {
  if (tasks.length === 0) return;

  // Hyperperiode = LCM aller Task-Perioden
  const periods = tasks.map(t => t.T);
  const hp = lcmArray(periods);
  setHyperperiod(hp);

  // Schedule berechnen
  let newSchedule: ScheduleEntry[] = [];
  if (algorithm === "EDF") {
    newSchedule = simulateEDF(tasks, hp);
  }
  // später: andere Algorithmen wie RM oder DM

  setSchedule(newSchedule);
}, [tasks, algorithm]);


  useEffect(() => {
    const newSchedule = simulateEDF(tasks, hyperperiod);
    setSchedule(newSchedule);
  }, [tasks, hyperperiod]);


  return (

    <Box sx={{ display: "flex", overflow: "hidden" }}>

      {!sidebarOpen && (
        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: (theme) => theme.zIndex.appBar + 1}}>
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
        <SchedulerCanvas tasks={tasks} hyperperiod={hyperperiod} schedule={schedule} pxPerStep={28} timeStepLabelEvery={2} />
      </Box>

      <Drawer         
        variant="persistent"
        anchor="right"
        open={sidebarOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 350, boxSizing: "border-box", p: 2},
        }}>
          <FreeSchedulerSidebar
            tasks={tasks}
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            onTasksChange={setTasks}
            onClose={() => setSidebarOpen(false)}
          />
      </Drawer>
    </Box>
  );
}
