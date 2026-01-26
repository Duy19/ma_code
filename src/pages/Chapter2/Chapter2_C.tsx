import { ModularTutorialTemplate, type StoryStep } from "../ModularTutorialTemplate";
import type { Task } from "../../core/task";
import { simulateRM } from "../../logic/simulator";

const tasks: Task[] = [  
    { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
    { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
    { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY: StoryStep[] = [
  {
    text: "Hey there this is Chapter2_C",
    showOverlay: true,
    showCanvas: false,
  },
  {
    text: "There are different bounds for example the **Hyperbolic Bound** which can help us to quickly determine if a taskset is schedulable or not.",
    showOverlay: true,
  },
  {
    text: "Do you remember the Time Demand Analysis (TDA) from the last chapter? Before we dive deeper into analysis techniques, let's do a quick recap with a small drag-and-drop exercise.",
    showOverlay: true,
    showDropGame: true,
    dropGameVaultIds: ["taskutil", "tda", "llub", "hyperbound"],
    waitFor: ({ dropGameCompleted }) => dropGameCompleted === true,
  },
  {
    text: "nice!",
    showOverlay: true,
    navigateTo: "/",
  },
];

export default function Chapter2_C() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tasks}
      hyperperiod={24}
      defaultAlgorithm="RM"
      algorithms={{
        RM: simulateRM,
      }}
      showOverlay={true}
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
      layoutStyle="standard"
      sidebarVisibleFields={["executionTime", "periods", "deadlines", "algorithmSelection"]}
      sidebarEditableFields={[]}
    />
  );
}
