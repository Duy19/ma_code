// @ts-nocheck
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { computeWCRT } from "../../logic/simulator";
import type { StoryStep, CheckFunctionState } from "./types";

/**
 * Utility functions and handlers for tutorial interactions
 * Handles checking, navigation, and validation logic
 * Add new checking function here as needed
 */

interface CheckHandlerParams {
  currentStep: StoryStep;
  currentTasks: Task[];
  baseTasks: Task[];
  visibleTasks: Task[];
  userScheduleRef: Record<string, Set<number>>;
  correctScheduleMap: Record<string, Set<number>>;
  correctSchedule: ScheduleEntry[];
  cumulativeState: any;
  setWcrtCorrect: (correct: boolean) => void;
  setScheduleCorrect: (correct: boolean) => void;
  setCustomCheckCorrect: (correct: boolean) => void;
  setFailedCount: (fn: (count: number) => number) => void;
  effectiveCanvasMode: "interactive" | "default";
}

/**
 * handleCheck validates user's solution
 * Handles WCRT checks, custom checks, and default schedule checks
 */
export function handleCheck(params: CheckHandlerParams): void {
  const {
    currentStep,
    currentTasks,
    baseTasks,
    visibleTasks,
    userScheduleRef,
    correctScheduleMap,
    correctSchedule,
    cumulativeState,
    setWcrtCorrect,
    setScheduleCorrect,
    setCustomCheckCorrect,
    setFailedCount,
    effectiveCanvasMode,
  } = params;

  // Check if this step requires WCRT validation
  if (currentStep?.wcrtTaskId) {
    const targetTask = currentTasks.find((t) => t.id === currentStep.wcrtTaskId);
    if (!targetTask) {
      alert("❌ Task not found for WCRT check");
      setFailedCount((fc) => fc + 1);
      return;
    }

    // Compute theoretical WCRT from base tasks
    const baseTask = baseTasks.find((t) => t.id === currentStep.wcrtTaskId);
    if (!baseTask) {
      alert("❌ Task not found in base tasks for WCRT check");
      setFailedCount((fc) => fc + 1);
      return;
    }
    const baseHigherPrio = baseTasks.filter((t) => t.T < baseTask.T);
    const theoreticalWCRT = computeWCRT(baseTask, baseHigherPrio);

    // Find actual WCRT by examining the schedule for each release
    const taskExecutions = correctScheduleMap[targetTask.id] ?? new Set();
    let maxActualRT = 0;

    // Check each release of the target task within the hyperperiod
    for (let k = 0; k * targetTask.T + (targetTask.O ?? 0) < cumulativeState.hyperperiod; k++) {
      const releaseTime = (targetTask.O ?? 0) + k * targetTask.T;
      const nextReleaseTime = releaseTime + targetTask.T;
      
      // Find when this specific job finishes
      let finishTime = releaseTime;
      
      for (let t = releaseTime; t < nextReleaseTime && t < cumulativeState.hyperperiod; t++) {
        if (taskExecutions.has(t)) {
          finishTime = t + 1;
        }
      }
      
      const responseTime = finishTime - releaseTime;
      maxActualRT = Math.max(maxActualRT, responseTime);
    }
    
    const ok = maxActualRT === theoreticalWCRT;
    setWcrtCorrect(ok);
    if (!ok) {
      alert(`❌ Nicht ganz. Finde die WCRT vom ${targetTask.name} Task!\nAktuelle WCRT: ${maxActualRT}\nKorrekte WCRT: ${theoreticalWCRT}`);
      setFailedCount((fc) => fc + 1);
    } else {
      alert(`✅ Super! Du hast die WCRT herausgefunden!\nWCRT: ${theoreticalWCRT}`);
    }
    return;
  }

  // Use custom check function if provided by the current step
  let ok: boolean;
  
  if (cumulativeState.checkFunction) {
    ok = cumulativeState.checkFunction({
      userScheduleRef,
      inputTasks: currentTasks,
      correctSchedule,
      baseTasks,
      visibleTasks,
      canvasMode: effectiveCanvasMode,
    });
    setCustomCheckCorrect(ok);
  } else {
    // Default check: compare user schedule with correct schedule for ALL tasks
    ok = currentTasks.every((task) => {
      const user = userScheduleRef[task.id] ?? new Set();
      const correct = correctScheduleMap[task.id] ?? new Set();
      return user.size === correct.size && [...user].every((t) => correct.has(t));
    });
    setScheduleCorrect(ok);
  }

  if (ok) {
    alert("✅ Sehr gut! Deine Lösung ist richtig!");
  } else {
    alert("❌ Das ist leider nicht ganz richtig. Versuche es nochmal!");
    setFailedCount((fc) => fc + 1);
  }
}

