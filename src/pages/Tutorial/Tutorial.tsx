import { useState } from "react";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateEDF } from "../../logic/simulator";
import TutorialScenario from "../../components/tutorial/TutorialScenario";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY = [
  { text: "Moin! Ich bin **Mr. Tau** und erkläre dir, wie ein selbstfahrendes Auto Aufgaben plant. In diesem Fall hat das Auto **3 Funktionen** die an verschiedenen Zeitpunkten ausgeführt werden müssen. (**Sprechblase anklicken**)", highlight: null },
  { text: "Zunächst einmal die **Bremsen**. Diese sind sehr wichtig und sollten immer funktionsbereit sein. Die Bremsen brauchen hier **2 Zeitschritte** um ausgeführt zu werden.", highlight: "brake" },
  { text: "Die **grünen Pfeile** verraten dir den Zeitpunkt, ab wann die nächste Bremsaufgabe stattfinden kann.", highlight: "brake" },
  { text: "Als nächstes haben wir den **Sensor** für die Hinderniserkennung. Diese Funktion benötigt **1 Zeitschritt** um ausgeführt zu werden. Diese Aufgabe läuft frequentierter ab um Hindernisse erfolgreicher zu erkennen.", highlight: "sensor" },
  { text: "Zu guter Letzt haben wir hier noch die **Multimedia-Funktion**. Diese dürfen in einem hoch modernem Auto nicht fehlen. Alles von Navigation bis hin zu Musik wird hier behandelt. Solche Funktionen sind angenehm für den Nutzer, aber **nicht essentiell** für die Sicherheit.", highlight: "media" },
  { text: "Wenn alle Aufgaben richtig geplant werden dann sollte alles einwandfrei laufen. Schauen wir uns das am Besten bei unserem Auto rechts an. (**Klicken**)", highlight: null },
  { text: "Perfekt! Das Auto hat **rechtzeitig gebremst!** Und niemand ist zu schaden gekommen. So weit erstmal dazu. Dann sehen wir ins im nächsten Schritt ein **weiteres Beispiel** an.", highlight: null },
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
      navigate("/tutorial2");
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
          crash={false}
          stopBeforeObstacle={true}
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
            showDeadlineMarkers: false,
          }}
          highlight={currentStep.highlight}
        />
      </div>
    </div>
  );
}
