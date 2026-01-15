import { useState } from "react";
import SchedulerCanvas from "../../components/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateEDF } from "../../logic/simulator";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY = [
    { text: "Wie du im Tutorial evtl. schon gemerkt hast, kann man Aufgaben unterschiedlich planen. Schauen wir uns das Beispiel nochmal an.", highlight: null },
    { text: "Diesmal sind auch Zeitschritte als auch Release und Deadline-Markierungen sichtbar.", highlight: null },
    { text: "Hier wird die **Earliest Deadline First (EDF)** Strategie verwendet. Diese führt zu jedem Zeitschritt die Aufgabe mit der frühesten Deadlines aus, welche noch nicht bearbeitet wurden.", highlight: null },
    { text: "Schau mal beim **Zeitschritt 9**. Statt die **Bremsenaufgabe** zu priorisieren, wird stattdessen die **Sensoraufgabe** ausgeführt, da diese eine **frühere Deadline hat zu dem Zeitpunkt**.", highlight: "brake" },
    { text: "Aufgaben werden also dynamisch nach ihrer Deadline priorisiert. Das bedeutet, dass die Priorität einer Aufgabe sich ändern kann, abhängig davon, wie nah ihre Deadline ist.", highlight: null },
    { text: "Es gibt aber auch Strategien, die Aufgaben immer eine feste Priorität zuweisen, welche auch **Fixed-Priority Scheduling** genannt werden.", highlight: null },
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
      navigate("/chapter1_2");
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
