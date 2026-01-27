import { useState } from "react";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateEDF } from "../../logic/simulator";
import TutorialScenario from "../../components/tutorial/TutorialScenario";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 3, D: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 4, D: 4, color: "#34d399" },
];

const STORY = [
  { text: "Hier haben wir nun ein weiteres Beispiel wo nicht alles ordentlich geplant wurde. Es sieht alles sehr ähnlich aus nur diesmal geht etwas schief!", highlight: null },
  { text: "Erstmal wieder die **Bremsen**. Diese brauchen wieder **2 Zeitschritte** um ausgeführt zu werden. **Aber** das Intervall für die Ausführung ist diesmal **geringer**.", highlight: "brake" },
  { text: "Die **Hindernisserkennung** ist hier gleich geblieben.", highlight: "sensor" },
  { text: "Aber bei **Multimedia** dachte man sich, dass es besser wäre, wenn diese Funktion mit **kürzeren Perioden** ausgeführt wird, für ein besseres Erlebnis.", highlight: "media" },
  { text: "Doch man kann durch genaues Hinschauen schon erkennen, dass die Bremsen **nicht genug** Zeit haben! Die **roten Pfeile** zeigen diesmal an zu welchem Zeitpunkt die Aufgaben **rechtzeitig** ausgeführt werden müssen.", highlight: null, highlightExecutions: [{ taskId: "brake", steps: [8, 9, 11, 12] }]},
  { text: "Und damit kommt es hier leider zu einem Crash! Man muss also sehr vorsichtig sein bei der Planung. Und auch kleine Änderungen können gravierende Auswirkungen haben.", highlight: null },
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
      navigate("/tutorial3");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Mr.Tau + Car Scene */}
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

        <TutorialScenario
          step={step}
          totalSteps={STORY.length}
          crash={true}
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
            showTimeTicks: false,
            showExecutionBlocks: true,
            showReleaseMarkers: true,
            showDeadlineMarkers: true,
          }}
          highlight={currentStep.highlight}
          highlightExecutions={currentStep.highlightExecutions}
        />
      </div>
    </div>
  );
}

