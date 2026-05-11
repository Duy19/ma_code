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
    suspension: {
      offset: 1,
      duration: 2,
      period: 5,
    },
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
    text: "So here we are for the last theoretical part! If we know more about the suspension behavior and when it will happen, we can model it using segmented self-suspension.",
    showOverlay: true,
    showSidebarPuzzle: false,
    showCanvas: false,
    showDefinitions: true,
  },
  {
    text: "Let's look directly at the example schedule below. Here each of Task1's jobs suspend themselves for 2 time units starting 1 time unit after their release. This pattern repeats every time for a specific interval. Here, it coincides with the task's period, but it doesn't have to be the case. It also **doesn't** mean that the suspension has to always be the same length!",
    tasks: suspensionTaskset,
    showOverlay: true,
    showSummary: false,
    showSidebar: true,
    sidebarVisibleFields: ["executionTime", "periods","suspension", "deadlines"],
    sidebarEditableFields:[],
    showCanvas: true,
    showSidebarPuzzle: false,
  },
  {
    text: "It just means that we know how the segmented executions for each job of a task look beforehand! Here we have a 1-segmented self-suspending task, where each execution is interrupted by exactly 1 suspension interval. But sadly, our student couldn't make all of that in time. So for now you can later play around with this type of repeating suspension behavior in the FreeScheduler page!",
  },
  {
    text: "The sidebar shows the suspension pattern for Task1, which is the offset when the suspension starts every interval, the duration of the suspension, and lastly the interval in which this pattern repeats. But for now, that's all for the theory! Next up is a small little game where you can be a bit more mischievous using suspension!",
    navigateTo: "/chapter3_D",
  },
];

const DEFINITIONS = [
  {
    term: "Segmented Self-Suspension",
    definition: "Segmented self-suspension is a model where the suspension behavior of a task is known beforehand and can be modeled more accurately. In this model, each job of a task can have multiple execution segments separated by suspension segments (from Chen et al. 2019).",
  },
];
export default function Chapter3() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tutorialTasks}
      hyperperiod={10}
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