/**
 * RetryHandler clears all user progress and returns to first step
 */
export interface RetryHandlerParams {
  setUserScheduleRef: (ref: Record<string, Set<number>>) => void;
  setUserInputTasks: (tasks: Task[] | undefined) => void;
  setUserSelectedAlgorithm: (algorithm: string | undefined) => void;
  setUserManuallyChangedAlgorithm: (changed: boolean) => void;
  setStep: (step: number) => void;
  setFailedCount: (count: number) => void;
  setWcrtCorrect: (correct: boolean) => void;
  setScheduleCorrect: (correct: boolean) => void;
  setCustomCheckCorrect: (correct: boolean) => void;
  hints: any[];
  lockHint: (hintId: string) => void;
}

export function handleRetry(params: RetryHandlerParams): void {
  const {
    setUserScheduleRef,
    setUserInputTasks,
    setUserSelectedAlgorithm,
    setUserManuallyChangedAlgorithm,
    setStep,
    setFailedCount,
    setWcrtCorrect,
    setScheduleCorrect,
    setCustomCheckCorrect,
    hints,
    lockHint,
  } = params;

  setUserScheduleRef({});
  setUserInputTasks(undefined);
  setUserSelectedAlgorithm(undefined);
  setUserManuallyChangedAlgorithm(false);
  setStep(0);
  setFailedCount(0);
  setWcrtCorrect(false);
  setScheduleCorrect(false);
  setCustomCheckCorrect(false);
  hints.forEach((h) => lockHint(h.id));
}

/**
 * NextStepHandler manages progression to the next tutorial step
 */
export interface NextStepHandlerParams {
  currentStep: StoryStep;
  userSelectedAlgorithm?: string;
  failedCount: number;
  wcrtCorrect: boolean;
  scheduleCorrect: boolean;
  customCheckCorrect: boolean;
  quizCompleted: boolean;
  dropGameCompleted: boolean;
  navigate: (path: string) => void;
  setStep: (fn: (s: number) => number) => void;
  storyLength: number;
}

/**
 * handleNextStep advances to the next step or navigates as needed
 */

export function handleNextStep(
  params: NextStepHandlerParams,
  overrideQuizCompleted?: boolean,
  overrideDropGameCompleted?: boolean
): void {
  const {
    currentStep,
    userSelectedAlgorithm,
    failedCount,
    wcrtCorrect,
    scheduleCorrect,
    customCheckCorrect,
    quizCompleted,
    dropGameCompleted,
    navigate,
    setStep,
    storyLength,
  } = params;

  if (currentStep?.waitFor) {
    const ready = currentStep.waitFor({
      selectedAlgorithm: userSelectedAlgorithm,
      failedCount,
      wcrtCorrect,
      scheduleCorrect,
      customCheckCorrect,
      quizCompleted: overrideQuizCompleted ?? quizCompleted,
      dropGameCompleted: overrideDropGameCompleted ?? dropGameCompleted,
    });
    if (!ready) return;
  }

  if (currentStep?.navigateTo) {
    navigate(currentStep.navigateTo);
  } else {
    setStep((s) => Math.min(s + 1, storyLength - 1));
  }
}

/**
 * HintToggleHandler enables/disables hints and updates visibility
 */
export interface HintToggleParams {
  hintId: string;
  enabled: boolean;
  hints: any[];
  currentTasks: Task[];
  setVisibility: (fn: (v: any) => any) => void;
  unlockHint: (hintId: string) => void;
  lockHint: (hintId: string) => void;
  setHintTask: (hintId: string, taskId: string) => void;
}

export function handleToggleHint(params: HintToggleParams): void {
  const {
    hintId,
    enabled,
    hints,
    currentTasks,
    setVisibility,
    unlockHint,
    lockHint,
    setHintTask,
  } = params;

  const hint = hints.find((h) => h.id === hintId);
  if (!hint) return;

  if (hint.type === "releaseMarker")
    setVisibility((v) => ({ ...v, showReleaseMarkers: enabled }));
  if (hint.type === "deadlineMarker")
    setVisibility((v) => ({ ...v, showDeadlineMarkers: enabled }));

  if (enabled) {
    if (!hint.taskId) {
      if (hint.type === "fullExecution") setHintTask(hint.id, "media");
      else currentTasks.forEach((t) => setHintTask(hint.id, t.id));
    }
    unlockHint(hintId);
  } else {
    lockHint(hintId);
  }
}
