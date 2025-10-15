import type { Task, Job } from "../../core/task";

export function edfSchedule(tasks: Task[], hyperperiod: number): Job[] {
  const jobs: Job[] = [];
  for (const task of tasks) {
    for (let t = task.O ?? 0; t < hyperperiod; t += task.T) {
      jobs.push({
        id: `${task.id}-${t}`,
        release: t,
        C: task.C,
        deadline: t + task.D,
      });
    }
  }
  // Sortiere nach earliest deadline (optional mit tie-breaking)
  return jobs.sort((a, b) => a.deadline - b.deadline);
}
