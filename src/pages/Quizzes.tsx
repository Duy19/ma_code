import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";


const STORY: StoryStep[] = [
  {
    text: "Test Your knowledge with some quizzes.",
    showQuiz: true,
  },
];

export default function drawGame() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={[]}
      hyperperiod={0}
      interval={[0, 0]}
      algorithm={() => ({ schedule: [], jobInstancesPerTask: new Map() })}
      algorithmName={""}
      defaultAlgorithm={""}
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
    />
  );
}
