// @ts-nocheck

import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";

const STORY: StoryStep[] = [
  {
    text: "Here the other game.",
    canvasMode: "interactive",
  },
];

export default function drawGame() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={[]}
      hyperperiod={1}
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
