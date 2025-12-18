import SchedulerCanvas from "../components/SchedulerCanvas";
import type { Task} from "../core/task";
import type { ScheduleEntry} from "../logic/simulator";
import { simulateEDF} from "../logic/simulator";
import { useState } from "react";
import FreeSchedulerSidebar from "../components/FreeSchedulerSidebar";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Hindernis", C: 1, T: 4, D: 4, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

export default function TutorialStep1() {
  const hyperperiod = 24;
  const schedule: ScheduleEntry[] = simulateEDF(tutorialTasks, hyperperiod);

  return (
    <div style={{ width: "100%", height: "400px", border: "1px solid #ddd" }}>
      <SchedulerCanvas
        tasks={tutorialTasks}
        hyperperiod={hyperperiod}
        schedule={schedule}
        pxPerStep={28}
        leftLabelWidth={114}
        visibility={{
          showTaskLabels: true,       
          showXAxis: true,           
          showYAxis: false,           
          showTimeTicks: false,       
          showExecutionBlocks: true,  
          showReleaseMarkers: true,   
          showDeadlineMarkers: false,
        }}
      />
    </div>
  );
}
