// @ts-nocheck
import { useMemo } from "react";
import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";
import { simulateRM, simulateDM, simulateEDF } from "../logic/simulator";
import { TaskGenPuzzleOverlay } from "./ModularTutorial/taskGenPuzzle/TaskGenPuzzleOverlay";
import { useTaskGenPuzzle } from "./ModularTutorial/taskGenPuzzle/useTaskGenPuzzle";

export default function DrawGame() {
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
  } = useTaskGenPuzzle({
    maxRawHyperperiod: 25,
    taskCountRange: [2, 4],
    periodRange: [1, 25],
    extraConfigOverrides: {
      maxOffset: 5,
    },
  });

  const story: StoryStep[] = useMemo(() => {
    if (generatedTasks.length === 0) {
      return [
        {
          text: "Generate a draw-the-schedule puzzle first.",
          showHintCheckboxes: false,
          showOverlay: true,
          showCanvas: false,
          showButtons: false,
          showSidebar: false,
          selectedAlgorithm,
        },
      ];
    }

    return [
      {
        text: "Draw the full schedule for the shown taskset.",
        showHintCheckboxes: true,
        showOverlay: true,
        showCanvas: true,
        showButtons: true,
        showSidebar: true,
        waitFor: ({ scheduleCorrect }) => scheduleCorrect === true,
        canvasMode: "interactive",
        selectedAlgorithm,
        sidebarVisibleFields: ["executionTime", "periods", "deadlines", "offsets", "algorithmSelection"],
        sidebarEditableFields: [],
      },
    ];
  }, [generatedTasks, selectedAlgorithm]);

  return (
    <ModularTutorialTemplate
      key={`draw-template-${generationVersion}`}
      story={story}
      baseTasks={generatedTasks}
      hyperperiod={hyperperiod}
      algorithms={{
        RM: simulateRM,
        DM: simulateDM,
        EDF: simulateEDF,
      }}
      hintConfig={[          
          { type: "fullExecution", unlockAt: 0 },
          { type: "releaseMarker", unlockAt: 0 },
          { type: "deadlineMarker", unlockAt: 0 },]}
      defaultAlgorithm={selectedAlgorithm}
      showSidebar={generatedTasks.length > 0}
      showButtons={generatedTasks.length > 0}
      canvasMode="interactive"
      renderOverlay={() => (
        <TaskGenPuzzleOverlay
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          onConfirmDifficulty={onConfirmDifficulty}
          isGenerating={isGenerating}
          hasTaskset={generatedTasks.length > 0}
          currentPuzzleDifficulty={currentPuzzleDifficulty}
          errorText={errorText}
          title="Drawing Game Level Generator"
          description={
            generatedTasks.length > 0
              ? `Current puzzle: ${selectedDifficulty.toUpperCase()} | Draw the schedule by clicking or dragging the execution blocks.`
              : undefined
          }
        />
      )}
    />
  );
}
