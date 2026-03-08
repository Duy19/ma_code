import { ModularTutorialTemplate } from "../ModularTutorialTemplate";
import type { StoryStep } from "../ModularTutorial/types";
import type { Task } from "../../core/task";
import { simulateRM, simulateEDFWithSuspension } from "../../logic/simulator";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Brakes", C: 1, T: 4, D: 4, O: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, O: 1, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 12, O: 0, color: "#34d399" },
];

const suspensionTaskset: Task[] = [
  { 
    id: "t1", 
    name: "Task1", 
    C: 2, 
    T: 10, 
    D: 10, 
    O: 0,
    suspension: [
      { start: 3, end: 11}
    ],
    color: "#fbbf24"
  },
  { 
    id: "t2", 
    name: "Task2", 
    C: 2, 
    T: 9, 
    D: 9, 
    O: 0,
    color: "#a78bfa"
  },
];

const STORY: StoryStep[] = [
  {
    text: "Hello there! So far you have learned a lot about how to schedule, visualize and analyze tasksets in embedded systems. You learned that EDF is optimal for uniprocessor scheduling, and that RM is a simple and efficient fixed-priority algorithm.",
    showOverlay: true,
    showSidebarPuzzle: false,
    showCanvas: false,
  },
  {
    text: "However, real-world systems often have more complex constraints. One that is very common is if tasks suspend themselves during execution. Suspension basically means a task is is active, but not executing for some reason. This can have a lot of reasons as to why.",
  },
  {
    text: "Here are some reasons listed below for suspension: ",
    showSummary: true,
    summaryIds: ["suspension"],
  },
  {
    text: "In the schedule below you can see EDF scheduling the tasks but this time they can suspend themselves. This is highlighted in the schedule with the red blocks.",
    tasks: suspensionTaskset,
    showOverlay: true,
    showSummary: false,
    showCanvas: true,
    showSidebarPuzzle: false,
  },
  {
    text: "As you can see the suspension of a task can be very long therefore making Task 1 with **C=2** miss its deadline. Standard EDF and RM are not very suitable for handling suspensions."
  },
];

export default function Chapter3() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tutorialTasks}
      hyperperiod={20}
      interval = {[0, 10]}
      algorithm={simulateEDFWithSuspension}
      algorithmName="EDFWithSuspension"
      defaultAlgorithm="EDFWithSuspension"
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
    />
  );
}
