// @ts-nocheck

// Scheduling-Simulator
import type { Task, SuspensionPattern, SuspensionInterval } from "../core/task";
import { giniCoefficient } from "../utils/formulas";

const Fixed_Decimal = 10;

function toTick(value: number): number {
  return Math.round(value * Fixed_Decimal);
}

function fromTick(tick: number): number {
  return tick / Fixed_Decimal;
}

export interface ScheduleEntry {
  time: number;
  duration: number;
  taskId: string | null; // null = idle
  jobRelease?: number;
  jobDeadline?: number;
  remainingExecution?: number; // Remaining execution after this entry
}

export interface JobInstances{
  taskid: string;
  jobNumber: number;
  jobFinished: boolean;
  release: number;
  start: number;
  deadline: number;
  executionTime: number;
  missedDeadline?: boolean | null;
  preemptionCount?: number;
  responseTime: number | null;
  laxity?: number | null;
}

export interface ScheduleResult {
  schedule: ScheduleEntry[];
  jobInstancesPerTask: Map<string, JobInstances[]>;
  avgPreemptions?: number;
  avgLaxity?: number;
  giniT?: number;
  giniC?: number;
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
  const offsetTick = toTick(task.O ?? 0);
  const periodTick = toTick(task.T);
  const tTick = toTick(t);

  if (periodTick <= 0) return false;
  if (tTick < offsetTick) return false;

  // Sporadic
  if (task.type === "sporadic") {
    const lastReleaseTick = lastRelease.has(task.id)
      ? toTick(lastRelease.get(task.id)!)
      : -Infinity;
    return tTick - lastReleaseTick >= periodTick;
  }

  // Periodic (default)
  return (tTick - offsetTick) % periodTick === 0;
}

interface ActiveInstance {
  id: string;
  release: number;
  deadline: number;
  remainingExecution: number;
  period: number;
}

function simulate(
  tasks: Task[],
  hyperperiod: number,
  comparePriority: (a: ActiveInstance, b: ActiveInstance, taskOrder: Map<string, number>) => number
): ScheduleResult {
  const schedule: ScheduleEntry[] = [];
  const giniT = giniCoefficient(tasks.map(t => t.T));
  const giniC = giniCoefficient(tasks.map(t => t.C));

  const taskOrder = new Map<string, number>();
  tasks.forEach((task, index) => {
    taskOrder.set(task.id, index);
  });

  const hyperperiodTick = toTick(hyperperiod);

  const taskTicks = new Map<string, { C: number; T: number; D: number; O: number }>();
  tasks.forEach((task) => {
    taskTicks.set(task.id, {
      C: toTick(task.C),
      T: toTick(task.T),
      D: toTick(task.D),
      O: toTick(task.O ?? 0),
    });
  });

  const nextRelease = new Map<string, number>();
  tasks.forEach((task) => {
    nextRelease.set(task.id, taskTicks.get(task.id)!.O);
  });

  const jobInstancesPerTask = new Map<string, JobInstances[]>();
  const jobTracking = new Map<string, JobInstances>();
  const jobCounter = new Map<string, number>();

  let active: ActiveInstance[] = [];
  let previousJob: ActiveInstance | null = null;
  let t = 0;

  const finalizeFinishedJobs = (finishedAtTick: number) => {
    const finishedJobs = active.filter((a) => a.remainingExecution <= 0);
    for (const job of finishedJobs) {
      const jobKey = `${job.id}-${job.release}`;
      const jobInstance = jobTracking.get(jobKey);
      if (jobInstance && jobInstance.responseTime === null) {
        jobInstance.jobFinished = true;
        jobInstance.missedDeadline = finishedAtTick > job.deadline;
        jobInstance.responseTime = fromTick(finishedAtTick - job.release);
        jobInstance.laxity = fromTick(job.deadline - finishedAtTick);
      }
    }
    active = active.filter((a) => a.remainingExecution > 0);
  };

  while (t < hyperperiodTick) {
    finalizeFinishedJobs(t);

    for (const task of tasks) {
      const release = nextRelease.get(task.id)!;
      const ticks = taskTicks.get(task.id)!;
      if (release <= t && release < hyperperiodTick) {
        active.push({
          id: task.id,
          release,
          deadline: release + ticks.D,
          remainingExecution: ticks.C,
          period: ticks.T,
        });
        nextRelease.set(task.id, release + ticks.T);
      }
    }

    active.sort((a, b) => comparePriority(a, b, taskOrder));
    const current = active[0];

    if (previousJob !== null && previousJob.remainingExecution > 0 && current?.id !== previousJob.id) {
      const preemptedJobKey = `${previousJob.id}-${previousJob.release}`;
      const preemptedJob = jobTracking.get(preemptedJobKey);
      if (preemptedJob && preemptedJob.preemptionCount !== undefined) {
        preemptedJob.preemptionCount++;
      }
    }
    previousJob = current ?? null;

    let nextReleaseTime = Infinity;
    for (const release of nextRelease.values()) {
      if (release > t) {
        nextReleaseTime = Math.min(nextReleaseTime, release);
      }
    }

    const completionTime = current ? t + current.remainingExecution : Infinity;
    const nextEventTime = Math.min(nextReleaseTime, completionTime, hyperperiodTick);

    if (!Number.isFinite(nextEventTime) || nextEventTime <= t) {
      break;
    }

    const runDuration = nextEventTime - t;

    if (current) {
      const jobKey = `${current.id}-${current.release}`;
      if (!jobTracking.has(jobKey)) {
        if (!jobCounter.has(current.id)) {
          jobCounter.set(current.id, 0);
        }
        jobCounter.set(current.id, jobCounter.get(current.id)! + 1);

        const jobInstance: JobInstances = {
          taskid: current.id,
          jobNumber: jobCounter.get(current.id)!,
          jobFinished: false,
          release: fromTick(current.release),
          start: fromTick(t),
          deadline: fromTick(current.deadline),
          executionTime: 0,
          missedDeadline: null,
          preemptionCount: 0,
          responseTime: null,
          laxity: null,
        };
        jobTracking.set(jobKey, jobInstance);
      }

      const jobInstance = jobTracking.get(jobKey)!;
      jobInstance.executionTime = fromTick(toTick(jobInstance.executionTime) + runDuration);

      current.remainingExecution -= runDuration;
      schedule.push({
        time: fromTick(t),
        duration: fromTick(runDuration),
        taskId: current.id,
        jobRelease: fromTick(current.release),
        jobDeadline: fromTick(current.deadline),
        remainingExecution: fromTick(Math.max(0, current.remainingExecution)),
      });
    } else {
      schedule.push({
        time: fromTick(t),
        duration: fromTick(runDuration),
        taskId: null,
      });
    }

    t = nextEventTime;
  }

  finalizeFinishedJobs(hyperperiodTick);

  for (const jobInstance of jobTracking.values()) {
    if (jobInstance.responseTime === null) {
      jobInstance.jobFinished = false;
      jobInstance.missedDeadline = null;
      jobInstance.responseTime = null;
      jobInstance.laxity = null;
    }
  }

  for (const jobInstance of jobTracking.values()) {
    const taskId = jobInstance.taskid;
    if (!jobInstancesPerTask.has(taskId)) {
      jobInstancesPerTask.set(taskId, []);
    }
    jobInstancesPerTask.get(taskId)!.push(jobInstance);
  }

  const trackedJobs = [...jobTracking.values()];
  const avgPreemptions = trackedJobs.length > 0
    ? trackedJobs.reduce((sum, job) => sum + (job.preemptionCount ?? 0), 0) / trackedJobs.length
    : 0;
  const avgLaxity = trackedJobs.length > 0
    ? trackedJobs.reduce((sum, job) => sum + (job.laxity ?? 0), 0) / trackedJobs.length
    : 0;

  return { schedule, jobInstancesPerTask, avgPreemptions, avgLaxity, giniT, giniC };
}


