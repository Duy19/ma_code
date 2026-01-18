import { useState } from "react";
import SchedulerCanvas from "../../components/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateRM, simulateDM } from "../../logic/simulator";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 1, T: 6, D: 5, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 12, D: 6, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 4, color: "#34d399" },
];

const STORY = [
    { text: "Schauen wir uns diesmal Aufgaben an die mit einem **Fixed-Priority Scheduling** geplant wurden.", highlight: null },
    { text: "Bei Fixed-Priority Scheduling werden Aufgaben mit fester Priorität geplant. Diese bleiben unverändert für den gesamten Zeitraum.", highlight: null },
    { text: "Ich werde dir sowohl **Rate-Monotonic (RM)** als auch **Deadline-Monotonic (DM)** vorstellen als Strategien.", highlight: null },
    { text: "Bei **Rate-Monotonic** werden Aufgaben mit kürzeren Perioden priorisiert. Schau dir das untere Schedule gerne an", highlight: null },
    { text: "Bei **Deadline-Monotonic** hingegen werden Aufgaben mit kürzeren Deadlines priorisiert. Schauen wir uns das Schedule nun mit DM an **(Klicken)**", highlight: null },
    { text: "Erkennst du den Unterschied?", highlight: null },
    { text: "Im letzten Beispiel mit RM hat Multimedia  sogar die Deadline verpasst beim Zeitschritt 4!", highlight: null, highlightExecutions: [{ taskId: "media", steps: [3, 4, 5] }] },
    { text: "Die Prioritäten sind diesmal auch ganz anders gewesen. In diesem Falle ist DM besser geeignet, um keine Deadlines zu verpassen.", highlight: null },
    { text: "Schauen wir uns im nächsten Schritt nochmal ein Beispiel an mit allen bisherigen Algorithmen an die wir kennengelernt haben. ", highlight: null },    
];

function renderRMSchedule(schedule: ScheduleEntry[], hyperperiod: number, currentStep: any) {
    return (
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
          highlightExecutions={currentStep.highlightExecutions}
          highlight={currentStep.highlight}
        />
      </div>
    );
}

function renderDMSchedule(schedule: ScheduleEntry[], hyperperiod: number, currentStep: any) {
    return (
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
          highlightExecutions={currentStep.highlightExecutions}
          highlight={currentStep.highlight}
        />
      </div>
    );
}


export default function TutorialStep1() {
  const hyperperiod = 24;
  const schedule: ScheduleEntry[] = simulateRM(tutorialTasks, hyperperiod);
  const scheduleDM: ScheduleEntry[] = simulateDM(tutorialTasks, hyperperiod);
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
      {step > 4 ? renderDMSchedule(scheduleDM, hyperperiod, currentStep) : renderRMSchedule(schedule, hyperperiod, currentStep)}
    </div>
  );
}
