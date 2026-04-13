// @ts-nocheck

import { useMemo } from "react";
import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";
import { simulateRM, simulateDM, simulateEDF} from "../logic/simulator";
import { TaskGenPuzzleOverlay } from "./ModularTutorial/taskGenPuzzle/TaskGenPuzzleOverlay";
import { useTaskGenPuzzle } from "./ModularTutorial/taskGenPuzzle/useTaskGenPuzzle";

function getAlgorithmByName(algorithmName: "RM" | "DM" | "EDF") {
  if (algorithmName === "RM") return simulateRM;
  if (algorithmName === "DM") return simulateDM;
  return simulateEDF;
}

export default function DetectiveGame() {
  const {
    selectedDifficulty,
    setSelectedDifficulty,
    isGenerating,
    generatedTasks,
    selectedAlgorithm,
    errorText,
    generationVersion,
    currentPuzzleDifficulty,
    hyperperiod,
    onConfirmDifficulty,
  } = useTaskGenPuzzle();

  const story: StoryStep[] = useMemo(() => {
    if (generatedTasks.length === 0) {
      return [
        {
          text: "Generate a puzzle-viable taskset and solve it in the sidebar.",
          showHintCheckboxes: false,
          showOverlay: true,
          showCanvas: false,
          selectedAlgorithm,
        },
      ];
    }

    return [
      {
        text: "Generated puzzle loaded. Solve it by editing parameters in the sidebar.",
        showHintCheckboxes: false,
        showOverlay: true,
        showCanvas: true,
        showSidebarPuzzle: true,
        selectedAlgorithm,
        puzzleVisibleFields: ["executionTime", "periods", "deadlines", "offsets", "algorithmSelection"],
        puzzleEditableFields: ["executionTime", "periods", "deadlines", "offsets", "algorithmSelection"],
        maxFieldValues: {
          executionTime: 100,
          periods: 100,
          deadlines: 100,
          offsets: 100,
        },
        sidebarPuzzleConfig: {
          puzzleTasks: generatedTasks,
          interval: [0, hyperperiod],
          algorithm: getAlgorithmByName(selectedAlgorithm) as any,
          algorithmName: selectedAlgorithm,
        },
        highlight: null,
      },
    ];
  }, [generatedTasks, selectedAlgorithm, hyperperiod]);

  return (
    <ModularTutorialTemplate
      key={`detective-template-${generationVersion}`}
      story={story}
      baseTasks={generatedTasks}
      hyperperiod={hyperperiod}
      algorithms={{
        RM: simulateRM,
        DM: simulateDM,
        EDF: simulateEDF,
      }}
      defaultAlgorithm={selectedAlgorithm}
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
      renderOverlay={() => (
        <TaskGenPuzzleOverlay
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          onConfirmDifficulty={onConfirmDifficulty}
          isGenerating={isGenerating}
          hasTaskset={generatedTasks.length > 0}
          currentPuzzleDifficulty={currentPuzzleDifficulty}
          errorText={errorText}
        />
      )}
    />
  );
}
