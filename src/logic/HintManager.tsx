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
  isTaskAutoSelected?: boolean;
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
      description: "Show Release times",
      type: "releaseMarker",
      unlocked: false,
      unlockAt: 1,
    },
    {
      id: "hint-deadline",
      description: "Show Deadline times",
      type: "deadlineMarker",
      unlocked: false,
      unlockAt: 2,
    },
    {
      id: "hint-exec",
      description: "Show a random Task execution",
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

  const getRandomTaskIdForExecutionHint = () => {
    const taskIdsWithSchedule = Array.from(
      new Set(
        actualSchedule
          .map((entry) => entry.taskId)
          .filter((taskId): taskId is string => typeof taskId === "string")
      )
    );
    const candidateIds = taskIdsWithSchedule.length > 0
      ? taskIdsWithSchedule
      : tasks.map((task) => task.id);

    if (candidateIds.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * candidateIds.length);
    return candidateIds[randomIndex];
  };

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
        h.id === hintId ? { ...h, taskId, isTaskAutoSelected: false } : h
      )
    );
  };

  const setRandomHintTask = (hintId: string) => {
    const randomTaskId = getRandomTaskIdForExecutionHint();
    if (!randomTaskId) return;

    setHints(prev =>
      prev.map(h =>
        h.id === hintId ? { ...h, taskId: randomTaskId, isTaskAutoSelected: true } : h
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
        .forEach(e => {
          const start = e.time;
          const end = e.time + e.duration;
          const firstBlock = Math.floor(start);
          const lastBlock = Math.ceil(end) - 1;

          for (let block = firstBlock; block <= lastBlock; block++) {
            const overlaps = block < end && block + 1 > start;
            if (overlaps) {
              times.add(block);
            }
          }
        });

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
    setRandomHintTask,

    getHintBlocks,
    releaseMarkers,
    deadlineMarkers,
  };
}
