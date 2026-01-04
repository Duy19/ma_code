import { useState } from "react";
import SchedulerCanvas from "../components/SchedulerCanvas";
import TutorialOverlay from "../components/tutorial/TutorialOverlay";
import TutorialScenario from "../components/tutorial/TutorialScenario";
import FreeSchedulerSidebar from "../components/FreeSchedulerSidebar";
import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";
import { simulateEDF } from "../logic/simulator";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Example Taskset
const BASE_TASKS: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 4, D: 4, O: 1, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 0, T: 0, D: 4, color: "#60a5fa" },
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

  const [inputTasks, setInputTasks] = useState<Task[]>(structuredClone(BASE_TASKS));
  const [activeTasks, setActiveTasks] = useState<Task[]>(structuredClone(BASE_TASKS));
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

  const handleNext = () => {
    if (step < STORY.length - 1) {
      setStep(s => s + 1);
    }
  };

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "520px", position: "relative" }}>
      {/* Scheduler */}
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ width: "70%", height: "400px", border: "1px solid #ddd" }}>
          <SchedulerCanvas
            tasks={activeTasks}
            hyperperiod={hyperperiod}
            schedule={schedule}
            pxPerStep={28}
            leftLabelWidth={140}
            visibility={{
              showTaskLabels: true,
              showXAxis: true,
              showYAxis: false,
              showTimeTicks: false,
              showExecutionBlocks: true,
              showReleaseMarkers: true,
              showDeadlineMarkers: false,
            }}
            highlight={currentStep.highlight ?? (checked ? "sensor" : null)}
          />
        </div>

        {/* Mr. Tau */}
        <div style={{ position: "absolute", bottom: 16, left: 16, width: "60%" }}>
          <TutorialOverlay
            visible
            text={currentStep.text}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* Car Scene */}
      <div style={{ position: "absolute", bottom: 0, right: 520, width: 220, height: 140, textAlign: "center" }}>
        <TutorialScenario
          key={sceneKey}
          step={checked ? 1 : 0}
          totalSteps={2}
          stopBeforeObstacle={checked && !crash}
          crash={checked && crash}
        />

        <Stack mt={4} alignItems={"flex-end"}>
          {checked && crash && (
            <Button variant="outlined" color="error" onClick={handleRetry}>
              Nochmal
            </Button>
          )}

          {checked && !crash && (
            <Button variant="contained" color="success" onClick={() => navigate("/")}>
              Geschafft!
            </Button>
          )}
        </Stack>
      </div>

      {/* Sidebar */}
      <div style={{
        position: "fixed",
        right: 0,
        top: 0,
        height: "100%",
        background: "white",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <FreeSchedulerSidebar
          tasks={inputTasks}
          onTasksChange={setInputTasks}
          algorithm="EDF"
          onClose={() => {}}
          visibility={{
            showExecutionTime: true,
            showPeriods: true,
            showDeadlines: false,
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

        <Button variant="contained" color="primary" onClick={handleCheck} disabled={checked} sx={{ m: 2 }}>
          Überprüfen
        </Button>
      </div>
    </div>
  );
}
