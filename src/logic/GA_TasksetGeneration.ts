// @ts-nocheck
import type { Task } from "../core/task";
import { lcmArray } from "../utils/formulas";
import { simulateEDF, simulateRM, simulateDM } from "./simulator";
import type { ScheduleResult } from "./simulator";
import tasksetDatabase from "../../costfunction/tasksetParameters.json";

export interface fittingParameters {
  N?: number;
  U?: number;
  P?: number;
  L?: number;
  giniT?: number;
  giniC?: number;
}

interface coefficients {
  linear?: {
    bias?: number;
    n?: number;
    u?: number;
    p?: number;
    l?: number;
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
  };
  quadratic?: {
    bias?: number;
  };
}


interface databaseEntry {
  taskset_id: string;
  difficulty: number;
  algorithm: string;
  tasks: Array<{id: string; C: number; T: number; D: number; O?: number; S?: number;}>;
}

interface TasksetDatabase {
  tasksets: databaseEntry[];
}

export interface GAConfiguration {
  populationSize: number;
  generations: number;
  selectionAmount: number;
  mutationRate: number;
  crossoverRate: number;
  maxHyperperiod?: number;
  targetDifficulty?: number;
  puzzleViable?: boolean;
  populationRatio?: number;
  topCount?: number;
  fitnessFunction: "linear" | "polynomial";
  fitnessCoefficients?: coefficients["linear"] | coefficients["polynomial"];
  usedAlgorithm: "RM" | "DM" | "EDF";
  numberOfTasks: number;
  periodRange: [number, number];
  utilizationRange: [number, number];
  executionTimeRange: [number, number];
}

type RepairStrategy = "reduceC" | "increaseT" | "skip";

interface Individual {
  taskset: Task[];
  fitness: number;
}

interface Candidate {
  taskset: Task[];
  popularity: number;
}

function getTaskColor(index: number): string {
  const hue = (index * 67) % 360;
  return `hsl(${hue}, 72%, 58%)`;
}

function calculateUtilization(tasks: Task[]): number {
  return tasks.reduce((sum, task) => sum + task.C / task.T, 0);
}

function getDatabaseTasksets(config: GAConfiguration): databaseEntry[] {
  // Filter for tasksets in json file (matcing algorithm) and as close difficulty as possible for initial population
  const db = tasksetDatabase as TasksetDatabase;

  const matchingTasksets = db.tasksets.filter((entry) => {
    const supportedAlgorithms = entry.algorithm
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);

    return supportedAlgorithms.includes(config.usedAlgorithm.toUpperCase());
  });

  if (!matchingTasksets.length) {
    return [];
  }

  if (config.targetDifficulty === undefined || config.targetDifficulty === null) {
    return matchingTasksets;
  }

  const targetDifficulty = config.targetDifficulty;
  const exactDifficultyMatches = matchingTasksets.filter(
    (entry) => entry.difficulty === targetDifficulty
  );

  if (exactDifficultyMatches.length) {
    return exactDifficultyMatches;
  }

  let minDistance = Number.POSITIVE_INFINITY;
  for (const entry of matchingTasksets) {
    const distance = Math.abs(entry.difficulty - targetDifficulty);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return matchingTasksets.filter(
    (entry) => Math.abs(entry.difficulty - targetDifficulty) === minDistance
  );
}

function convertDatabaseEntryToTaskset(entry: databaseEntry): Task[] {
  return entry.tasks.map((task, index) => ({
    id: task.id,
    name: `Task ${task.id}`,
    C: task.C,
    T: task.T,
    D: task.D,
    O: task.O,
    color: getTaskColor(index),
  }));
}

function convertToNaturalNumber(value: number, minValue = 1): number {
  if (!Number.isFinite(value)) {
    return minValue;
  }
  return Math.max(minValue, Math.floor(value));
}

function normalizeValues(task: Task, config: GAConfiguration): Task {
  const minPeriod = convertToNaturalNumber(config.periodRange[0], 1);
  const maxPeriod = convertToNaturalNumber(config.periodRange[1], minPeriod);

  const convertedT = convertToNaturalNumber(task.T, minPeriod);
  const newT = Math.min(maxPeriod, Math.max(minPeriod, convertedT));

  const convertedC = convertToNaturalNumber(task.C, 1);
  const newC = Math.min(newT, Math.max(1, convertedC));

  const convertedD = convertToNaturalNumber(task.D, newC);
  const newD = Math.min(newT, Math.max(newC, convertedD));

  const convertedO = Number.isFinite(task.O as number)
    ? Math.floor(task.O as number)
    : 0;
  const newO = Math.min(Math.max(0, newT - 1), Math.max(0, convertedO));

  return {
    ...task,
    C: newC,
    T: newT,
    D: newD,
    O: newO,
  };
}


