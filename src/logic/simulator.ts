// core/schedulerSimulator.ts
import type { Task } from "../core/task";

export interface ScheduleEntry {
  time: number;
  taskId: string | null; // null = idle
}

export function simulateEDF(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];

  // interne Task-Kopie mit verbleibender Ausführungszeit usw.
  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remaining: number;
  }

  let active: ActiveInstance[] = [];

  for (let t = 0; t < hyperperiod; t++) {
    // neue Instanzen freigeben
    for (const task of tasks) {
      if (t % task.T === 0) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remaining: task.C,
        });
      }
    }

    // nur Tasks mit verbleibender Arbeit behalten
    active = active.filter((a) => a.remaining > 0);

    // sortiere nach frühester Deadline
    active.sort((a, b) => a.deadline - b.deadline);

    // wähle den mit frühester Deadline
    const current = active[0];

    if (current) {
      current.remaining -= 1;
      schedule.push({ time: t, taskId: current.id });
    } else {
      schedule.push({ time: t, taskId: null }); // idle
    }
  }

  return schedule;
}
