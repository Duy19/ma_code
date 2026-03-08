// Scheduling-Simulator
import type { Task, SuspensionPattern, SuspensionInterval } from "../core/task";

export interface ScheduleEntry {
  time: number;
  duration: number;
  taskId: string | null; // null = idle
  jobRelease?: number;
  jobDeadline?: number;
}

// Helper function to get all the Suspension Intervals or the pattern for a task in the hyperperiod
function getSuspension(task: Task, hyperperiod: number) : SuspensionInterval[] {
  
  // If no Suspension return empty
  if (!task.suspension) {
    return [];
  }

  // If set array is given return it for given hyperperiod
  if (Array.isArray(task.suspension)) {
    return task.suspension.filter(w => w.start < hyperperiod);
  }

  // If pattern is given, generate all the Intervals for hyperperiod
  const {offset, duration, period} = task.suspension as SuspensionPattern;
  const intervals: SuspensionInterval[] = [];

  for (let i = 0; offset + i * period < hyperperiod; i++) {
    const start = offset+ i * period;
    intervals.push({start, end: start + duration});
  }
  return intervals;
}

function releasePattern(
  task: Task,
  t: number,
  lastRelease: Map<string, number>
): boolean {
  const offset = task.O ?? 0;

  // To late
  if (t < offset) return false;

  // Sporadic
  if (task.type === "sporadic") {
    return t - (lastRelease.get(task.id) ?? -Infinity) >= task.T;
  }

  // Periodic (default)
  return (t - offset) % task.T === 0;
}


export function simulateEDF(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];

  // active task instances
  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remainingExecution: number;
    period: number;
  }

  let active: ActiveInstance[] = [];

  // Map tasks to an deterministic order for tie-break
  const taskOrder = new Map<string, number>();
    tasks.forEach((task, index) => {
      taskOrder.set(task.id, index);
    });

  const lastRelease = new Map<string, number>();  

  for (let t = 0; t < hyperperiod; t++) {
    for (const task of tasks) {
      if (releasePattern(task, t, lastRelease)) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remainingExecution: task.C,
          period: task.T,
        });
        lastRelease.set(task.id, t);
      }
    }

    // Remove finished tasks
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
      schedule.push({ time: t, duration: 1, taskId: current.id, jobRelease: current.release, jobDeadline: current.deadline });
    } else {
      schedule.push({ time: t, duration: 1, taskId: null });
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

  const lastRelease = new Map<string, number>();

  for (let t = 0; t < hyperperiod; t++) {
    for (const task of tasks) {
      if (releasePattern(task, t, lastRelease)) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remaining: task.C,
          period: task.T,
        });
        lastRelease.set(task.id, t)
      }
    }

    // Remove finished tasks
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
      schedule.push({ time: t, duration: 1, taskId: current.id, jobRelease: current.release, jobDeadline: current.deadline });
    } else {
      schedule.push({ time: t, duration: 1, taskId: null });
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

  const lastRelease = new Map<string, number>();

  for (let t = 0; t < hyperperiod; t++) {
    for (const task of tasks) {
      if (releasePattern(task, t, lastRelease)) {
        active.push({
          id: task.id,
          release: t,
          deadline: t + task.D,
          remaining: task.C,
          period: task.T,
        });
        lastRelease.set(task.id, t)
      }
    }

    // Remove finished tasks
    active = active.filter((a) => a.remaining > 0);
    
    // sort by deadline
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
      schedule.push({ time: t, duration: 1, taskId: current.id, jobRelease: current.release, jobDeadline: current.deadline });
    } else {
      schedule.push({ time: t, duration: 1, taskId: null });
    }
  }

  return schedule;
}

/**
  Here are the algorithms but with suspension handling. The idea is to collect all critical time points like releases, and suspension intervals of all tasks.
  Then sort this list of time points (even if not discrete) and in between these time stamps do the regular Scheduling.
  This is only done this way because suspension in this tool is either a repetetive pattern or manually set by the user.
*/

