import { ModularTutorialTemplate } from "../ModularTutorialTemplate";
import type { StoryStep } from "../ModularTutorial/types";
import type { Task } from "../../core/task";
import { simulateEDFWithSuspension } from "../../logic/simulator";

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
    T: 5, 
    D: 5, 
    O: 0,
    S: 3,
    suspension: [
      { start: 0, end: 2 },
      { start: 4, end: 5 },
      { start: 6, end: 9 }
    ],
    color: "#fbbf24"
  },
  { 
    id: "t2", 
    name: "Task2", 
    C: 2, 
    T: 10, 
    D: 10, 
    O: 0,
    color: "#a78bfa"
  },
];
const STORY: StoryStep[] = [
  {
    text: "Hey, nice to have you here! In the previous chapters, you learned the reasons for suspension and that it can affect task scheduling. Now let's have a look at one way to model this.",
    showOverlay: true,
    showSidebarPuzzle: false,
    showCanvas: false,
  },
  {
    text: "First up is the **dynamic self-suspension** model. In this model, the task can suspend itself at any time and for any duration, but it is bounded by the task's suspension **S**.",
    showDefinitions: true,
  },
  
  {
    text: "But instead of talking too much, here is a schedule to look at! In this schedule, Task1 can suspend itself for up to 3 time units. In the first job release, it suspended itself **two times** from **time 0-2** and **time 4-5**, and in the second job release it suspended itself from **time 6-9**.",
    tasks: suspensionTaskset,
    showSidebar: true,
    sidebarVisibleFields: ["executionTime", "periods", "deadlines", "suspension"],
    showOverlay: true,
    showCanvas: true,
  },
  {
    text: "On the sidebar you can see the suspension field, which even shows which suspension the task has. This model is used if the suspension behavior is unknown or hard to predict. But if we know more about the behavior, we can model it more accurately. Let's discuss that in the next part!",
  },
  {
    text: "In the schedule below you can see EDF scheduling the tasks, but this time they can suspend themselves. This is highlighted in the schedule with the red blocks.",
    navigateTo: "/chapter3_C",
    },

];

const DEFINITIONS = [
  {
    term: "Dynamic Self-Suspension",
    definition: "In the dynamic self-suspension model, a task can suspend itself at any time during its execution and for any duration, as long as the total suspension time does not exceed a specified bound (S). This model is used when the suspension behavior of tasks is unknown or difficult to predict (from Chen et al. 2019).",
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
      definitions={DEFINITIONS}
    />
  );
}
