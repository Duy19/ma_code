import { useState } from "react";
import InteractiveSchedulerCanvas from "../components/InteractiveSchedulerCanvas";
import type { Task } from "../core/task";

export default function Chapter1() {
  const tasks: Task[] = [
    { id: "brake", name: "Bremsen", C: 2, T: 4, D: 4, color: "#f87171" },
    { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
    { id: "media", name: "Multimedia", C: 1, T: 6, D: 6, color: "#34d399" },
  ];

  const hyperperiod = 24;

  const [userScheduleRef, setUserScheduleRef] = useState<Record<string, Set<number>>>(
    tasks.reduce((acc, t) => ({ ...acc, [t.id]: new Set<number>() }), {})
  );

  return (
    <div className="text-center mt-16">
      <h2 className="text-2xl font-semibold">Chapter 1</h2>
      <p className="text-gray-600 mt-2">Advanced Scheduling and Simulation</p>
      <div className="mt-2 px-10">
        <InteractiveSchedulerCanvas
          tasks={tasks}
          hyperperiod={hyperperiod}
          userScheduleRef={userScheduleRef}
          setUserScheduleRef={setUserScheduleRef}
        />
      </div>
    </div>
  );
}
