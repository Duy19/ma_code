import { ModularTutorialTemplate } from "../ModularTutorialTemplate";
import type { StoryStep } from "../ModularTutorial/types";
import type { Task } from "../../core/task";
import { simulateEDFWithSuspension, simulateRMWithSuspension, simulateDMWithSuspension } from "../../logic/simulator";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Brakes", C: 1, T: 4, D: 4, O: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, O: 1, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 12, O: 0, color: "#34d399" },
];

const STORY: StoryStep[] = [
  {
    text: "IT IS TIME FOR THE **FINAL QUIZ**! Will you become a millionaire? NO! But maybe you have learned something about suspension!",
    showOverlay: true,
    showSidebarPuzzle: false,
    showCanvas: false,
    showQuiz: true,
    quizQuestionIds:["c3_q1", "c3_q2", "c3_q3", "c3_q4"],
  },
];

export default function Chapter3() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tutorialTasks}
      hyperperiod={20}
      interval={[0, 10]}
      algorithms={{
        "EDFWithSuspension": simulateEDFWithSuspension,
        "RMWithSuspension": simulateRMWithSuspension,
        "DMWithSuspension": simulateDMWithSuspension,
      }}
      defaultAlgorithm="EDFWithSuspension"
      algorithmName="EDFWithSuspension"
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
    />
  );
}
