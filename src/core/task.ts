export interface Job {
  id: string;
  release: number;
  start?: number;
  finish?: number;
  C: number;
  deadline: number;
}

export interface Task {
  id: string;
  name: string;
  C: number;          // Computation time
  T: number;          // Period
  D: number;          // Deadline
  O?: number;         // Offset
  S?: number;         // Suspension
  color: string;
  jobs?: Job[];
}

export interface Schedule {
  hyperperiod: number;
  tasks: Task[];
  timeSteps: (Job | null)[];
}