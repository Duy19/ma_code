import { useState } from "react";
import SchedulerCanvas from "../../components/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateEDF } from "../../logic/simulator";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 4, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY = [
    { text: "So diesmal ein etwas anderes Beispiel. Ich bin mir sicher diesmal stimmt auch alles wie ich es mir gedacht habe... Aber das wird schon!", highlight: null },
    { text: "Zunächst einmal die **EDF Variante** des Schedules.", highlight: null },
    { text: "Mach dir schonmal Gedanken wie das RM Schedule gleich aussehen könnte und an Welchen Zeitpunkten das Verfahren anders entscheidet", highlight: null },
    { text: "Ready? Dann schauen wir uns das RM Schedule an! **(Klicken)**", highlight: null },
    
];

export default function TutorialStep1() {
  const hyperperiod = 24;
  const schedule: ScheduleEntry[] = simulateEDF(tutorialTasks, hyperperiod);
  const [step, setStep] = useState(0);
  const currentStep = STORY[step];
  const navigate = useNavigate();
  const totalSteps = STORY.length;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      navigate("/chapter1_4");
    }
  };

 return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Mr.Tau explaining stuff*/}
      <div
        style={{
          flex: "0 0 25%",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "20px 40px",
          gap: 40,
        }}
      >
        <TutorialOverlay
          visible
          text={currentStep.text}
          onNext={handleNext}
        />
      </div>

      {/* Schedulercanvas */}
      <div style={{ flex: 1, padding: "0 24px 20px" }}>
        <SchedulerCanvas
          tasks={tutorialTasks}
          hyperperiod={hyperperiod}
          schedule={schedule}
          pxPerStep={28}
          leftLabelWidth={140}
          visibility={{
            showTaskLabels: true,
            showXAxis: true,
            showYAxis: false,
            showTimeTicks: true,
            showExecutionBlocks: true,
            showReleaseMarkers: true,
            showDeadlineMarkers: true,
          }}
          highlight={currentStep.highlight}
        />
      </div>
    </div>
  );
}
