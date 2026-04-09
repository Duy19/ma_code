// @ts-nocheck
import { Task } from "@mui/icons-material";
import type { Task } from "../core/task";
import "../utils/formulas";
import { lcm, tda } from "../utils/formulas";
import type { ScheduleEntry, ScheduleResult } from "./simulator";
import { simulateEDF, simulateRM, simulateDM } from "./simulator";
import type { number } from "motion";


// Taskset generation configuration for Puzzle Type A (Given: Schedule, Solution: Correct Taskset Parameters)
export interface TasksetConfigTypeA {
  numTasks: number;
  numJobs?: number; 
  minExecutionTime: number;
  maxExecutionTime: number;
  minPeriod: number;
  maxPeriod: number;
  minDeadlineOffset: number;
  maxDeadlineOffset: number;
  minOffset: number;
  maxOffset: number;
  minUtilization: number;
  maxUtilization: number;
  hyperperiod: number;
  interval: [number, number];
  algorithm: "RM" | "DM" | "EDF";
  deadlinetype: "implicit" | "constrained" | "arbitrary";
  difficulty: "easy" | "medium" | "hard";
}

const algorithms = ["RM", "DM", "EDF"] as const;
// Utilization intervals for different difficulty levels (Easy: 0.2-0.4, Medium: 0.4-0.7, Hard: 0.7-1)
const utilizationIntervals = [[0.2, 0.4], [0.4, 0.7], [0.7, 0.95]];

function thresholdExec(tasks: Task[], threshold = 0.25) {
  const tasksetExecValue = tasks.filter(t => t.C > 1).length;
  const shortPeriodTasks = tasks.filter(t => t.T <= 5).length;
  return tasksetExecValue >= Math.ceil(tasks.length * threshold) && shortPeriodTasks >= 1 && shortPeriodTasks < 3;
}


function findInterval(tasks: Task[]) : number[]{
  let longestPeriod = Math.max(...tasks.map(t => t.T));
  let start = longestPeriod-2;
  let end = 2*longestPeriod+2;
  return [start, end];
}

function countPreemptions(tasks: Task[], algo: string, end: number): number {
  let schedule: ScheduleEntry[] = [];
  let longTask = tasks.reduce((prev, current) => (prev.C > current.C) ? prev : current).id;
  if (algo === "EDF") {
    schedule = simulateEDF(tasks, end).schedule;
  }
  else if (algo === "RM") {
    schedule = simulateRM(tasks, end).schedule;
  }
  else if (algo === "DM") {
    schedule = simulateDM(tasks, end).schedule;
  }

  let preemptions = 0;
  for (let i = 1; i < schedule.length; i++) {
    if (schedule[i-1].taskId === longTask && schedule[i].taskId !== longTask && schedule[i-1].remainingExecution !== undefined && schedule[i-1].remainingExecution > 0) {
      preemptions++;
    }
  }
  return preemptions;
}
// OTHER APPROACH: GENERATE T and C independently, then calculate U and iteratively adjust C to meet U_total.
// Verteilung der restlichen execution/util nach bias: w_i = T^alpha _ i, alpha = 1.2-1.5
function generateTaskPeriods(n: number, Pmin: number, Pmax: number) : number[] {
  const longPeriodIndex = Math.floor(Math.random() * n);
  let periods: number[] = [];
  let shortPeriodRatio = 0.25;
  let numshort = Math.floor(n * shortPeriodRatio);
  const shortIndices = new Set<number>();
  while(shortIndices.size < numshort){
    const idx = Math.floor(Math.random() * n);
    if(idx !== longPeriodIndex) shortIndices.add(idx);
  }
  let range = Pmax - Pmin;
  for (let i = 0; i < n; i++) {
    if (i === longPeriodIndex) {
      periods.push(Math.round(Math.random() * (Pmax - (Pmax-5)) + (Pmax-5)));
    }
    else if (shortIndices.has(i)) {
      periods.push(Math.round(Math.random() * (Pmin + 1 - 2) + 2));
    }
    else {
      periods.push(Math.round(Math.random() * (Pmax - Pmin)/2 + (Pmin + (Pmax-Pmin)/4)));
    }
  }
  return periods;
}


