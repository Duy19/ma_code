import { ModularTutorialTemplate } from "../ModularTutorialTemplate";
import type { StoryStep } from "../ModularTutorial/types";
import type { Task } from "../../core/task";
import { simulateEDFWithSuspension } from "../../logic/simulator";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Brakes", C: 1, T: 4, D: 4, O: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, O: 1, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 12, O: 0, color: "#34d399" },
];


// Tasks for the suspension puzzle where user must place the intervals
const suspensionPuzzleTasks: Task[] = [
  { 
    id: "t1", 
    name: "Task1", 
    C: 2, 
    T: 10, 
    D: 10, 
    O: 0,
    S: 7,
    color: "#fbbf24"
  },
  { 
    id: "t2", 
    name: "Task2", 
    C: 2, 
    T: 9, 
    D: 9, 
    O: 0,
    S: 1,
    suspension: [
      { start: 1, end: 2 }
    ],
    color: "#a78bfa"
  },
];

const STORY: StoryStep[] = [
  {
    text: "Hey! You made it to the game part! In this game, you can place a suspension interval for Task1. For that you have to enter the start and end time of the suspension interval. But this time, your job is to make the task miss its deadline! You have to use up **all** the suspension time given to you!",
    tasks: suspensionPuzzleTasks,
    showOverlay: true,
    showCanvas: true,
    showSuspensionPuzzle: true,
    suspensionPuzzleConfig: {
      tasks: [
        {
          taskId: "t1",
          totalSuspension: 7,
          numIntervals: 1,
          solution: [
            { start: 3, end: 10 },
          ],
        },
      ],
    }
  },
  {
    text: "Great job! Now on to the final and last quiz for this chapter!",
    navigateTo: "/chapter3_quiz",
  },
];

export default function Chapter3() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tutorialTasks}
      hyperperiod={20}
      interval={[0, 10]}
      algorithm={simulateEDFWithSuspension}
      algorithmName="EDFWithSuspension"
      defaultAlgorithm="EDFWithSuspension"
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
    />
  );
}
