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
    text: "So ready for another game? Let's play a little drag and drop game!",
    showOverlay: true,
    showCanvas: false,
  },
  {
    text: "This time you have to complete all the complicated formulas you learned so far. For that you have to drag and drop the correct parts into the right spots.",
    showOverlay: true,
    showDropGame: true,
    dropGameVaultIds: ["taskutil", "tda", "llub", "hyperbound"],
    waitFor: ({ dropGameCompleted }) => dropGameCompleted === true,
  },
  {
    text: "Very nice! You completed the drag and drop game. Hope you had fun and it helped you remember the concepts better!",
    showOverlay: true,
    navigateTo: "/",
  },
];

export default function Chapter2_DragDrop() {
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
