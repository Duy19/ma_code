import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";
import type { Task } from "./../core/task";
import { simulateRM, simulateDM, simulateEDF} from "./../logic/simulator";
import { taskGeneration_p, type TasksetConfigTypeA} from "../logic/tasksetGenerator";

const generated = taskGeneration_p();
const config = generated[0] as TasksetConfigTypeA;
const randomTaskset = generated[1] as Task[];
console.log("Generated Taskset for Games Page:", randomTaskset);
console.log("Taskset Config for Games Page:", config);

const STORY: StoryStep[] = [
  {
    text: "Here a random generated taskset.",
    showOverlay: true,
    showCanvas: true,
    selectedAlgorithm: config.algorithm,
  },
];

export default function Chapter3() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={randomTaskset}
      hyperperiod={config.hyperperiod}
      algorithm={config.algorithm === "RM" ? simulateRM : config.algorithm === "DM" ? simulateDM : simulateEDF}
      algorithmName={config.algorithm}
      defaultAlgorithm="EDF"
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
    />
  );
}
