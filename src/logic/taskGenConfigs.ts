// @ts-nocheck
import type { GAConfiguration } from "./GA_TasksetGeneration";

export type DifficultyLevel = "easy" | "medium" | "hard";

interface DifficultyTemplate {
  numTasks: {
    min: number;
    max: number;
  };
  periodRange: [number, number];
  ga: {
    populationSize: number;
    generations: number;
    selectionAmount: number;
    mutationRate: number;
  };
  algorithm: GAConfiguration["usedAlgorithm"];
}

const DIFFICULTY_TEMPLATES: Record<DifficultyLevel, DifficultyTemplate> = {
  easy: {
    numTasks: { min: 2, max: 6 },
    periodRange: [1, 50],
    ga: {
      populationSize: 100,
      generations: 30,
      selectionAmount: 20,
      mutationRate: 0.08,
    },
    algorithm: "EDF, RM, DM",
  },
  medium: {
    numTasks: { min: 3, max: 5 },
    periodRange: [1, 50],
    ga: {
      populationSize: 100,
      generations: 30,
      selectionAmount: 20,
      mutationRate: 0.1,
    },
    algorithm: "EDF, RM, DM",
  },
  hard: {
    numTasks: { min: 3, max: 6 },
    periodRange: [1, 50],
    ga: {
      populationSize: 100,
      generations: 30,
      selectionAmount: 20,
      mutationRate: 0.12,
    },
    algorithm: "EDF, RM, DM",
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
    usedAlgorithm: template.algorithm,
    numberOfTasks,
    periodRange: template.periodRange,
    targetDifficulty: exactDifficulty,
    ...overrides,
  };
}
