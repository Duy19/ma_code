// @ts-nocheck

import { useMemo, useState } from "react";
import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";
import type { Task } from "../core/task";
import { simulateRM, simulateDM, simulateEDF} from "../logic/simulator";
import { GA_TasksetGeneration } from "../logic/GA_TasksetGeneration";
import { lcmArray } from "../utils/formulas";

type DifficultyChoice = "easy" | "medium" | "hard";
const MAX_RAW_HYPERPERIOD = 1000;

function difficultyToNumeric(choice: DifficultyChoice): number {
  if (choice === "easy") return 1;
  if (choice === "medium") return 3;
  return 5;
}

function randomDifficultyValue(choice: DifficultyChoice): number {
  if (choice === "easy") return 1 + Math.random(); // 1-2
  if (choice === "medium") return 2 + Math.random() * 2; // 2-4
  return 4 + Math.random(); // 4-5
}

function buildGAConfigFromDifficulty(choice: DifficultyChoice) {
  const difficultyValue = randomDifficultyValue(choice);
  const exactDifficulty = Math.max(1, Math.min(5, Number(difficultyValue.toFixed(1))));

  let numberOfTasks = 3;
  let periodRange: [number, number] = [4, 18];
  let utilizationRange: [number, number] = [0.08, 0.3];
  let generations = 20;
  let mutationRate = 0.08;
  let crossoverRate = 0.85;
  let maxFitnessHorizon = 160;
  let maxRuntimeMs = 1200;
  let maxFitnessEvaluations = 1800;

  if (difficultyValue >= 2 && difficultyValue < 4) {
    numberOfTasks = 4;
    periodRange = [3, 30];
    utilizationRange = [0.2, 0.6];
    generations = 20;
    mutationRate = 0.1;
    crossoverRate = 0.88;
    maxFitnessHorizon = 180;
    maxRuntimeMs = 1600;
    maxFitnessEvaluations = 2200;
  }
  else if (difficultyValue >= 4) {
    numberOfTasks = 5;
    periodRange = [2, 100];
    utilizationRange = [0.6, 1];
    generations = 30;
    mutationRate = 0.12;
    crossoverRate = 0.9;
    maxFitnessHorizon = 120;
    maxRuntimeMs = 1200;
    maxFitnessEvaluations = 900;
  }

  return {
    populationSize: 50,
    generations,
    selectionAmount: 10,
    mutationRate,
    crossoverRate,
    maxFitnessHorizon,
    maxRuntimeMs,
    maxFitnessEvaluations,
    earlyStopPatience: 6,
    fitnessFunction: "linear" as const,
    fitnessCoefficients: {
      bias: 0,
      n: 0.29683428,
      u: 4.00362478,
      p: 1.54322871,
      l: 0.10781809,
    },
    usedAlgorithm: "EDF" as const,
    numberOfTasks,
    periodRange,
    utilizationRange,
    executionTimeRange: [1, 20] as [number, number],
    targetDifficulty: exactDifficulty,
  };
}

function buildStory(algorithmName: "RM" | "DM" | "EDF"): StoryStep[] {
  return [
    {
      text: "Generate a puzzle-viable taskset and solve it in the sidebar.",
      showHintCheckboxes: false,
      showOverlay: true,
      showCanvas: false,
      selectedAlgorithm: algorithmName,
    },
  ];
}

function getAlgorithmByName(algorithmName: "RM" | "DM" | "EDF") {
  if (algorithmName === "RM") return simulateRM;
  if (algorithmName === "DM") return simulateDM;
  return simulateEDF;
}

function isTasksetUsable(taskset: Task[]): boolean {
  if (!taskset || taskset.length === 0) return false;

  const utilization = taskset.reduce((sum, task) => sum + task.C / Math.max(1, task.T), 0);
  if (!Number.isFinite(utilization) || utilization > 1) return false;

  return taskset.every((task) =>
    Number.isFinite(task.C)
    && Number.isFinite(task.T)
    && Number.isFinite(task.D)
    && task.C >= 1
    && task.T >= 1
    && task.C <= task.D
    && task.D <= task.T
  );
}

