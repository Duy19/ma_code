import { useState } from "react";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateEDF } from "../../logic/simulator";
import TutorialScenario from "../../components/tutorial/TutorialScenario";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Brakes", C: 2, T: 3, D: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 4, D: 4, color: "#34d399" },
];

const STORY = [
  { text: "Here we have another example where not everything was properly planned. Everything looks very similar, but this time something goes wrong!", highlight: null },
  { text: "First, the **brakes** again. These still need **2 time steps** to execute. **But** the interval for execution is now **shorter**.", highlight: "brake" },
  { text: "The **sensor** has remained the same here.", highlight: "sensor" },
  { text: "But for **multimedia**, the idea was that it would be better if this function runs with **shorter periods** for a better experience.", highlight: "media" },
  { text: "However, if you look closely, you can already see that the brakes don't have **enough** time! The **red arrows** show when the tasks must be completed **on time**.", highlight: null, highlightExecutions: [{ taskId: "brake", steps: [8, 9, 11, 12] }]},
  { text: "And unfortunately, this leads to a crash! You have to be very careful when planning. Even small changes can have severe consequences.", highlight: null },
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

