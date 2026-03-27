import SchedulerCanvas from "../components/Scheduling/SchedulerCanvas";
import type { Task } from "../core/task";
import FreeSchedulerSidebar from "../components/Scheduling/FreeSchedulerSidebar";
import { Box, Drawer, IconButton, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DownloadIcon from "@mui/icons-material/Download";
import { useEffect, useRef, useState } from "react";
import { simulateEDF, simulateRM, simulateDM, type ScheduleEntry } from "../logic/simulator";
import { lcmArray } from "../utils/formulas";

const initialTasks: Task[] = [
];

export default function FreeScheduler() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const[algorithm, setAlgorithm] = useState<string>("EDF");
  const [hyperperiod, setHyperperiod] = useState(24);
  const [interval, setInterval] = useState<[number, number]>([0, 24]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const schedulerCanvasRef = useRef<any>(null);

  const handleIntervalChange = (newInterval: [number, number]) => {
    setInterval(newInterval);
    // Re-simulate with the length needed to cover the interval
    if (tasks.length > 0 && tasks.some(t => t.T && t.T > 0 && !isNaN(t.T))) {
      const simulationLength = Math.max(hyperperiod, newInterval[1]);
      let newSchedule: ScheduleEntry[] = [];
      if (algorithm === "EDF") {
        newSchedule = simulateEDF(tasks, simulationLength).schedule;
      } else if (algorithm === "RM") {
        newSchedule = simulateRM(tasks, simulationLength).schedule;
      } else if (algorithm === "DM") {
        newSchedule = simulateDM(tasks, simulationLength).schedule;
      }
      setSchedule(newSchedule);
    }
  };

  useEffect(() => {
  if (tasks.length === 0) return;

  // Validate that all tasks have valid periods (> 0)
  if (tasks.some(t => !t.T || t.T <= 0 || isNaN(t.T))) {
    return;
  }

  // Hyperperiod = LCM of all Task Periods
  const periods = tasks.map(t => t.T);
  const hp = lcmArray(periods);
  setHyperperiod(hp);
  setInterval([0, hp]);

  // Schedule based on selected algorithm
  
  let newSchedule: ScheduleEntry[] = [];
    if (algorithm === "EDF") {
      newSchedule = simulateEDF(tasks, hp).schedule;
    }

    else if (algorithm === "RM") {
      newSchedule = simulateRM(tasks, hp).schedule;
    }
    else if (algorithm === "DM") {
      newSchedule = simulateDM(tasks, hp).schedule;
    }
// TODO: Add more algorithms here as needed

  setSchedule(newSchedule);
}, [tasks, algorithm]);


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
          flexDirection: "column",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => schedulerCanvasRef.current?.downloadAsPNG()}
            disabled={!schedule || schedule.length === 0}
          >
            Save Schedule as PNG
          </Button>
        </Box>
        <SchedulerCanvas 
          ref={schedulerCanvasRef}
          tasks={tasks} 
          hyperperiod={hyperperiod} 
          schedule={schedule} 
          interval={interval} 
          pxPerStep={28} 
          rightPaddingSteps={4}
          timeStepLabelEvery={2} 
        />
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
            interval={interval}
            onIntervalChange={handleIntervalChange}
          />
      </Drawer>
    </Box>
  );
}