export function simulateEDF(tasks: Task[], hyperperiod: number): ScheduleResult {
  return simulate(
    tasks,
    hyperperiod,
    (a, b, taskOrder) => {
      if (a.deadline !== b.deadline) {
        return a.deadline - b.deadline;
      }
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!;
    }
  );
}



export function simulateRM(tasks: Task[], hyperperiod: number): ScheduleResult {
  return simulate(
    tasks,
    hyperperiod,
    (a, b, taskOrder) => {
      if (a.period !== b.period) {
        return a.period - b.period;
      }
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!;
    }
  );
}

export function simulateDM(tasks: Task[], hyperperiod: number): ScheduleResult {
  const taskRelativeDeadline = new Map<string, number>();
  tasks.forEach((task) => {
    taskRelativeDeadline.set(task.id, task.D);
  });

  return simulate(
    tasks,
    hyperperiod,
    (a, b, taskOrder) => {
      const aRelativeDeadline = taskRelativeDeadline.get(a.id) ?? Infinity;
      const bRelativeDeadline = taskRelativeDeadline.get(b.id) ?? Infinity;

      if (aRelativeDeadline !== bRelativeDeadline) {
        return aRelativeDeadline - bRelativeDeadline;
      }
      return taskOrder.get(a.id)! - taskOrder.get(b.id)!;
    }
  );
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
        remainingExecution: task.remainingExecution - timeToExecute,
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
        remainingExecution: task.remainingExecution - timeToExecute,
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

  const taskRelativeDeadline = new Map<string, number>();
  tasks.forEach((task) => {
    taskRelativeDeadline.set(task.id, task.D);
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
      // Sort statically by relative deadline for Deadline Monotonic
      const aRelativeDeadline = taskRelativeDeadline.get(a.id) ?? Infinity;
      const bRelativeDeadline = taskRelativeDeadline.get(b.id) ?? Infinity;
      if (aRelativeDeadline !== bRelativeDeadline) {
        return aRelativeDeadline - bRelativeDeadline;
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
        remainingExecution: task.remainingExecution - timeToExecute,
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