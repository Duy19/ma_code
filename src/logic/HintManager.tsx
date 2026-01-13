import { useState, useMemo } from "react";
import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";

export type HintType =
  | "fullExecution"
  | "releaseMarker"
  | "deadlineMarker";

export interface Hint {
  id: string;
  description: string;
  taskId?: string;
  type: HintType;
  unlocked: boolean;
  unlockAt: number; 
}

export function useHints(
  tasks: Task[],
  schedule: ScheduleEntry[],
  failedCount: number
) {

  const [hints, setHints] = useState<Hint[]>([
    {
      id: "hint-release",
      description: "Zeige Release-Zeitpunkte",
      type: "releaseMarker",
      unlocked: false,
      unlockAt: 1,
    },
    {
      id: "hint-deadline",
      description: "Zeige Deadline-Zeitpunkte",
      type: "deadlineMarker",
      unlocked: false,
      unlockAt: 2,
    },
    {
      id: "hint-exec",
      description: "Zeige vollständige Ausführung eines Tasks",
      type: "fullExecution",
      unlocked: false,
      unlockAt: 3,
    },
  ]);

  const isHintAvailable = (hint: Hint) =>
    failedCount >= hint.unlockAt;


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
      schedule
        .filter(e => e.taskId === hint.taskId)
        .forEach(e => times.add(e.time));

      blocks[hint.taskId] = times;
    });

    return blocks;
  }, [hints, schedule]);

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
