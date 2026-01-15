// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { simulateRM } from "../../logic/simulator";
import InteractiveSchedulerCanvas from "../../components/InteractiveSchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import FreeSchedulerSidebar from "../../components/FreeSchedulerSidebar";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Task } from "../../core/task";
import { useHints } from "../../logic/HintManager";
import HintCheckboxes from "../../components/HintCheckboxes";

// Example for EDF vs RM 
const BASE_TASKS: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 4, D: 4, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 6, D: 6, color: "#34d399" },
];

const STORY = [
  { text: "Hier nochmal das ganze mit RM! Gleiche Aufgabe wie vorher und mal schauen ob du den Unterscheid verstanden hast.", highlight: null },
];

export default function TutorialInteractiveScheduler() {
  const navigate = useNavigate();
  const hyperperiod = 12;
  const correctSchedule = simulateRM(BASE_TASKS, hyperperiod);

  // States Tasks, Schedule, Hints, etc.
  const [inputTasks, setInputTasks] = useState(structuredClone(BASE_TASKS));
  const [activeTasks, setActiveTasks] = useState(structuredClone(BASE_TASKS));
  const [userScheduleRef, setUserScheduleRef] = useState<Record<string, Set<number>>>({});
  const [checked, setChecked] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [step, setStep] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const currentStep = STORY[step];

  // Hint Manager Hook
  const { hints, unlockHint, lockHint, setHintTask, getHintBlocks } = useHints(BASE_TASKS, correctSchedule, failedCount);

  // Execution Blocks for hints
  const hintBlocks = getHintBlocks;

  // Visibility for Markers as hints
  const [visibility, setVisibility] = useState({
    showReleaseMarkers: false,
    showDeadlineMarkers: false,
  });

  // Prepare correctSchedule map for fast lookup
  const correctScheduleMap = useMemo(() => {
    const map: Record<string, Set<number>> = {};
    BASE_TASKS.forEach(task => {
      map[task.id] = new Set(correctSchedule.filter(e => e.taskId === task.id).map(e => e.time));
    });
    return map;
  }, [correctSchedule]);

  // Set which Task you want to show for the hints --> in this case media
  useEffect(() => {
    const execHint = hints.find(h => h.type === "fullExecution");
    if (execHint && !execHint.taskId) setHintTask(execHint.id, "media");
  }, [hints]);

  // Check user schedule against correct schedule
  const handleCheck = () => {
    let allCorrectFlag = true;

    for (const task of BASE_TASKS) {
      const userTimes = userScheduleRef[task.id] ?? new Set<number>();
      const correctTimes = correctScheduleMap[task.id] ?? new Set<number>();
      if (userTimes.size !== correctTimes.size) {
        allCorrectFlag = false;
        break;
      }

      // Check all userTimes are in correctTimes
      for (const time of userTimes) {
        if (!correctTimes.has(time)) {
          allCorrectFlag = false;
          break;
        }
      }

      if (!allCorrectFlag) break;
    }
    setChecked(true);
    setAllCorrect(allCorrectFlag);

    if (!allCorrectFlag) setFailedCount(fc => fc + 1);
  };

  const handleRetry = () => {
    setInputTasks(structuredClone(BASE_TASKS));
    setActiveTasks(structuredClone(BASE_TASKS));
    setUserScheduleRef({});
    setChecked(false);
    setStep(0);
    setFailedCount(0);
    hints.forEach(h => lockHint(h.id));
  };

  const isHintAllowed = (hintId: string) => {
    const hint = hints.find(h => h.id === hintId);
    if (!hint) return false;
    return failedCount >= hint.unlockAt;
  };

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
    <div style={{ display: "flex", height: "100%" }}>
      {/* Mr. Tau + Schedulercanvas*/}
      <div style={{ flex: "0 0 80%", display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            flex: "0 0 25%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            WebkitJustifyContent: "flex-start",
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

        {/* Schedulercanvas */}
        <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20 }}>
          <InteractiveSchedulerCanvas
            tasks={activeTasks}
            hyperperiod={hyperperiod}
            schedule={correctSchedule}
            userScheduleRef={userScheduleRef}
            setUserScheduleRef={setUserScheduleRef}
            pxPerStep={30}
            heightPerTask={130}
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
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto" }}>
          <FreeSchedulerSidebar
            tasks={BASE_TASKS}
            onTasksChange={() => {}}
            algorithm="RM"
            onClose={() => {}}
            visibility={{
              showExecutionTime: true,
              showPeriods: true,
              showDeadlines: true,
              showOffsets: false,
              showSuspension: false,
              showTaskControls: false,
              showTaskNames: true,
              showAlgorithmSelection: true,
            }}
            isFieldEditable={() => false}
          />
        </div>

        {/* Buttons */}
        <Stack p={6} spacing={2}>
          <Button variant="outlined" onClick={handleCheck}>
            Überprüfen
          </Button>
          {allCorrect && (
            <Button variant="outlined" sx={{ borderColor: "#2e7d32", color: "#2e7d32" }} onClick={() => navigate("/chapter1_6")}>
              Geschafft!
            </Button>
          )}
        </Stack>
      </div>
    </div>
  );
}