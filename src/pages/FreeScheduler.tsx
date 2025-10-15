import SchedulerCanvas from "../components/SchedulerCanvas";
import type { Task } from "../core/task";

const sampleTasks: Task[] = [
  { id: "t1", name: "τ1", color: "#d8e68f", C: 3, T: 8, D: 8 },
  { id: "t2", name: "τ2", color: "#e3b47d", C: 2, T: 6, D: 6 },
  { id: "t3", name: "τ3", color: "#e17c7c", C: 2, T: 12, D: 12 },
];

export default function FreeScheduler() {
  // Hyperperiod hier beispielhaft 24, später berechnen wir das dynamisch
  return (
    <div className="max-w-7xl mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Free Scheduler</h2>
      <p className="text-gray-600 mb-6">
        Dieses Canvas zeigt das Grundgerüst: pro Task eine Zeitachse, nummerierte X-Achse und ein einstellbares Pixel-Pro-Zeitschritt.
      </p>

      <div className="space-y-4">
        <SchedulerCanvas tasks={sampleTasks as Task[]} hyperperiod={24} pxPerStep={28} timeStepLabelEvery={2} />
      </div>
    </div>
  );
}