// EDF with Suspension 
export function simulateEDFWithSuspension(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  
  // active task instances
  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remainingExecution: number;
    period: number;
  }

  let active: ActiveInstance[] = [];

  // Map tasks to an deterministic order for tie-break
  const taskOrder = new Map<string, number>();
    tasks.forEach((task, index) => {
      taskOrder.set(task.id, index);
  });

  const lastRelease = new Map<string, number>();

  // Precompute suspension intervals for all tasks
  const taskSuspensions = new Map<string, SuspensionInterval[]>();
  for (const task of tasks) {
    taskSuspensions.set(task.id, getSuspension(task, hyperperiod));
  }
  
  // Collect all important time points (releases, deadlines, suspensions)
  const criticalTimePoints = new Set<number>();
  // Add begin and end of schedule as critical points
  criticalTimePoints.add(0); 
  criticalTimePoints.add(hyperperiod);

  // Add release times of all tasks
  for (const task of tasks) {
    const offset = task.O ?? 0;
    for (let t = 0; t * task.T + offset < hyperperiod; t++) {
      criticalTimePoints.add(t * task.T + offset); 
    }
  }

  // Add Suspension start and end times
  for (const task of tasks) {
    const suspensions = taskSuspensions.get(task.id)!;
    for (const interval of suspensions) {
      if (interval.start < hyperperiod) {
        criticalTimePoints.add(interval.start);
      }
      if (interval.end < hyperperiod) {
        criticalTimePoints.add(interval.end);
      }
    }
  }

  // Sort critical time points
  const sortedCriticalTimePoints = Array.from(criticalTimePoints).sort((a, b) => a - b);
  
  console.log(`[EDFWithSuspension] DEBUG: hyperperiod=${hyperperiod}, critical points=${sortedCriticalTimePoints.length}, tasks=${tasks.map(t => t.id).join(',')}`, sortedCriticalTimePoints);
  
  // Handle time between critical time points
  for (let i = 0; i < sortedCriticalTimePoints.length - 1; i++) {
    const start = sortedCriticalTimePoints[i];
    const end = sortedCriticalTimePoints[i + 1];
    const duration = end - start;

    if (duration <= 0) continue;

    // New tasks at the start of the interval if it has been released
    for (const task of tasks) {
      if (releasePattern(task, start, lastRelease)) {
        active.push({
          id: task.id,
          release: start,
          deadline: start + task.D,
          remainingExecution: task.C,
          period: task.T,
        });
        lastRelease.set(task.id, start);
      }
    }

    // Remove finished tasks
    active = active.filter((a) => a.remainingExecution > 0);

    // Executable Tasks (but not suspended)
    const executableTasks = active.filter((a) => {
      const suspensions = taskSuspensions.get(a.id)!;
      return !suspensions.some((s) => start < s.end && end > s.start);
    });

    if (duration > 0 && active.length > 0) {
      console.log(`[EDFWithSuspension] Gap [${start}, ${end}] duration=${duration}: active=${active.map(a => a.id).join(',')} executable=${executableTasks.map(e => e.id).join(',')}`);
    }

    executableTasks.sort((a, b) => {
      // sort by deadline (EDF)
      if (a.deadline !== b.deadline) {
        return a.deadline - b.deadline;
      }
      // tie-break via task order
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!;
    });

    // Until the next critical point, execute the highest priority executable task if availabe
    let timeUsed = 0;
    for (const task of executableTasks) {
      if (timeUsed >= duration) break;
      const timeToExecute = Math.min(task.remainingExecution, duration - timeUsed);
      schedule.push({
        time: start + timeUsed,
        duration: timeToExecute,
        taskId: task.id,
        jobRelease: task.release,
        jobDeadline: task.deadline,
      });
      task.remainingExecution -= timeToExecute;
      timeUsed += timeToExecute;
    }

    // If there is still time left, it's idle time
    if (timeUsed < duration) {
      schedule.push({
        time: start + timeUsed,
        duration: duration - timeUsed,
        taskId: null,
      });
    }
  }

  console.log(`[EDFWithSuspension] FINAL SCHEDULE:`, schedule.length, `entries`);
  return schedule;
}


export function simulateRMWithSuspension(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  
  // active task instances
  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remainingExecution: number;
    period: number;
  }

  let active: ActiveInstance[] = [];

  // Map tasks to an deterministic order for tie-break
  const taskOrder = new Map<string, number>();
    tasks.forEach((task, index) => {
      taskOrder.set(task.id, index);
  });

  const lastRelease = new Map<string, number>();

  // Precompute suspension intervals for all tasks
  const taskSuspensions = new Map<string, SuspensionInterval[]>();
  for (const task of tasks) {
    taskSuspensions.set(task.id, getSuspension(task, hyperperiod));
  }
  
  // Collect all important time points (releases, deadlines, suspensions)
  const criticalTimePoints = new Set<number>();
  // Add begin and end of schedule as critical points
  criticalTimePoints.add(0); 
  criticalTimePoints.add(hyperperiod);

  // Add release times of all tasks
  for (const task of tasks) {
    const offset = task.O ?? 0;
    for (let t = 0; t * task.T + offset < hyperperiod; t++) {
      criticalTimePoints.add(t * task.T + offset); 
    }
  }

  // Add Suspension start and end times
  for (const task of tasks) {
    const suspensions = taskSuspensions.get(task.id)!;
    for (const interval of suspensions) {
      if (interval.start < hyperperiod) {
        criticalTimePoints.add(interval.start);
      }
      if (interval.end < hyperperiod) {
        criticalTimePoints.add(interval.end);
      }
    }
  }

  // Sort critical time points
  const sortedCriticalTimePoints = Array.from(criticalTimePoints).sort((a, b) => a - b);
  
  // Handle time between critical time points
  for (let i = 0; i < sortedCriticalTimePoints.length - 1; i++) {
    const start = sortedCriticalTimePoints[i];
    const end = sortedCriticalTimePoints[i + 1];
    const duration = end - start;

    if (duration <= 0) continue;

    // New tasks at the start of the interval if it has been released
    for (const task of tasks) {
      if (releasePattern(task, start, lastRelease)) {
        active.push({
          id: task.id,
          release: start,
          deadline: start + task.D,
          remainingExecution: task.C,
          period: task.T,
        });
        lastRelease.set(task.id, start);
      }
    }

    // Remove finished tasks
    active = active.filter((a) => a.remainingExecution > 0);

    // Executable Tasks (but not suspended)
    const executableTasks = active.filter((a) => {
      const suspensions = taskSuspensions.get(a.id)!;
      return !suspensions.some((s) => start < s.end && end > s.start);
    });

    executableTasks.sort((a, b) => {
      // Sort statically by period for Rate Monotonic
      if (a.period !== b.period) {
        return a.period - b.period;
      }

      // tie-break via task order
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!;
    });

    // Until the next critical point, execute the highest priority executable task if availabe
    let timeUsed = 0;
    for (const task of executableTasks) {
      if (timeUsed >= duration) break;
      const timeToExecute = Math.min(task.remainingExecution, duration - timeUsed);
      schedule.push({
        time: start + timeUsed,
        duration: timeToExecute,
        taskId: task.id,
        jobRelease: task.release,
        jobDeadline: task.deadline,
      });
      task.remainingExecution -= timeToExecute;
      timeUsed += timeToExecute;
    }

    // If there is still time left, it's idle time
    if (timeUsed < duration) {
      schedule.push({
        time: start + timeUsed,
        duration: duration - timeUsed,
        taskId: null,
      });
    }
  }

  return schedule;
}


