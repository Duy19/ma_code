// EDF-Simulator
import type { Task } from "../core/task";

export interface ScheduleEntry {
  time: number;
  taskId: string | null; // null = idle
}

export function simulateEDF(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];

  // active task instances
  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remaining: number;
  }

  let active: ActiveInstance[] = [];

  for (let t = 0; t < hyperperiod; t++) {
    for (const task of tasks) {
      const offset = task.O ?? 0;
      if ((t-offset) >= 0 && (t-offset) % task.T === 0) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remaining: task.C,
        });
      }
    }

    active = active.filter((a) => a.remaining > 0);
    // sort by deadline
    active.sort((a, b) => a.deadline - b.deadline);
    const current = active[0];

    if (current) {
      current.remaining -= 1;
      schedule.push({ time: t, taskId: current.id });
    } else {
      schedule.push({ time: t, taskId: null });
    }
  }

  return schedule;
}



export function simulateRM(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];

  // active task instances
  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remaining: number;
    period: number;
  }

  let active: ActiveInstance[] = [];

  for (let t = 0; t < hyperperiod; t++) {
    for (const task of tasks) {
      const offset = task.O ?? 0;
      if ((t-offset) >= 0 && (t-offset) % task.T === 0) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remaining: task.C,
          period: task.T,
        });
      }
    }

    active = active.filter((a) => a.remaining > 0);
    // sort by period (Rate Monotonic)
    active.sort((a, b) => a.period - b.period);
    const current = active[0];
    if (current) {
      current.remaining -= 1;
      schedule.push({ time: t, taskId: current.id });
    } else {
      schedule.push({ time: t, taskId: null });
    }
  }

  return schedule;
}