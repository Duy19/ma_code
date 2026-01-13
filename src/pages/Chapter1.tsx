import { useState, useEffect } from "react";
import { simulateEDF } from "../logic/simulator";
import InteractiveSchedulerCanvas from "../components/InteractiveSchedulerCanvas";
import TutorialOverlay from "../components/tutorial/TutorialOverlay";
import FreeSchedulerSidebar from "../components/FreeSchedulerSidebar";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Task } from "../core/task";
import { useHints } from "../logic/HintManager";
import HintCheckboxes from "../components/HintCheckboxes";

const BASE_TASKS: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 4, D: 4, O: 0, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 1, D: 4, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 6, D: 6, color: "#34d399" },
];

const STORY = [
  { text: "Stelle nun die Hinderniserkennung selber ein ...", highlight: null },
  { text: "Du musst hier lediglich die Dauer C und das Intervall T einstellen.", highlight: null },
];

export default function TutorialInteractiveScheduler() {
  const navigate = useNavigate();
  const hyperperiod = 24;
  const correctSchedule = simulateEDF(BASE_TASKS, hyperperiod);

  // State for Tasks, Schedule, Hints, etc.
  const [inputTasks, setInputTasks] = useState(structuredClone(BASE_TASKS));
  const [activeTasks, setActiveTasks] = useState(structuredClone(BASE_TASKS));
  const [userScheduleRef, setUserScheduleRef] = useState<Record<string, Set<number>>>({});
  const [checked, setChecked] = useState(false);
  const [crash, setCrash] = useState(false);
  const [step, setStep] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const currentStep = STORY[step];

  // Hint Manager Hook
  const {
    hints,
    unlockHint,
    lockHint,
    setHintTask,
    getHintBlocks,
  } = useHints(BASE_TASKS, correctSchedule, failedCount);

  // Set which Task you want to show for the hints --> in this case media
  useEffect(() => {
    const execHint = hints.find(h => h.type === "fullExecution");
    if (execHint && !execHint.taskId) setHintTask(execHint.id, "media"); 
  }, [hints]);

  // Execution Blocks for hints
  const hintBlocks = getHintBlocks; // Execution Blocks

  // Visibility for Markers as hints
  const [visibility, setVisibility] = useState({
    showReleaseMarkers: false,
    showDeadlineMarkers: false,
  });

  // Which hints are allowed to be toggled
  const isHintAllowed = (hintId: string) => {
    const hint = hints.find(h => h.id === hintId);
    if (!hint) return false;
    return failedCount >= hint.unlockAt;
  };

  // TODO: Check Schedule ---> compare userScheduleRef with correctSchedule 
  const handleCheck = () => {
    const sensor = inputTasks.find(t => t.id === "sensor");
    if (!sensor) return;

    // Prüfen, ob die Eingabe korrekt ist
    const correct = sensor.C === 1 && sensor.T >= 3 && sensor.T <= 4;

    setActiveTasks(structuredClone(inputTasks));
    setCrash(!correct);
    setChecked(true);

    if (!correct) {
      // Increase failedCount for hints
      setFailedCount(fc => {
        const newFailedCount = fc + 1;

        // Unlock hints based on new failed count
        hints.forEach(h => {
          if (newFailedCount >= h.unlockAt) unlockHint(h.id);
        });

        return newFailedCount;
      });
    }
  };

  const handleRetry = () => {
    setInputTasks(structuredClone(BASE_TASKS));
    setActiveTasks(structuredClone(BASE_TASKS));
    setUserScheduleRef({});
    setChecked(false);
    setCrash(false);
    setStep(0);
    setFailedCount(failedCount);
    hints.forEach(h => lockHint(h.id));
  };

  // Function to handle hint toggling
  const handleToggleHint = (hintId: string, enabled: boolean) => {
    const hint = hints.find(h => h.id === hintId);
    if (!hint) return;

    // Release and Deadline Marker Hints (switch visibility)
    if (hint.type === "releaseMarker") {
      setVisibility(v => ({ ...v, showReleaseMarkers: enabled }));
    }

    if (hint.type === "deadlineMarker") {
      setVisibility(v => ({ ...v, showDeadlineMarkers: enabled }));
    }

    // Task Execution hint
    if (enabled) {
      if (!hint.taskId) {
        if (hint.type === "fullExecution") {
          setHintTask(hint.id, "media");
        } else {
          BASE_TASKS.forEach(t => setHintTask(hint.id, t.id));
        }
      }
      unlockHint(hintId);
    } else {
      lockHint(hintId);
    }
  };


  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Mr. Tau + Schedulercanvas*/}
      <div style={{ flex: "0 0 80%", display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            flex: "0 0 25%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 40,
            paddingLeft: 40,
            paddingTop: 20,
          }}
        >
          <TutorialOverlay
            visible
            text={currentStep.text}
            onNext={() => setStep(s => Math.min(s + 1, STORY.length - 1))}
          />

          {/* Hint Checkboxes next to Mr.Tau*/}
          <HintCheckboxes
            hints={hints}
            isHintAllowed={isHintAllowed}
            onToggle={handleToggleHint}
          />
        </div>

        {/* Scheduler Canvas */}
        <div style={{ flex: 1, position: "relative", width: "100%", overflow: "hidden" }}>
          <InteractiveSchedulerCanvas
            tasks={activeTasks}
            hyperperiod={hyperperiod}
            schedule={correctSchedule}
            userScheduleRef={userScheduleRef}
            setUserScheduleRef={setUserScheduleRef}
            pxPerStep={35}
            heightPerTask={100}
            leftLabelWidth={140}
            hintBlocks={hintBlocks}
            visibility={visibility}
          />
        </div>
      </div>

      {/* Sidebar + Buttons on the right */}
      <div
        style={{
          flex: "0 0 20%",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          padding: 8,
          height: "100%",
        }}
      >
        <div
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
            paddingBottom: 8,
            border: "1px solid #eee",
            borderRadius: 4,
          }}
        >
          <FreeSchedulerSidebar
            tasks={BASE_TASKS}
            onTasksChange={() => {}}
            algorithm="EDF"
            onClose={() => {}}
            visibility={{
              showExecutionTime: true,
              showPeriods: true,
              showDeadlines: true,
              showOffsets: true,
              showSuspension: false,
              showTaskControls: false,
              showTaskNames: true,
              showAlgorithmSelection: true,
            }}
            isFieldEditable={() => false}
          />
        </div>

        <Stack p={2} spacing={1}>
          {!checked && (
            <Button variant="outlined" onClick={handleCheck}>
              Überprüfen
            </Button>
          )}
          {checked && (
            <Button
              variant="outlined"
              sx={{ borderColor: "#d32f2f", color: "#d32f2f" }}
              onClick={handleRetry}
            >
              Nochmal
            </Button>
          )}
          {checked && !crash && (
            <Button
              variant="outlined"
              sx={{ borderColor: "#2e7d32", color: "#2e7d32" }}
              onClick={() => navigate("/")}
            >
              Geschafft!
            </Button>
          )}
        </Stack>
      </div>
    </div>
  );
}
