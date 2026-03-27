// @ts-nocheck

import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";
import type { Task } from "./../core/task";
import { simulateRM, simulateDM, simulateEDF} from "./../logic/simulator";
import { taskGeneration_p, type TasksetConfigTypeA} from "../logic/tasksetGenerator";

// const generated = taskGeneration_p();
// const config = generated[0] as TasksetConfigTypeA;
// const randomTaskset = generated[1] as Task[];
// console.log("Generated Taskset for Games Page:", randomTaskset);
// console.log("Taskset Config for Games Page:", config);

const STORY: StoryStep[] = [
  {
    text: "Here the other game.",
    canvasMode: "interactive",
    // showHintCheckboxes: true,
    // showSidebar: true,
    // tasks: randomTaskset,
    // showOverlay: true,
    // showCanvas: true,
    // selectedAlgorithm: config.algorithm,
  },
];

export default function drawGame() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={[]}
      hyperperiod={1}
      // interval={config.interval}
      // algorithm={config.algorithm === "RM" ? simulateRM : config.algorithm === "DM" ? simulateDM : simulateEDF}
      // algorithmName={config.algorithm}
      // defaultAlgorithm={config.algorithm}
      showSidebar={false}
      showButtons={false}
      canvasMode="interactive"
      // hintConfig={[          
      // { type: "fullExecution", unlockAt: 0 },
      // { type: "releaseMarker", unlockAt: 0 },
      // { type: "deadlineMarker", unlockAt: 0 },]}
    />
  );
}
