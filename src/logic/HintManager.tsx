import { useState, useMemo } from "react";
import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";

export type HintType =
  | "fullExecution"
  | "releaseMarker"
  | "deadlineMarker";

export interface HintConfig {
  type: HintType;
  unlockAt: number;
}

export interface Hint {
  id: string;
  description: string;
  taskId?: string;
  type: HintType;
  unlocked: boolean;
  unlockAt: number; 
}

interface UseHintsParams {
  baseTasks?: Task[];
  correctSchedule?: ScheduleEntry[];
  failedCount?: number;
  hintConfig?: HintConfig[];
}

export function useHints(
  tasksOrParams: Task[] | UseHintsParams,
  schedule?: ScheduleEntry[],
  failedCount?: number
) {
  // Handle both old and new API
  let tasks: Task[] = [];
  let actualSchedule: ScheduleEntry[] = [];
  let actualFailedCount: number = 0;
  let customHintConfig: HintConfig[] | undefined;

  if (Array.isArray(tasksOrParams)) {
    // Old API: useHints(tasks, schedule, failedCount)
    tasks = tasksOrParams;
    actualSchedule = schedule || [];
    actualFailedCount = failedCount || 0;
  } else {
    // New API: useHints({ baseTasks, correctSchedule, failedCount, hintConfig })
    tasks = tasksOrParams.baseTasks || [];
    actualSchedule = tasksOrParams.correctSchedule || [];
    actualFailedCount = tasksOrParams.failedCount || 0;
    customHintConfig = tasksOrParams.hintConfig;
  }

  // Create default hints
  const defaultHints: Hint[] = [
    {
      id: "hint-release",
      description: "Release-Zeitpunkte anzeigen",
      type: "releaseMarker",
      unlocked: false,
      unlockAt: 1,
    },
    {
      id: "hint-deadline",
      description: "Deadline-Zeitpunkte anzeigen",
      type: "deadlineMarker",
      unlocked: false,
      unlockAt: 2,
    },
    {
      id: "hint-exec",
      description: "Eine Taskausführung anzeigen",
      type: "fullExecution",
      unlocked: false,
      unlockAt: 3,
    },
  ];

  // Apply custom hint config if provided
  const initialHints = customHintConfig !== undefined
    ? customHintConfig.length === 0
      ? [] // Empty array means no hints at all
      : defaultHints.map(hint => {
          const customConfig = customHintConfig.find(c => c.type === hint.type);
          return customConfig ? { ...hint, unlockAt: customConfig.unlockAt } : hint;
        })
    : defaultHints; // undefined means use defaults

  const [hints, setHints] = useState<Hint[]>(initialHints);

  const isHintAvailable = (hint: Hint) =>
    actualFailedCount >= hint.unlockAt;


  const unlockHint = (hintId: string) => {
    setHints(prev =>
      prev.map(h =>
        h.id === hintId && isHintAvailable(h)
          ? { ...h, unlocked: true }
          : h
      )
    );
  };

  const lockHint = (hintId: string) => {
    setHints(prev =>
      prev.map(h =>
        h.id === hintId ? { ...h, unlocked: false } : h
      )
    );
  };

  const setHintTask = (hintId: string, taskId: string) => {
    setHints(prev =>
      prev.map(h =>
        h.id === hintId ? { ...h, taskId } : h
      )
    );
  };


  const getHintBlocks = useMemo(() => {
    const blocks: Record<string, Set<number>> = {};

    hints.forEach(hint => {
      if (
        !hint.unlocked ||
        hint.type !== "fullExecution" ||
        !hint.taskId
      )
        return;

      const times = new Set<number>();
      actualSchedule
        .filter(e => e.taskId === hint.taskId)
        .forEach(e => times.add(e.time));

      blocks[hint.taskId] = times;
    });

    return blocks;
  }, [hints, actualSchedule]);

  const releaseMarkers = useMemo(() => {
    const markers: Record<string, Set<number>> = {};

    hints.forEach(hint => {
      if (
        !hint.unlocked ||
        hint.type !== "releaseMarker" ||
        !hint.taskId
      )
        return;

      const task = tasks.find(t => t.id === hint.taskId);
      if (!task) return;

      markers[task.id] = new Set([task.T]);
    });

    return markers;
  }, [hints, tasks]);

  const deadlineMarkers = useMemo(() => {
    const markers: Record<string, Set<number>> = {};

    hints.forEach(hint => {
      if (
        !hint.unlocked ||
        hint.type !== "deadlineMarker" ||
        !hint.taskId
      )
        return;

      const task = tasks.find(t => t.id === hint.taskId);
      if (!task) return;

      markers[task.id] = new Set([task.D]);
    });

    return markers;
  }, [hints, tasks]);

  return {
    hints,

    isHintAvailable,

    unlockHint,
    lockHint,
    setHintTask,

    getHintBlocks,
    releaseMarkers,
    deadlineMarkers,
  };
}