export function simulateDMWithSuspension(tasks: Task[], hyperperiod: number): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  
  // active task instances
  interface ActiveInstance {
    id: string;
    release: number;
    deadline: number;
    remainingExecution: number;
    period: number;
  }

  let active: ActiveInstance[] = [];

  // Map tasks to an deterministic order for tie-break
  const taskOrder = new Map<string, number>();
    tasks.forEach((task, index) => {
      taskOrder.set(task.id, index);
  });

  const lastRelease = new Map<string, number>();

  // Precompute suspension intervals for all tasks
  const taskSuspensions = new Map<string, SuspensionInterval[]>();
  for (const task of tasks) {
    taskSuspensions.set(task.id, getSuspension(task, hyperperiod));
  }
  
  // Collect all important time points (releases, deadlines, suspensions)
  const criticalTimePoints = new Set<number>();
  // Add begin and end of schedule as critical points
  criticalTimePoints.add(0); 
  criticalTimePoints.add(hyperperiod);

  // Add release times of all tasks
  for (const task of tasks) {
    const offset = task.O ?? 0;
    for (let t = 0; t * task.T + offset < hyperperiod; t++) {
      criticalTimePoints.add(t * task.T + offset); 
    }
  }

  // Add Suspension start and end times
  for (const task of tasks) {
    const suspensions = taskSuspensions.get(task.id)!;
    for (const interval of suspensions) {
      if (interval.start < hyperperiod) {
        criticalTimePoints.add(interval.start);
      }
      if (interval.end < hyperperiod) {
        criticalTimePoints.add(interval.end);
      }
    }
  }

  // Sort critical time points
  const sortedCriticalTimePoints = Array.from(criticalTimePoints).sort((a, b) => a - b);
  
  // Handle time between critical time points
  for (let i = 0; i < sortedCriticalTimePoints.length - 1; i++) {
    const start = sortedCriticalTimePoints[i];
    const end = sortedCriticalTimePoints[i + 1];
    const duration = end - start;

    if (duration <= 0) continue;

    // New tasks at the start of the interval if it has been released
    for (const task of tasks) {
      if (releasePattern(task, start, lastRelease)) {
        active.push({
          id: task.id,
          release: start,
          deadline: start + task.D,
          remainingExecution: task.C,
          period: task.T,
        });
        lastRelease.set(task.id, start);
      }
    }

    // Remove finished tasks
    active = active.filter((a) => a.remainingExecution > 0);

    // Executable Tasks (but not suspended)
    const executableTasks = active.filter((a) => {
      const suspensions = taskSuspensions.get(a.id)!;
      return !suspensions.some((s) => start < s.end && end > s.start);
    });

    executableTasks.sort((a, b) => {
      // Sort statically by deadline for Deadline Monotonic
      if (a.deadline !== b.deadline) {
        return a.deadline - b.deadline;
      }
      
      // tie-break via task order
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!;
    });

    // Until the next critical point, execute the highest priority executable task if availabe
    let timeUsed = 0;
    for (const task of executableTasks) {
      if (timeUsed >= duration) break;
      const timeToExecute = Math.min(task.remainingExecution, duration - timeUsed);
      schedule.push({
        time: start + timeUsed,
        duration: timeToExecute,
        taskId: task.id,
        jobRelease: task.release,
        jobDeadline: task.deadline,
      });
      task.remainingExecution -= timeToExecute;
      timeUsed += timeToExecute;
    }

    // If there is still time left, it's idle time
    if (timeUsed < duration) {
      schedule.push({
        time: start + timeUsed,
        duration: duration - timeUsed,
        taskId: null,
      });
    }
  }

  return schedule;
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