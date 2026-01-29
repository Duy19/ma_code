import { useState } from "react";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateEDF } from "../../logic/simulator";
import TutorialScenario from "../../components/tutorial/TutorialScenario";
import { useNavigate } from "react-router-dom";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY = [
  { text: "Hi there! I'm **Mr. Tau** and I'll explain how an autonomous car schedules tasks. In this case, the car has **3 functions** that need to be executed at different times. **(Click the speech bubble)**", highlight: null },
  { text: "First of all, the **brakes**. These are very important and should always be ready to function. The brakes need **2 time steps** to be executed.", highlight: "brake" },
  { text: "The **green arrows** show you when the next brake task can start.", highlight: "brake" },
  { text: "Next, we have the **sensor** for obstacle detection. This function needs **1 time step** to execute. This task runs more frequently to detect obstacles more successfully.", highlight: "sensor" },
  { text: "Last but not least, we have the **multimedia function**. These are a must in a highly modern car. Everything from navigation to music is handled here. Such functions are pleasant for the user, but **not essential** for safety.", highlight: "media" },
  { text: "If all tasks are planned correctly, everything should run smoothly. Let's take a look at our car on the right. **(Click)**", highlight: null },
  { text: "Perfect! The car **braked in time!** And nobody got hurt. That's it for now. Let's look at **another example** in the next step.", highlight: null },
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