function generateRandomTaskset(config: GAConfiguration): Task[] {
  const tasks: Task[] = [];
  
  for (let i = 0; i < config.numberOfTasks; i++) {
    const T = Math.floor(Math.random() * (config.periodRange[1] - config.periodRange[0] + 1)) + config.periodRange[0];
    const D = T;
    const C = Math.max(1, Math.floor(D));
    const O = Math.floor(Math.random() * T);
    const generatedTask: Task = { id: `task-${i}`, name: `Task ${i}`, C, T, D, O, color: getTaskColor(i) };
    tasks.push(normalizeValues(generatedTask, config));
  }
  return tasks;
}

function repairStrategy(task: Task, config: GAConfiguration): RepairStrategy {
  const reduceC = task.C > 1
  const reduceT = task.T < config.periodRange[1]
  if (reduceC && reduceT) {
    return Math.random() < 0.5 ? "reduceC" : "increaseT";
  } else if (reduceC && !reduceT) {
    return "reduceC";
  } else if (!reduceC && reduceT) {
    return "increaseT";
  }
  return "skip";
}

function applyRepairStrategy(task: Task, strategy: RepairStrategy, config: GAConfiguration): Task {
  if (strategy === "reduceC") {
    const newC = Math.max(1, task.C - 1);
    return { ...task, C: newC };
  } else if (strategy === "increaseT") {
    const newT = Math.min(config.periodRange[1], task.T + 1);
    return { ...task, T: newT };
  }
  return task;

}