export default function DetectiveGame() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyChoice>("easy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<"RM" | "DM" | "EDF">("EDF");
  const [errorText, setErrorText] = useState<string>("");
  const [generationVersion, setGenerationVersion] = useState(0);
  const [currentPuzzleDifficulty, setCurrentPuzzleDifficulty] = useState<number | null>(null);

  const hyperperiod = useMemo(() => {
    if (!generatedTasks.length) return 1;
    return Math.max(1, Math.min(lcmArray(generatedTasks.map(t => t.T)), MAX_RAW_HYPERPERIOD));
  }, [generatedTasks]);

  const onConfirmDifficulty = () => {
    try {
      setErrorText("");
      setIsGenerating(true);
      const config = buildGAConfigFromDifficulty(selectedDifficulty);
      const targetDifficulty = config.targetDifficulty ?? difficultyToNumeric(selectedDifficulty);
      let taskset: Task[] = [];
      const isHard = selectedDifficulty === "hard";
      const maxRawHyperperiod = MAX_RAW_HYPERPERIOD;
      const maxAttempts = isHard ? 1 : 2;
      const totalBudgetMs = isHard ? 1800 : 3000;
      const startedAt = Date.now();

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (Date.now() - startedAt >= totalBudgetMs) {
          break;
        }

        const remainingMs = Math.max(250, totalBudgetMs - (Date.now() - startedAt));
        taskset = GA_TasksetGeneration({
          ...config,
          targetDifficulty,
          seedPopulationRatio: 0.6,
          seedTopCount: 8,
          requirePuzzleViable: false,
          maxRawHyperperiod,
          maxFitnessHorizon: isHard ? 100 : 120,
          maxRuntimeMs: Math.min(isHard ? 550 : 700, remainingMs),
        });

        if (isTasksetUsable(taskset)) {
          break;
        }
      }

      if (!taskset || taskset.length === 0) {
        throw new Error("GA returned an empty taskset.");
      }

      if (!isTasksetUsable(taskset)) {
        throw new Error(
          "Could not generate a valid taskset within the time budget. Try Generate New Taskset."
        );
      }

      setGeneratedTasks(taskset);
      setSelectedAlgorithm(config.usedAlgorithm);
      setCurrentPuzzleDifficulty(targetDifficulty);
      setGenerationVersion((prev) => prev + 1);
    }
    catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to generate taskset.");
    }
    finally {
      setIsGenerating(false);
    }
  };

  const hasTaskset = generatedTasks.length > 0;
  const algorithmFn = getAlgorithmByName(selectedAlgorithm);

  const STORY: StoryStep[] = hasTaskset
    ? [
        {
          text: "Generated puzzle loaded. Solve it by editing parameters in the sidebar.",
          showHintCheckboxes: false,
          showOverlay: true,
          showCanvas: true,
          showSidebarPuzzle: true,
          selectedAlgorithm: selectedAlgorithm,
          puzzleVisibleFields: ["executionTime", "periods", "deadlines", "algorithmSelection"],
          puzzleEditableFields: ["executionTime", "periods", "deadlines", "algorithmSelection"],
          sidebarPuzzleConfig: {
            puzzleTasks: generatedTasks,
            interval: [0, hyperperiod],
            algorithm: algorithmFn,
            algorithmName: selectedAlgorithm,
          },
        },
      ]
    : buildStory(selectedAlgorithm);

  return (
    <ModularTutorialTemplate
      key={`detective-template-${generationVersion}`}
      story={STORY}
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
        <div
          style={{
            width: "min(840px, 100%)",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
            padding: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Detective Taskset Generator</h3>
            <button
              type="button"
              onClick={onConfirmDifficulty}
              disabled={isGenerating}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 700,
                color: "#fff",
                background: isGenerating ? "#94a3b8" : "#0f766e",
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating
                ? "Generating with GA..."
                : hasTaskset
                  ? "Generate New Taskset"
                  : "Generate Taskset"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelectedDifficulty("easy")}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: selectedDifficulty === "easy" ? "2px solid #16a34a" : "1px solid #cbd5e1",
                background: selectedDifficulty === "easy" ? "#ecfdf3" : "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Easy 1-2
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty("medium")}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: selectedDifficulty === "medium" ? "2px solid #d97706" : "1px solid #cbd5e1",
                background: selectedDifficulty === "medium" ? "#fffbeb" : "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Medium 2-4
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty("hard")}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: selectedDifficulty === "hard" ? "2px solid #dc2626" : "1px solid #cbd5e1",
                background: selectedDifficulty === "hard" ? "#fef2f2" : "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Hard 4-5
            </button>
          </div>

          <p style={{ margin: 0, color: "#334155" }}>
            {hasTaskset
              ? `Current puzzle: ${selectedDifficulty.toUpperCase()}${currentPuzzleDifficulty !== null ? ` (${currentPuzzleDifficulty.toFixed(1)}/5)` : ""} | Genetic Algorithm`
              : "No taskset generated yet. Choose options and click Generate Taskset."}
          </p>

          {errorText && <p style={{ margin: 0, color: "#b91c1c" }}>{errorText}</p>}
        </div>
      )}
    />
  );
}
