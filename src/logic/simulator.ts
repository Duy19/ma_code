import { edfSchedule } from "./schedulers/edf";
import type { Task, Job } from "../core/task";

export function simulateEDF(tasks: Task[], hyperperiod: number): (Job | null)[] {
  const jobs = edfSchedule(tasks, hyperperiod);
  const timeline: (Job | null)[] = Array(hyperperiod).fill(null);

  for (let t = 0; t < hyperperiod; t++) {
    const ready = jobs.filter(
      (j) => j.release <= t && (j.start ?? Infinity) > t - j.C
    );
    if (ready.length > 0) {
      const next = ready.sort((a, b) => a.deadline - b.deadline)[0];
      if (!next.start) next.start = t;
      timeline[t] = next;
    }
  }

  return timeline;
}
