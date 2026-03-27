/* Utility functions for math etc. */
import type { Task } from "../core/task";
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function lcmArray(arr: number[]): number {
  return arr.reduce((acc, val) => lcm(acc, val), 1);
}

export function liuLaylandBound(tasks: Task[]): boolean {

  let tasksetUtil = 0;
  let uLUB = 0;
  let n = tasks.length
  for(let i = 0; i < n; i++) {
    tasksetUtil += tasks[i].C/tasks[i].T;
  }

  uLUB = n*(2^(1/n)-1);

  return tasksetUtil<=uLUB;
}

export function harmonicBound(tasks: Task[]): boolean {
  let tasksetUtil = 0;

  if(isHarmonicTaskSet(tasks)) {
    for(let i = 0; i < tasks.length; i++) {
      tasksetUtil += tasks[i].C/tasks[i].T;
    }
  }

  else{
    return false;
  }

  return tasksetUtil <= 1;
}


export function isHarmonicTaskSet(tasks: Task[]) {
  const n = tasks.length;
  if (n <= 1) return true;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const Ti = tasks[i].T;
      const Tj = tasks[j].T;

      if (Ti < Tj && Tj % Ti !== 0) {
        return false;
      }
    }
  }

  return true;
}

export function computeTaskInterference(index: number, tasks: Task[]) {
  const task = tasks[index];
  let interference = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (i !== index) {
      interference += Math.floor(task.T / tasks[i].T) * tasks[i].C;
    }
  }
  return interference;
}


export function tda(tasks: Task[]): boolean {
  for (let i = 0; i < tasks.length; i++) {
    const interference = computeTaskInterference(i, tasks);
    if (tasks[i].C + interference > tasks[i].T) {
      return false;
    }
  }
  return true;
}

// Helper function to render inline math using KaTeX and bold text
export function renderWithMath(text: string): React.ReactNode[] {
  // First split by math delimiters
  const mathParts = text.split(/(\$[^$]+\$)/g);
  
  return mathParts.flatMap((part, idx) => {
    const isMath = part.startsWith('$') && part.endsWith('$');
    if (isMath) {
      const math = part.slice(1, -1);
      return <InlineMath key={`m-${idx}`} math={math} />;
    }
    
    // For non-math parts, also handle bold text with **...**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((boldPart, boldIdx) => {
      const isBold = boldPart.startsWith('**') && boldPart.endsWith('**');
      if (isBold) {
        const boldText = boldPart.slice(2, -2);
        return <strong key={`${idx}-b-${boldIdx}`}>{boldText}</strong>;
      }
      return <span key={`${idx}-t-${boldIdx}`}>{boldPart}</span>;
    });
  });
}


export function giniCoefficient(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);

  const n = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);

  if (sum === 0) return 0;

  let cumulative = 0;

  for (let i = 0; i < n; i++) {
    cumulative += (i + 1) * sorted[i];
  }

  return (2 * cumulative) / (n * sum) - (n + 1) / n;
}