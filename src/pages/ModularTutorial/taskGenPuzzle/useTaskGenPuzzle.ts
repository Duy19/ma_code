import { useMemo, useState } from "react";
import type { Task } from "../../../core/task";
import { GA_TasksetGeneration } from "../../../logic/GA_TasksetGeneration";
import { simulateDM, simulateEDF, simulateRM } from "../../../logic/simulator";
import { lcmArray } from "../../../utils/formulas";
import { buildGAConfigFromTemplate, type DifficultyLevel } from "../../../logic/taskGenConfigs";
import type { GAConfiguration } from "../../../logic/GA_TasksetGeneration";

const MAX_RAW_HYPERPERIOD = 150;

type AlgorithmName = "RM" | "DM" | "EDF";

function getRandomAlgorithm(): AlgorithmName {
  const algorithms: AlgorithmName[] = ["RM", "DM", "EDF"];
  return algorithms[Math.floor(Math.random() * algorithms.length)];
}

function randomInt(min: number, max: number): number {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

function checkViability(
  taskset: Task[],
  algorithm: AlgorithmName,
  maxRawHyperperiod: number
): boolean {
  if (!taskset.length) return false;

  const boundedHyperperiod = Math.max(
    1,
    Math.min(lcmArray(taskset.map((task) => task.T)), maxRawHyperperiod)
  );

  const simulation = algorithm === "RM"
    ? simulateRM(taskset, boundedHyperperiod)
    : algorithm === "DM"
      ? simulateDM(taskset, boundedHyperperiod)
      : simulateEDF(taskset, boundedHyperperiod);

  return taskset.every((task) => {
    const jobs = simulation.jobInstancesPerTask.get(task.id) ?? [];
    return jobs.some((job) => job.jobFinished === true);
  });
}

function evaluatePredictedDifficulty(taskset: Task[], algorithm: AlgorithmName, maxRawHyperperiod: number): number {
  const boundedHyperperiod = Math.max(
    1,
    Math.min(lcmArray(taskset.map((task) => task.T)), maxRawHyperperiod)
  );

  const simulation = algorithm === "RM"
    ? simulateRM(taskset, boundedHyperperiod)
    : algorithm === "DM"
      ? simulateDM(taskset, boundedHyperperiod)
      : simulateEDF(taskset, boundedHyperperiod);

  const N = Math.max(1, simulation.jobInstancesPerTask.size);
  const P = simulation.avgPreemptions ?? 0;
  const giniC = simulation.giniC ?? 0;

  return giniC * (9.996 - (19.724 / N)) + Math.exp(P);
}

function isWithinDifficultyTolerance(
  taskset: Task[],
  algorithm: AlgorithmName,
  maxRawHyperperiod: number,
  targetDifficulty: number,
  tolerance: number
): boolean {
  const predictedDifficulty = evaluatePredictedDifficulty(taskset, algorithm, maxRawHyperperiod);
  return Math.abs(predictedDifficulty - targetDifficulty) <= tolerance;
}

function isTasksetUsable(
  taskset: Task[],
  algorithm: AlgorithmName,
  maxRawHyperperiod: number,
  maxOffset?: number
): boolean {
  if (!taskset || taskset.length === 0) return false;

  const utilization = taskset.reduce((sum, task) => sum + task.C / Math.max(1, task.T), 0);
  if (!Number.isFinite(utilization) || utilization > 1) return false;

  if (maxOffset !== undefined && maxOffset !== null) {
    const offsetsOk = taskset.every((task) => (task.O ?? 0) <= maxOffset);
    if (!offsetsOk) return false;
  }

  if (!checkViability(taskset, algorithm, maxRawHyperperiod)) {
    return false;
  }

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

export interface UseTaskGenPuzzleOptions {
  maxRawHyperperiod?: number;
  maxOffset?: number;
  taskCountRange?: [number, number];
  periodRange?: [number, number];
  generationAttempts?: {
    easyMedium?: number;
    hard?: number;
  };
  generationBudgetMs?: {
    easyMedium?: number;
    hard?: number;
  };
  runtimePerAttemptMs?: {
    easyMedium?: number;
    hard?: number;
  };
  extraConfigOverrides?: Partial<GAConfiguration>;
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

export function useTaskGenPuzzle(options?: UseTaskGenPuzzleOptions): UseTaskGenPuzzleResult {
  const maxRawHyperperiod = options?.maxRawHyperperiod ?? MAX_RAW_HYPERPERIOD;

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("easy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmName>("EDF");
  const [errorText, setErrorText] = useState<string>("");
  const [generationVersion, setGenerationVersion] = useState(0);
  const [currentPuzzleDifficulty, setCurrentPuzzleDifficulty] = useState<number | null>(null);

  const hyperperiod = useMemo(() => {
    return Math.max(1, maxRawHyperperiod);
  }, [maxRawHyperperiod]);

  const onConfirmDifficulty = () => {
    try {
      setErrorText("");
      setIsGenerating(true);

      const configOverrides: Partial<GAConfiguration> = {
        ...options?.extraConfigOverrides,
      };

      if (options?.maxOffset !== undefined) {
        configOverrides.maxOffset = options.maxOffset;
      }

      if (options?.periodRange) {
        configOverrides.periodRange = options.periodRange;
      }
      if (options?.taskCountRange) {
        configOverrides.numberOfTasks = randomInt(options.taskCountRange[0], options.taskCountRange[1]);
      }

      const config = buildGAConfigFromTemplate(selectedDifficulty, configOverrides);
      const targetDifficulty = config.targetDifficulty ?? 3;
      const difficultyTolerance = config.difficultyTolerance ?? 0.15;
      let taskset: Task[] = [];
      const isHard = selectedDifficulty === "hard";
      const maxAttempts = isHard
        ? (options?.generationAttempts?.hard ?? 2)
        : (options?.generationAttempts?.easyMedium ?? 2);
      const totalBudgetMs = isHard
        ? (options?.generationBudgetMs?.hard ?? 3000)
        : (options?.generationBudgetMs?.easyMedium ?? 3000);
      const startedAt = Date.now();

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (Date.now() - startedAt >= totalBudgetMs) {
          break;
        }

        const usedAlgorithm = getRandomAlgorithm();

        taskset = GA_TasksetGeneration({
          ...config,
          usedAlgorithm,
          targetDifficulty,
        });

        const tasksetIsUsable = isTasksetUsable(taskset, usedAlgorithm, maxRawHyperperiod, config.maxOffset);
        const tasksetMatchesDifficulty = tasksetIsUsable
          && isWithinDifficultyTolerance(
            taskset,
            usedAlgorithm,
            maxRawHyperperiod,
            targetDifficulty,
            difficultyTolerance
          );

        if (tasksetMatchesDifficulty) {
          config.usedAlgorithm = usedAlgorithm;
          break;
        }
      }

      if (!taskset || taskset.length === 0) {
        throw new Error("GA returned an empty taskset.");
      }

      const finalUsable = isTasksetUsable(taskset, config.usedAlgorithm as AlgorithmName, maxRawHyperperiod, config.maxOffset);
      const finalWithinTolerance = finalUsable
        && isWithinDifficultyTolerance(
          taskset,
          config.usedAlgorithm as AlgorithmName,
          maxRawHyperperiod,
          targetDifficulty,
          difficultyTolerance
        );

      if (!finalWithinTolerance) {
        throw new Error("Could not generate a valid taskset within difficulty tolerance and time budget. Try Generate New Taskset.");
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
