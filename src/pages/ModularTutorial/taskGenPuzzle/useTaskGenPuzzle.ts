import { useMemo, useState } from "react";
import type { Task } from "../../../core/task";
import { GA_TasksetGeneration } from "../../../logic/GA_TasksetGeneration";
import { lcmArray } from "../../../utils/formulas";
import { buildGAConfigFromTemplate, type DifficultyLevel } from "../../../logic/taskGenConfigs";

const MAX_RAW_HYPERPERIOD = 200;

type AlgorithmName = "RM" | "DM" | "EDF";

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

export interface UseTaskGenPuzzleResult {
  selectedDifficulty: DifficultyLevel;
  setSelectedDifficulty: (difficulty: DifficultyLevel) => void;
  isGenerating: boolean;
  generatedTasks: Task[];
  selectedAlgorithm: AlgorithmName;
  errorText: string;
  generationVersion: number;
  currentPuzzleDifficulty: number | null;
  hyperperiod: number;
  onConfirmDifficulty: () => void;
}

export function useTaskGenPuzzle(): UseTaskGenPuzzleResult {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("easy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmName>("EDF");
  const [errorText, setErrorText] = useState<string>("");
  const [generationVersion, setGenerationVersion] = useState(0);
  const [currentPuzzleDifficulty, setCurrentPuzzleDifficulty] = useState<number | null>(null);

  const hyperperiod = useMemo(() => {
    if (!generatedTasks.length) return 1;
    return Math.max(1, Math.min(lcmArray(generatedTasks.map((task) => task.T)), MAX_RAW_HYPERPERIOD));
  }, [generatedTasks]);

  const onConfirmDifficulty = () => {
    try {
      setErrorText("");
      setIsGenerating(true);

      const config = buildGAConfigFromTemplate(selectedDifficulty);
      const targetDifficulty = config.targetDifficulty ?? 3;
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
          requirePuzzleViable: false,
          maxRawHyperperiod,
          maxFitnessHorizon: isHard ? 100 : 120,
          maxRuntimeMs: Math.min(isHard ? 550 : 700, remainingMs),
        } as any);

        if (isTasksetUsable(taskset)) {
          break;
        }
      }

      if (!taskset || taskset.length === 0) {
        throw new Error("GA returned an empty taskset.");
      }

      if (!isTasksetUsable(taskset)) {
        throw new Error("Could not generate a valid taskset within the time budget. Try Generate New Taskset.");
      }

      setGeneratedTasks(taskset);
      setSelectedAlgorithm(config.usedAlgorithm as AlgorithmName);
      setCurrentPuzzleDifficulty(targetDifficulty);
      setGenerationVersion((prev) => prev + 1);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to generate taskset.");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
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
  };
}