function generateTaskExecution(n: number, utarget: number, periods: number[])  {
  let exec = new Array(n).fill(1)
  const longExecutionIndex = Math.floor(Math.random() * n);
  let Uarray = new Array(n);
  const alpha = 4;
  function pickTaskBiased(): number {
    const weights = periods.map(T => Math.pow(T, alpha));
    const sum = weights.reduce((a,b)=>a+b,0);
    let r = Math.random() * sum;
    for (let i=0;i<n;i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return n-1;
  }

  let currentUsum = exec.reduce((sum, C, i) => sum + C/periods[i], 0);
  while (currentUsum < utarget) {
    const index = pickTaskBiased();
    const deltaU = 1/periods[index];
    if (currentUsum + deltaU > utarget) {
      break;
    }
    exec[index]++;
    currentUsum += deltaU;
  }

  return exec;
}


export function taskGeneration_reverse(n: number, utarget: number, algo: string, Pmax: number, Pmin: number): Task[] {
  let attempts = 1000;
  let periods: number[] = [];
  let exec: number[] = []
  let preemptionCount = 0;
  while (true && attempts-- > 0) {
    console.log(`Attempt ${1000 - attempts} to generate taskset with threshold...`);
    let taskset: Task[] = [];
    periods = generateTaskPeriods(n, Pmin, Pmax);
    exec = generateTaskExecution(n, utarget, periods);
    const tasksetExecValue = exec.filter(c => c > 1).length;
    if (tasksetExecValue < Math.ceil(exec.length * 0.4)) {
      for (let i = 0; i < n; i++) {
        let task: Task = {
          id: `T${i}`,
          name: `Task ${i}`,
          C: exec[i],
          T: periods[i],
          D: periods[i],
          color: `hsl(${Math.random() * 360}, ${Math.random() * 50 + 50}%, 70%)`,
        }
      taskset.push(task);
      }

      let testTaskset = [...taskset];
      if (algo === "RM") {
        testTaskset.sort((a, b) => a.T - b.T);
      }
      else if (algo === "DM") {
        testTaskset.sort((a, b) => a.D - b.D);
      }
      else{
        return taskset;
      }
      if (tda(testTaskset)) {
        console.log('Schedulable by tda');
        preemptionCount = countPreemptions(testTaskset, algo, findInterval(testTaskset)[1]);
        console.log(`Preemptions in generated taskset: ${preemptionCount}`);
        return taskset;

      }
    }
  }
  return [];
}


export function taskGeneration_reverse_TypeB(n: number, utarget: number, algo: string, Pmax: number, Pmin: number): Task[] {
  let attempts = 1000;
  let periods: number[] = [];
  let exec: number[] = [];
  while (true && attempts-- > 0) {
    console.log(`Attempt ${1000 - attempts} to generate taskset with threshold...`);
    let taskset: Task[] = [];
    periods = generateTaskPeriods(n, Pmin, Pmax);
    exec = generateTaskExecution(n, utarget, periods);
    const tasksetExecValue = exec.filter(c => c > 1).length;
    if (tasksetExecValue < Math.ceil(exec.length * 0.4)) {
      for (let i = 0; i < n; i++) {
      let task: Task = {
        id: `T${i}`,
        name: `Task ${i}`,
        C: exec[i],
        T: periods[i],
        D: periods[i],
        color: `hsl(${Math.random() * 360}, ${Math.random() * 50 + 50}%, 70%)`,
      }
      taskset.push(task);
    }
    let testTaskset = [...taskset];
    if (algo === "RM") {
      testTaskset.sort((a, b) => a.T - b.T);
    }
    else if (algo === "DM") {
      testTaskset.sort((a, b) => a.D - b.D);
    }
    else{
      return taskset;
    }
    // Not necessary for this puzzle type
    if (tda(testTaskset)) {
      console.log('Schedulable by tda');
      return taskset;
    }
  }
    }

  return [];
}

let Uset: number[] = [];
let Pset: Task[] = [];


function UUniFast(n: number, U_avg: number) {
  let sumU = U_avg;
  for (let i = 0; i < n - 1; i++) {
    const nextSumU = sumU*Math.pow(Math.random(), 1/(n-i));
    Uset.push(sumU - nextSumU);
    sumU = nextSumU;
  }
  Uset.push(sumU);

}

function UUniFast_minU(n: number, U_avg: number, U_min: number) {
  let sumU = U_avg - n*U_min;
  for (let i = 0; i < n - 1; i++) {
    const nextSumU = sumU*Math.pow(Math.random(), 1/(n-i));
    Uset.push(sumU - nextSumU + U_min);
    sumU = nextSumU;
  }
  Uset.push(sumU + U_min);

}

function UUniFast_Discard(n: number, U_avg: number) {
  while (true) {
    let sumU = U_avg;
    for (let i = 0; i < n - 1; i++) {
      let nextSumU = sumU * Math.pow(Math.random(), 1/(n-i));
      Uset.push(sumU-nextSumU);
      sumU=nextSumU;
    }
    Uset.push(sumU);
    if (Math.max(...Uset) < 1) {
      break;
    }
    Uset.length = 0;
  }
}

function UUnifast_Guided(n: number, U_total: number, U_max: number) {
  const dominantTaskUtilization = 0.3 + Math.random() * 0.15;
  const U_first = dominantTaskUtilization*U_total;
  Uset.push(U_first);
  let Usum = U_total - U_first;
  for (let i = 1; i < n - 2; i++) {
    let nextSumU = Usum * Math.pow(Math.random(), 1/(n-1-i));
    Uset.push(Usum-nextSumU);
    Usum=nextSumU;
  }
  Uset.push(Usum);
}


function CSet_generate(Pmin: number, Pmax: number, numlog: number) {
  let j = 0;
  for (let i = 0; i < Uset.length; i++) {
    //let p = Math.random() * (Pmax - Pmin) + Pmin;
    let thN = i%numlog;
    let p = Math.random() * (Pmin * Math.pow(10, thN + 1) - Pmin * Math.pow(10, thN)) + Pmin * Math.pow(10, thN);
    let task: Task = {
      id: `T${i}`,
      name: `Task ${i}`,
      C: Math.max(1, Math.round(Uset[i] * p)),
      T: Math.round(p),
      D: Math.round(p),
      //O: Math.round(Math.random() * 3), 
      color: `hsl(${Math.random() * 360}, ${Math.random() * 50 + 50}%, 70%)`,
    }
    Pset.push(task);
    j++;
  }
}

function CSet_generate_2(n: number, u_mi: number, u_ma: number, Pmin: number, Pmax: number) {
  let attempts = 30;
  let tries = 0;
  let lastSet: Task[] = [];
  let u_total = Math.random() * (u_ma - u_mi) + u_mi;
  console.log('Generating taskset with total utilization:', u_total.toFixed(2));
  while (tries < attempts) {

    Uset.length = 0;
    Pset.length = 0;
    UUniFast_minU(n, u_total, 0.1);
    Uset.sort((a, b) => b - a);
    for (let i = 0; i < Uset.length; i++) {
      let p;
      if (i === 0) {
        p = Math.random() * ((Pmax*2) - Pmax) + Pmax;
      }
      else {
        p = Math.exp(Math.random() * (Math.log(Pmax) - Math.log(Pmin)) + Math.log(Pmin));
      }
      const randomFactor = 0.9 + Math.random() * 0.15;
      let C = Math.max(1, Math.round(Uset[i] * Math.round(p) * randomFactor));
      if (i === 0) {
        C = Math.max(C, Math.round(Uset[i] * Math.round(p) * 1.3));
      }
      let task: Task = {
        id: `T${i}`,
        name: `Task ${i}`,
        C: C,
        T: Math.round(p),
        D: Math.round(p),
        //O: Math.round(Math.random() * 3), 
        color: `hsl(${Math.random() * 360}, ${Math.random() * 50 + 50}%, 70%)`,
      } 
      Pset.push(task);
    }
    lastSet = [...Pset];
    if (thresholdExec(Pset)) {
      break;
    }
    tries++;
  }
  
  //console.warn("Failed to generate taskset with threshold after maximum attempts. Returning last attempted set.");
  Pset.length = 0;
  Pset.push(...lastSet);
  let Usum = 0;
  for (let i = 0; i < Pset.length; i++) {
    Usum += Pset[i].C / Pset[i].T;
    console.log(`Task ${Pset[i].id}: C=${Pset[i].C}, T=${Pset[i].T}, U=${(Pset[i].C / Pset[i].T).toFixed(2)}`);
  }
  console.log(`Generated taskset with total utilization: ${Usum.toFixed(2)} after ${tries} tries.`);
}

export function taskGeneration_p(){
  // Reset global arrays for each call
  Uset = [];
  Pset = [];
  let TasksetConfig: TasksetConfigTypeA = {} as TasksetConfigTypeA;
  // First choose Alogrithm first (RM, DM, EDF, etc.)
  let chosenAlgorithm = algorithms[Math.floor(Math.random()*algorithms.length)];
  console.log(`Chosen Algorithm: ${chosenAlgorithm}`);
  TasksetConfig.algorithm = chosenAlgorithm;
  TasksetConfig.hyperperiod = 100;
  TasksetConfig.difficulty = ["easy", "medium", "hard"][Math.floor(Math.random()*2)] as TasksetConfigTypeA["difficulty"];
  //TasksetConfig.difficulty = "hard";
  if (TasksetConfig.difficulty === "easy") {
    TasksetConfig.minUtilization = utilizationIntervals[0][0];
    TasksetConfig.maxUtilization = utilizationIntervals[0][1];
    TasksetConfig.numTasks = Math.floor(Math.random() * (3 - 2) + 2);
    TasksetConfig.minPeriod = 10;
    TasksetConfig.maxPeriod = 15; 
  } else if (TasksetConfig.difficulty === "medium") {
    TasksetConfig.minUtilization = utilizationIntervals[1][0];
    TasksetConfig.maxUtilization = utilizationIntervals[1][1];
    TasksetConfig.numTasks = Math.floor(Math.random() * (5 - 3) + 3);
    TasksetConfig.minPeriod = 5;
    TasksetConfig.maxPeriod = 15;
  } else if (TasksetConfig.difficulty === "hard") {
    TasksetConfig.numTasks = Math.floor(Math.random() * (7 - 4) + 4); 
    TasksetConfig.minPeriod = 3;
    TasksetConfig.maxPeriod = 25;
    if (TasksetConfig.algorithm === "RM") {
      TasksetConfig.minUtilization = 0.67;
      TasksetConfig.maxUtilization = 0.728; // Liu & Layland bound for RM
    }
    else {
      TasksetConfig.minUtilization = utilizationIntervals[2][0];
      TasksetConfig.maxUtilization = utilizationIntervals[2][1];
    }
  }

  if (TasksetConfig.difficulty === "hard") {
    //CSet_generate_2(TasksetConfig.numTasks, TasksetConfig.minUtilization, TasksetConfig.maxUtilization, TasksetConfig.minPeriod, TasksetConfig.maxPeriod);
    Pset = taskGeneration_reverse(TasksetConfig.numTasks, 1, TasksetConfig.algorithm, TasksetConfig.maxPeriod, TasksetConfig.minPeriod);
  }
  else {
    UUniFast(TasksetConfig.numTasks, TasksetConfig.maxUtilization);
    CSet_generate(TasksetConfig.minPeriod, TasksetConfig.maxPeriod, 0.9);
  }
  // UUniFast(TasksetConfig.numTasks, TasksetConfig.maxUtilization);
  // CSet_generate(TasksetConfig.minPeriod, TasksetConfig.maxPeriod, 0.9);
  TasksetConfig.hyperperiod = 2* Pset.reduce((max, task) => Math.max(max, task.T), 1);
  TasksetConfig.interval = [0, TasksetConfig.hyperperiod];
  //TasksetConfig.interval = findInterval(Pset);
  return [TasksetConfig, Pset];
}

//const generatedTaskset = taskGeneration_p();
//console.log(generatedTaskset[0]);
//console.log(generatedTaskset[1]);



// Different approaches to taskset generation can be implemented here
// Should there be different functions for different Puzzles or a single function with parameters to control the generation process?
// Using UUniFast algorithm for by Bini and Buttazzo (2005) for generating task utilizations, and then assigning periods and computation times accordingly.
// Based on Python Implementation of UUniFast from here: https://github.com/tu-dortmund-ls12-rt/SSSEvaluation/blob/master/schedTest/tgPath.py
