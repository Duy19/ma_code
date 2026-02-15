import { ModularTutorialTemplate } from "../ModularTutorialTemplate";
import type { StoryStep } from "../ModularTutorial/types";
import type { Task } from "../../core/task";
import { simulateRM } from "../../logic/simulator";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Brakes", C: 1, T: 4, D: 4, O: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, O: 1, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 12, O: 0, color: "#34d399" },
];

const STORY: StoryStep[] = [
  {
    text: "You are already familiar with some scheduling strategies from Chapter 1. Fixed-Priority Scheduling has the advantage that it is simpler to implement.",
    showOverlay: true,
    showCanvas: false,
    showSidebarPuzzle: true,
    puzzleVisibleFields: ["executionTime", "periods", "deadlines", "offsets", "algorithmSelection"],
    puzzleEditableFields: ["executionTime", "periods", "deadlines", "offsets", "algorithmSelection"],
    sidebarPuzzleConfig: {
      puzzleTasks: tutorialTasks,
      algorithm: simulateRM,
      algorithmName: "RM",
    },
    waitFor: ({ sidebarPuzzleCompleted }) => sidebarPuzzleCompleted,
  },
  {
    text: "You only need to tell the system at the beginning which tasks have which priority. Since these do not change, it is easier to plan.",
    showOverlay: true,
    showSidebarPuzzle: false,
  },
];

export default function Chapter3() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tutorialTasks}
      hyperperiod={24}
      algorithm={simulateRM}
      algorithmName="RM"
      defaultAlgorithm="RM"
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
    />
  );
}
