// Function to compare schedules for equivalence


import type { ScheduleEntry } from "../../../logic/simulator";

function serializeSchedule(schedule: ScheduleEntry[]): string[] {
  return [...schedule]
    .map((entry) => `${entry.taskId}:${entry.time}`)
    .sort();
}

export function areSchedulesEquivalent(first: ScheduleEntry[], second: ScheduleEntry[]): boolean {
  if (first.length !== second.length) {
    return false;
  }

  const firstSignature = serializeSchedule(first);
  const secondSignature = serializeSchedule(second);

  return firstSignature.every((value, index) => value === secondSignature[index]);
}
