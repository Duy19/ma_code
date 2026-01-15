import { useState } from "react";
import SchedulerCanvas from "../../components/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateRM } from "../../logic/simulator";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY = [
    { text: "Schauen wir uns die selben Aufgaben an, aber diesmal mit einem **Fixed-Priority Scheduling**.", highlight: null },
    { text: "In diesem Fall wird die **Rate-Monotonic (RM)** Strategie verwendet. Diese ordnet Aufgaben so an, dass Aufgaben mit **kürzeren Perioden** eine **höhere Priorität** erhalten.", highlight: null },
    { text: "Die Bremsen haben eine **Periode von 8**, der Sensor eine **Periode von 3** und die Multimedia-Funktion eine **Periode von 12**. Somit hat der Sensor die höchste Priorität und Multimedia die niedrigste Priorität.", highlight: null },
    { text: "Das bedeutet, dass der Scheduler immer die Aufgabe mit der höchsten Priorität auswählt, die bereit ist, ausgeführt zu werden.", highlight: null },
    { text: "Erkennst du den Unterschied zum letzten Beispiel mit EDF?", highlight: null },
    { text: "Huch... Moment mal! Das sieht genau so aus wie im letzten Beispiel mit EDF! Das kann natürlich auch passieren je nachdem wie die Parameter der Aufgaben sind.", highlight: null },
    { text: "Im nächsten Schritt schauen wir uns ein Beispiel an, bei dem sich RM und EDF auch mal wirklich unterscheiden. ", highlight: null },
];

export default function TutorialStep1() {
  const hyperperiod = 24;
  const schedule: ScheduleEntry[] = simulateRM(tutorialTasks, hyperperiod);
  const [step, setStep] = useState(0);
  const currentStep = STORY[step];
  const navigate = useNavigate();
  const totalSteps = STORY.length;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      navigate("/chapter1_3");
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
