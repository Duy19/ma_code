import { useState } from "react";
import SchedulerCanvas from "../../components/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import TutorialScenario from "../../components/tutorial/TutorialScenario";
import FreeSchedulerSidebar from "../../components/FreeSchedulerSidebar";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateEDF } from "../../logic/simulator";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Example Taskset
const BASE_TASKS: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 4, D: 4, O: 1, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 0, T: 24, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 6, D: 6, color: "#34d399" },
];

const STORY = [
  {
    text: "Stelle nun die Hinderniserkennung selber ein und überprüfe dein Ergebnis. Achte darauf dass **vor jeder Bremsaufgabe** mindestens **ein Sensorlauf** stattgefunden hat und **keine Aufgabe zu spät** fertig wird.",
    highlight: null,
  },
  {
    text: "Du musst hier lediglich die Dauer **C (Execution)** der Sensorfunktion und das Intervall **T (Period)** in der sie erscheint.",
    highlight: null,
  }
];

export default function Tutorial3() {
  const navigate = useNavigate();
  const hyperperiod = 24;

  const [inputTasks, setInputTasks] = useState(structuredClone(BASE_TASKS));
  const [activeTasks, setActiveTasks] = useState(structuredClone(BASE_TASKS));
  const [checked, setChecked] = useState(false);
  const [crash, setCrash] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const [step, setStep] = useState(0);

  const schedule: ScheduleEntry[] = simulateEDF(activeTasks, hyperperiod);
  const currentStep = STORY[step];

  // Task-Check
  const handleCheck = () => {
    const sensor = inputTasks.find(t => t.id === "sensor");
    if (!sensor) return;

    const correct = sensor.C === 1 && sensor.T >= 3 && sensor.T <= 4;
    setActiveTasks(structuredClone(inputTasks));
    setCrash(!correct);
    setChecked(true);
  };

  // Restart Scene
  const handleRetry = () => {
    setInputTasks(structuredClone(BASE_TASKS));
    setActiveTasks(structuredClone(BASE_TASKS));
    setChecked(false);
    setCrash(false);
    setSceneKey(k => k + 1);
    setStep(0);
  };

  return (
    <div style={{ display: "flex", height: "100%"}}>
      {/* Left part of the Site (Mr.Tau + Car Scene + Canvas) */}
      <div style={{ flex: "0 0 80%", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* At the Top Mr.Tau and Car Scene */}
        <div style={{ flex: "0 0 25%", display: "flex", justifyContent: "space-between", alignItems: "center", WebkitJustifyContent: "flex-start", gap: 40, paddingLeft: 40, paddingTop: 20 }}>
          <TutorialOverlay visible text={currentStep.text} onNext={() => setStep(s => Math.min(s + 1, STORY.length - 1))} />
          <TutorialScenario
            key={sceneKey}
            step={checked ? 1 : 0}
            totalSteps={2}
            stopBeforeObstacle={checked && !crash}
            crash={checked && crash}
          />
        </div>

        {/* Schedulercanvas */}
        <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20}}>
          <SchedulerCanvas
            tasks={activeTasks}
            hyperperiod={hyperperiod}
            schedule={schedule}
            pxPerStep={28}
            leftLabelWidth={140}
          />
        </div>
      </div>

      {/* Right part of the Site (Sidebar + Buttons) */}
      <div style={{ flex: "0 0 20%", display: "flex", flexDirection: "column", boxSizing: "border-box" , overflow: "hidden", height: "100%"}}>
        {/* Sidebar */}
        <div style={{overflowY: "auto"}}>
          <FreeSchedulerSidebar
            tasks={inputTasks}
            onTasksChange={setInputTasks}
            algorithm="EDF"
            onClose={() => {}}
            visibility={{
              showExecutionTime: true,
              showPeriods: true,
              showDeadlines: true,
              showOffsets: false,
              showSuspension: false,
              showTaskControls: false,
              showTaskNames: false,
              showAlgorithmSelection: false,
            }}
            isFieldEditable={(task, field) =>
              task.id === "sensor" && (field === "C" || field === "T")
            }
          />
        </div>

        {/* Buttons */}
        <Stack p={2} spacing={1}>
          {!checked && <Button variant="outlined" onClick={handleCheck}>Überprüfen</Button>}
          {checked &&  <Button variant="outlined" sx={{borderColor: "#d32f2f", color: "#d32f2f"}} onClick={handleRetry}>Nochmal</Button>}
          {checked && !crash && <Button variant="outlined" sx={{borderColor: "#2e7d32", color: "#2e7d32"}} onClick={() => navigate("/")}>Geschafft!</Button>}
        </Stack>
      </div>
    </div>
  );
}