function repairTaskset(taskset: Task[], config: GAConfiguration, maxUtilization = 1): Task[] {
  const repaired = taskset.map((task) => ({ ...task }));
  const cap = Math.max(0.1, maxUtilization);
  let t = 8000;

  while (calculateUtilization(repaired) > cap && t-- > 0) {
    const candidates = repaired
      .map((task, index) => ({ index, ratio: task.C / Math.max(1, task.T) }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 2);

    if (candidates.length === 0) break;

    let tryFix = false;
    for (const cand of candidates) {
      const idx = cand.index;
      const strategy = repairStrategy(repaired[idx], config);

      if (strategy === "reduceC" && repaired[idx].C > 1) {
        repaired[idx].C = Math.max(1, repaired[idx].C - 1);
        if (repaired[idx].D < repaired[idx].C) {
          repaired[idx].D = repaired[idx].C;
        }
        tryFix = true;
        break;
      } else if (strategy === "increaseT" && repaired[idx].T < config.periodRange[1]) {
        repaired[idx].T += 1;
        if (repaired[idx].D > repaired[idx].T) repaired[idx].D = repaired[idx].T;
        tryFix = true;
        break;
      }
    }

    if (!tryFix) break;
  }

  return repaired;
}

function getParameters(taskset: Task[], algorithm: "RM" | "DM" | "EDF", length: number): fittingParameters {
  let result: ScheduleResult;
  if (algorithm === "RM") result = simulateRM(taskset, length);
  else if (algorithm === "DM") result = simulateDM(taskset, length);
  else result = simulateEDF(taskset, length);

  return {
    N: result.jobInstancesPerTask.size,
    U: calculateUtilization(taskset),
    P: result.avgPreemptions,
    L: result.avgLaxity,
    giniC: result.giniC,
    giniT: result.giniT,
  };
}

function linearFitness(params: fittingParameters, coeffs?: coefficients["linear"]): number {
  const bias = coeffs?.bias ?? coeffs?.a ?? 0;
  const nCoef = coeffs?.n ?? coeffs?.b ?? 0.29683428;
  const uCoef = coeffs?.u ?? coeffs?.c ?? 4.00362478;
  const pCoef = coeffs?.p ?? coeffs?.d ?? 1.54322871;
  const lCoef = coeffs?.l ?? coeffs?.e ?? 0.10781809;

  const N = params.N ?? 0;
  const P = params.P ?? 0;
  const giniC = params.giniC ?? 0;
  const giniT = params.giniT ?? 0;

  return bias + nCoef * N + uCoef * giniC + pCoef * P + lCoef * giniT;
}

function evaluateFitness(taskset: Task[], config: GAConfiguration): number {
  const length = 1000;
  const hyperperiod = lcmArray(taskset.map(t => t.T));
  const maxLength = Math.min(hyperperiod, length);
  const params = getParameters(taskset, config.usedAlgorithm, maxLength);
  return linearFitness(params, config.fitnessCoefficients as coefficients["linear"]);
}

function tournamentSelection(population: Individual[], databaseTasksetsCount: number): Individual[] {
  const sorted = [...population]
    .filter((individual) => Number.isFinite(individual.fitness))
    .sort((a, b) => b.fitness - a.fitness);
  const count = Math.max(1, Math.min(databaseTasksetsCount, sorted.length));

  const bestGroup = sorted.slice(0, count);
  const nextBestGroup = sorted.slice(count, count * 2);

  return [...bestGroup, ...nextBestGroup];
}

function singlePointCrossover(parent1: Individual, parent2: Individual): Individual {
  const length = Math.min(parent1.taskset.length, parent2.taskset.length);
  const point = Math.max(1, Math.floor(Math.random() * length));
  return {
    taskset: parent1.taskset.slice(0, point).concat(parent2.taskset.slice(point)),
    fitness: 0,
  };
}


function mutate(individual: Individual, config: GAConfiguration): void {
  for (let i = 0; i < individual.taskset.length; i++) {
    if (Math.random() >= config.mutationRate) continue;
    const t = individual.taskset[i];
    individual.taskset[i] = normalizeValues(
      {
        ...t,
        C: Math.round(t.C * (0.8 + Math.random() * 0.4)),
        T: Math.round(t.T * (0.8 + Math.random() * 0.4)),
        D: Math.round(t.D * (0.8 + Math.random() * 0.4)),
        O: Math.max(0, Math.round((t.O ?? 0) * (0.8 + Math.random() * 0.4))),
      },
      config
    );
  }
}

function initPopulation(config: GAConfiguration): Individual[] {
  const initialPopulation: Individual[] = [];

  const databaseTasksets = getDatabaseTasksets(config);
  for (const entry of databaseTasksets) {
    const taskset = convertDatabaseEntryToTaskset(entry);
    initialPopulation.push({ taskset, fitness: 0 });
  }

  for (let i = initialPopulation.length; i < config.populationSize; i++) {
    const taskset = generateRandomTaskset(config);
    const repairedTaskset = repairTaskset(taskset, config);
    initialPopulation.push({ taskset: repairedTaskset, fitness: 0 });
  }

  for (const individual of initialPopulation) {
    individual.fitness = evaluateFitness(individual.taskset, config);
  }
  return initialPopulation;
}

export function GA_TasksetGeneration(config: GAConfiguration): Task[] {
  const safeConfig: GAConfiguration = {
    ...config,
    populationSize: Math.max(2, Math.floor(config.populationSize)),
    generations: Math.max(1, Math.floor(config.generations)),
    numberOfTasks: Math.max(1, Math.floor(config.numberOfTasks)),
    mutationRate: Math.min(1, Math.max(0, config.mutationRate)),
    crossoverRate: Math.min(1, Math.max(0, config.crossoverRate)),
  };

  let population = initPopulation(safeConfig);
  if (!population.length) {
    return repairTaskset(generateRandomTaskset(safeConfig), safeConfig);
  }

  const databaseTasksetsCount = Math.max(1, getDatabaseTasksets(safeConfig).length);
  let bestIndividual: Individual | null = null;

  for (let gen = 0; gen < safeConfig.generations; gen++) {

    population.sort((a, b) => b.fitness - a.fitness);
    if (population.length && Number.isFinite(population[0].fitness) && (!bestIndividual || population[0].fitness > bestIndividual.fitness)) {
      bestIndividual = { ...population[0], taskset: population[0].taskset.map(t => ({ ...t })) };
    }

    const selected = tournamentSelection(population, databaseTasksetsCount);
    if (!selected.length) {
      break;
    }

    const offspring: Individual[] = [];
    let offspringAttempts = 0;
    const maxOffspringAttempts = Math.max(safeConfig.populationSize * 10, 20);

    while (offspring.length < safeConfig.populationSize && offspringAttempts++ < maxOffspringAttempts) {
      const parent1 = selected[Math.floor(Math.random() * selected.length)];
      const parent2 = selected[Math.floor(Math.random() * selected.length)];
      if (!parent1 || !parent2) {
        continue;
      }

      const child = singlePointCrossover(parent1, parent2);
      mutate(child, safeConfig);
      child.taskset = repairTaskset(child.taskset, safeConfig);
      offspring.push(child);
    }

    while (offspring.length < safeConfig.populationSize) {
      const fallbackChildTaskset = repairTaskset(generateRandomTaskset(safeConfig), safeConfig);
      offspring.push({ taskset: fallbackChildTaskset, fitness: evaluateFitness(fallbackChildTaskset, safeConfig) });
    }

    for (const child of offspring) {
      child.fitness = evaluateFitness(child.taskset, safeConfig);
    }
    population = [...population, ...offspring].sort((a, b) => b.fitness - a.fitness).slice(0, safeConfig.populationSize);
    population = population.slice(0, safeConfig.populationSize);

  }

  if (bestIndividual?.taskset?.length) {
    return bestIndividual.taskset;
  }

  const bestFinite = population.find((individual) => Number.isFinite(individual.fitness));
  if (bestFinite?.taskset?.length) {
    return bestFinite.taskset;
  }

  return repairTaskset(generateRandomTaskset(safeConfig), safeConfig);
}
