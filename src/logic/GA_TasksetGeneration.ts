// @ts-nocheck
import type { Task } from "../core/task";
import { simulateEDF, simulateRM, simulateDM } from "./simulator";
import type { ScheduleResult } from "./simulator";

export interface fittingParameters {
  N?: number;
  P?: number;
  L?: number;
  giniT?: number;
  giniC?: number;
}

export interface GAConfiguration {
  populationSize: number;
  generations: number;
  selectionAmount: number;
  mutationRate: number;
  targetDifficulty?: number;
  usedAlgorithm: "RM" | "DM" | "EDF";
  numberOfTasks: number;
  periodRange: [number, number];
  difficultyTolerance?: number;
  maxOffset?: number;
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

function randomInt(min: number, max: number): number {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

function boundedRandomOffset(
  current: number,
  min: number,
  max: number
): number {
  if (!Number.isFinite(current) || !Number.isFinite(min) || !Number.isFinite(max)) return current;
  const lower = min - current;
  const upper = max - current;

  if (lower > upper) {
    return current;
  }

  return current + randomInt(lower, upper);
}

function getDifficultyMode(config: GAConfiguration): "easy" | "medium" | "hard" {
  const target = config.targetDifficulty ?? 3;
  if (target <= 2) return "easy";
  if (target <= 4) return "medium";
  return "hard";
}


function enforceTaskDifficultyConstraints(task: Task, config: GAConfiguration, applyMediumConstraints = false, forceConstrainedDeadline = false): Task {
  const mode = getDifficultyMode(config);
  const constrained: Task = { ...task };

  if (mode === "easy") {
    constrained.D = constrained.T;
    constrained.O = 0;
    return constrained;
  }

  if (mode === "medium") {
    // Medium: NO offsets, but allow constrained deadlines when applying medium constraints.
    constrained.O = 0;
    constrained.D = randomInt(constrained.C, constrained.T);
    return constrained;
  }

  constrained.D = randomInt(constrained.C, constrained.T);
  return constrained;
}

function enforceTasksetDifficultyConstraints(taskset: Task[], config: GAConfiguration, applyMediumConstraints = false): Task[] {
  return taskset.map((task) => enforceTaskDifficultyConstraints(task, config, applyMediumConstraints));
}

function generateRandomTaskset(config: GAConfiguration): Task[] {
  const tasks: Task[] = [];
  const minPeriod = config.periodRange[0];
  const maxPeriod = config.periodRange[1];
  const offsetLimit = Math.max(0, config.maxOffset ?? Number.POSITIVE_INFINITY);
  
  for (let i = 0; i < config.numberOfTasks; i++) {
    const T = randomInt(minPeriod, maxPeriod);
    const C = randomInt(1, T);
    const D = randomInt(C, T);
    const O = randomInt(0, Math.max(0, Math.min(T - 1, offsetLimit)));
    tasks.push({ id: `task-${i}`, name: `Task ${i}`, C, T, D, O, color: getTaskColor(i) });
  }
  return enforceTasksetDifficultyConstraints(tasks, config, true);
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
  // let t = 8000;

  while (calculateUtilization(repaired) > cap) {
    const candidates = repaired
      .map((_, index) => ({ index, rand: Math.random() }))
      .sort((a, b) => a.rand - b.rand);

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
        repaired[idx].D += 1;
        if (repaired[idx].D > repaired[idx].T) repaired[idx].D = repaired[idx].T;
        tryFix = true;
        break;
      }
    }

    if (!tryFix) break;
  }

  return enforceTasksetDifficultyConstraints(repaired, config, false);
}

function getParameters(taskset: Task[], algorithm: "RM" | "DM" | "EDF", length: number): fittingParameters {
  let result: ScheduleResult;
  if (algorithm === "RM") result = simulateRM(taskset, length);
  else if (algorithm === "DM") result = simulateDM(taskset, length);
  else result = simulateEDF(taskset, length);

  return {
    N: result.jobInstancesPerTask.size,
    P: result.avgPreemptions,
    L: result.avgLaxity,
    giniC: result.giniC,
    giniT: result.giniT,
  };
}

function fittedFitness(params: fittingParameters): number {
  const N = Math.max(1, params.N ?? 1);
  const P = params.P ?? 0;
  const giniC = params.giniC ?? 0;

  return giniC * (9.996 - (19.724 / N)) + Math.exp(P);
}

function evaluatePredictedDifficulty(taskset: Task[], config: GAConfiguration): number {
  const length = 150;
  //const hyperperiod = lcmArray(taskset.map(t => t.T));
  //const maxLength = Math.min(hyperperiod, length);
  const params = getParameters(taskset, config.usedAlgorithm, length);
  return fittedFitness(params);
}

function evaluateFitness(taskset: Task[], config: GAConfiguration): number {
  const predictedDifficulty = evaluatePredictedDifficulty(taskset, config);
  if (config.targetDifficulty === undefined || config.targetDifficulty === null) {
    return predictedDifficulty;
  }

  const tolerance = config.difficultyTolerance ?? 0.15;
  const distance = Math.abs(predictedDifficulty - config.targetDifficulty);
  const insideToleranceBonus = distance <= tolerance ? 1 : 0;

  // Maximize closeness to target; values outside tolerance get a strong penalty.
  return insideToleranceBonus - distance;
}

