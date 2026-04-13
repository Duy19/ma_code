// @ts-nocheck
import type { GAConfiguration } from "./GA_TasksetGeneration";

export type DifficultyLevel = "easy" | "medium" | "hard";

interface DifficultyTemplate {
  numTasks: {
    min: number;
    max: number;
  };
  periodRange: [number, number];
  utilizationRange: [number, number];
  executionTimeRange: [number, number];
  ga: {
    populationSize: number;
    generations: number;
    selectionAmount: number;
    mutationRate: number;
    crossoverRate: number;
    earlyStopPatience: number;
    maxFitnessHorizon: number;
    maxRuntimeMs: number;
    maxFitnessEvaluations: number;
  };
  algorithm: GAConfiguration["usedAlgorithm"];
  fitnessCoefficients: {
    bias: number;
    n: number;
    u: number;
    p: number;
    l: number;
  };
  structureDistanceWeight?: number;
}

const DIFFICULTY_TEMPLATES: Record<DifficultyLevel, DifficultyTemplate> = {
  easy: {
    numTasks: { min: 2, max: 3 },
    periodRange: [4, 20],
    utilizationRange: [0.1, 0.3],
    executionTimeRange: [1, 20],
    ga: {
      populationSize: 30,
      generations: 20,
      selectionAmount: 10,
      mutationRate: 0.08,
      crossoverRate: 0.85,
      earlyStopPatience: 6,
      maxFitnessHorizon: 160,
      maxRuntimeMs: 1200,
      maxFitnessEvaluations: 1800,
    },
    algorithm: "EDF",
    fitnessCoefficients: {
      bias: 0,
      n: 0.29683428,
      u: 4.00362478,
      p: 1.54322871,
      l: 0.10781809,
    },
  },
  medium: {
    numTasks: { min: 3, max: 5 },
    periodRange: [2, 30],
    utilizationRange: [0.25, 0.6],
    executionTimeRange: [1, 30],
    ga: {
      populationSize: 30,
      generations: 20,
      selectionAmount: 10,
      mutationRate: 0.1,
      crossoverRate: 0.88,
      earlyStopPatience: 6,
      maxFitnessHorizon: 180,
      maxRuntimeMs: 1600,
      maxFitnessEvaluations: 2200,
    },
    algorithm: "EDF",
    fitnessCoefficients: {
      bias: 0,
      n: 0.29683428,
      u: 4.00362478,
      p: 1.54322871,
      l: 0.10781809,
    },
  },
  hard: {
    numTasks: { min: 3, max: 6 },
    periodRange: [2, 50],
    utilizationRange: [0.6, 1],
    executionTimeRange: [1, 50],
    ga: {
      populationSize: 30,
      generations: 20,
      selectionAmount: 10,
      mutationRate: 0.12,
      crossoverRate: 0.9,
      earlyStopPatience: 6,
      maxFitnessHorizon: 120,
      maxRuntimeMs: 1200,
      maxFitnessEvaluations: 900,
    },
    algorithm: "EDF",
    fitnessCoefficients: {
      bias: 0,
      n: 0.29683428,
      u: 4.00362478,
      p: 1.54322871,
      l: 0.10781809,
    },
  },
};

function getRandomDifficultyValue(difficulty: DifficultyLevel): number {
  if (difficulty === "easy") return 1 + Math.random(); // 1-2
  if (difficulty === "medium") return 2 + Math.random() * 2; // 2-4
  return 4 + Math.random(); // 4-5
}

function getRandomNumberOfTasks(difficulty: DifficultyLevel): number {
  const { min, max } = DIFFICULTY_TEMPLATES[difficulty].numTasks;
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function buildGAConfigFromTemplate(
  difficulty: DifficultyLevel,
  overrides?: Partial<GAConfiguration>
): GAConfiguration {
  const template = DIFFICULTY_TEMPLATES[difficulty];
  const targetDifficulty = getRandomDifficultyValue(difficulty);
  const exactDifficulty = Math.max(1, Math.min(5, Number(targetDifficulty.toFixed(1))));
  const numberOfTasks = getRandomNumberOfTasks(difficulty);

  return {
    populationSize: template.ga.populationSize,
    generations: template.ga.generations,
    selectionAmount: template.ga.selectionAmount,
    mutationRate: template.ga.mutationRate,
    crossoverRate: template.ga.crossoverRate,
    maxFitnessHorizon: template.ga.maxFitnessHorizon,
    maxRuntimeMs: template.ga.maxRuntimeMs,
    maxFitnessEvaluations: template.ga.maxFitnessEvaluations,
    earlyStopPatience: template.ga.earlyStopPatience,
    fitnessFunction: "linear" as const,
    fitnessCoefficients: template.fitnessCoefficients,
    usedAlgorithm: template.algorithm,
    numberOfTasks,
    periodRange: template.periodRange,
    utilizationRange: template.utilizationRange,
    executionTimeRange: template.executionTimeRange,
    targetDifficulty: exactDifficulty,
    structureDistanceWeight: template.structureDistanceWeight,
    ...overrides,
  };
}
