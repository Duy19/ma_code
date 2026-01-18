// Scheduling-Simulator
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
    remainingExecution: number;
  }

  let active: ActiveInstance[] = [];

  // Map tasks to an deterministic order for tie-break
  const taskOrder = new Map<string, number>();
    tasks.forEach((task, index) => {
      taskOrder.set(task.id, index);
    });

  for (let t = 0; t < hyperperiod; t++) {
    for (const task of tasks) {
      const offset = task.O ?? 0;
      if ((t-offset) >= 0 && (t-offset) % task.T === 0) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remainingExecution: task.C,
        });
      }
    }

    active = active.filter((a) => a.remainingExecution > 0);

    active.sort((a, b) => {
      // sort by deadline
      if (a.deadline !== b.deadline) {
        return a.deadline - b.deadline;
      }
      // tie-break via task order
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!;
    });

    const current = active[0];

    if (current) {
      current.remainingExecution -= 1;
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
    
  // Map tasks to an deterministic order for tie-break
  const taskOrder = new Map<string, number>();
    tasks.forEach((task, index) => {
      taskOrder.set(task.id, index);
    });

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
    active.sort((a, b) => {
      if (a.period !== b.period) {
        return a.period - b.period;
      }

      // tie-break via task order
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!; 
    });

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

export function simulateDM(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
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
    
  // Map tasks to an deterministic order for tie-break
  const taskOrder = new Map<string, number>();
    tasks.forEach((task, index) => {
      taskOrder.set(task.id, index);
    });

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
    // sort by Deadline (Deadline Monotonic)
    active.sort((a, b) => {
      if (a.deadline !== b.deadline) {
        return a.deadline - b.deadline;
      }

      // tie-break via task order
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!; 
    });

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


// Test all EDF Permutations
export function simulateEDFAllMutations(tasks: Task[], hyperperiod: number): ScheduleEntry[][] {
  const results: ScheduleEntry[][] = [];

  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remainingExecution: number;
  }

  // Backtracking function to find all valid scheduling permutations
  function backtrack(t: number, active: ActiveInstance[], schedule: ScheduleEntry[]) {
    if (t === hyperperiod) {
      results.push([...schedule]);
      return;
    }

    // Add newly released tasks
    for (const task of tasks) {
      const offset = task.O ?? 0;
      if ((t - offset) >= 0 && (t - offset) % task.T === 0) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remainingExecution: task.C,
        });
      }
    }

    // Remove finished tasks
    active = active.filter(a => a.remainingExecution > 0);

    if (active.length === 0) {
      // Idle time
      backtrack(t + 1, active, [...schedule, { time: t, taskId: null }]);
      return;
    }

    // Find minimum deadline
    const minDeadline = Math.min(...active.map(a => a.deadline));
    const candidates = active.filter(a => a.deadline === minDeadline);

    // Recursively try all candidates for this time step
    for (const task of candidates) {
      const newActive = active.map(a => ({ ...a }));
      const executingTask = newActive.find(a => a.id === task.id)!;
      executingTask.remainingExecution -= 1;

      backtrack(t + 1, newActive, [...schedule, { time: t, taskId: task.id }]);
    }
  }

  backtrack(0, [], []);
  return results;
}

// TDA
export function computeWCRT(task: Task, higherPriorityTasks: Task[]): number{
  let R = task.C;
  let prevR = -1;

  while (R!== prevR) {
    prevR = R;

    const interference = higherPriorityTasks.reduce(
      (sum, t) => sum + Math.ceil(R /t.T) * t.C, 0
    );
    R = task.C + interference;
  }
  return R
}