function parentPoolSelection(population: Individual[], databaseTasksetsCount: number, config: GAConfiguration): Individual[] {
  const sorted = [...population]
    .filter((individual) => Number.isFinite(individual.fitness))
    .sort((a, b) => b.fitness - a.fitness);
  const count = Math.max(1, Math.min(databaseTasksetsCount, sorted.length));

  const bestGroup = sorted.slice(0, count*2);

  return bestGroup;
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
  if (Math.random() >= config.mutationRate);
  else{
    for (let i = 0; i < individual.taskset.length; i++) {
      const t = individual.taskset[i];
      const implicitDeadline = t.D === t.T;
      const periodMin = config.periodRange[0];
      const periodMax = config.periodRange[1];
      const targetDif = config.targetDifficulty;
    
      const mutatedT = boundedRandomOffset(t.T, periodMin, periodMax);
      const mutatedC = boundedRandomOffset(t.C, 1, mutatedT);
      let mutatedD: number;
      let mutatedO: number;
      if (implicitDeadline) {
        mutatedD = mutatedT;
      } else {
        mutatedD = boundedRandomOffset(t.D, mutatedC, mutatedT-1);
      }
      if(targetDif < 4) {
        mutatedO = t.O;
      }
      else {
        const offsetLimit = Math.max(0, config.maxOffset ?? Number.POSITIVE_INFINITY);
          mutatedO = boundedRandomOffset(
          t.O ?? 0,
          0,
          Math.min(mutatedT - 1, offsetLimit)
        );
      }
      individual.taskset[i] = {
        ...t,
        C: mutatedC,
        T: mutatedT,
        D: mutatedD,
        O: mutatedO,
      };

      individual.taskset[i] = enforceTaskDifficultyConstraints(individual.taskset[i], config, false);
    }
  }
}

function initPopulation(config: GAConfiguration): Individual[] {
  const initialPopulation: Individual[] = [];

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
    numberOfTasks: Math.max(2, Math.floor(config.numberOfTasks)),
    mutationRate: Math.min(1, Math.max(0, config.mutationRate)),
  };

  let population = initPopulation(safeConfig);
  if (!population.length) {
    // return repairTaskset(generateRandomTaskset(safeConfig), safeConfig);
    return generateRandomTaskset(safeConfig);
  }

  // const databaseTasksetsCount = Math.max(1, getDatabaseTasksets(safeConfig).length);
  const databaseTasksetsCount = Math.max(1, Math.floor(safeConfig.selectionAmount));
  let bestIndividual: Individual | null = null;

  for (let gen = 0; gen < safeConfig.generations; gen++) {
    population.sort((a, b) => b.fitness - a.fitness);
    if (population.length && Number.isFinite(population[0].fitness) && (!bestIndividual || population[0].fitness > bestIndividual.fitness)) {
      bestIndividual = { ...population[0], taskset: population[0].taskset.map(t => ({ ...t })) };
    }

    // This is unused for now, but could be added back to use elitism or to ensure parents have good fitness to target difficulty. But for now random just works fine.
    const selected = parentPoolSelection(population, databaseTasksetsCount, safeConfig);
    if (!selected.length) {
      break;
    }

    const offspring: Individual[] = [];
    let offspringAttempts = 0;
    const maxOffspringAttempts = Math.max(safeConfig.populationSize * 10, 20);

    while (offspring.length < safeConfig.populationSize && offspringAttempts++ < maxOffspringAttempts) {
      //const parent1 = selected[Math.floor(Math.random() * selected.length)];
      const parent1 = population[Math.floor(Math.random() * population.length)];
      //let parent2 = selected[Math.floor(Math.random() * selected.length)];
      let parent2 = population[Math.floor(Math.random() * population.length)];
      if (selected.length > 1) {
        while (parent2 === parent1) {
          //parent2 = selected[Math.floor(Math.random() * selected.length)];
          parent2 = population[Math.floor(Math.random() * population.length)];
        }
      }

      if (!parent1 || !parent2) {
        continue;
      }

      const child = singlePointCrossover(parent1, parent2);
      mutate(child, safeConfig);
      // child.taskset = repairTaskset(child.taskset, safeConfig);
      offspring.push(child);
    }

    while (offspring.length < safeConfig.populationSize) {
      // const fallbackChildTaskset = repairTaskset(generateRandomTaskset(safeConfig), safeConfig);
      const fallbackChildTaskset = generateRandomTaskset(safeConfig);
      offspring.push({ taskset: fallbackChildTaskset, fitness: 0 });
    }

    for (const child of offspring) {
      child.taskset = repairTaskset(child.taskset, safeConfig);
    }

    for (const child of offspring) {
      child.fitness = evaluateFitness(child.taskset, safeConfig);
    }
    population = [...population, ...offspring].sort((a, b) => b.fitness - a.fitness).slice(0, safeConfig.populationSize);
    population = population.slice(0, safeConfig.populationSize);

  }

  if (bestIndividual?.taskset?.length) {
    //console.log("target difficulty:", safeConfig.targetDifficulty);
    //console.log("calculated difficulty:", evaluatePredictedDifficulty(bestIndividual.taskset, safeConfig));
    return bestIndividual.taskset;
  }

  const bestFinite = population.find((individual) => Number.isFinite(individual.fitness));
  if (bestFinite?.taskset?.length) {
    //console.log("calculated difficulty:", evaluatePredictedDifficulty(bestFinite.taskset, safeConfig));
    return bestFinite.taskset;
  }

  // return repairTaskset(generateRandomTaskset(safeConfig), safeConfig);
  return generateRandomTaskset(safeConfig);
}
