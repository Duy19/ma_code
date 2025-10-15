import React from "react";
import type { Task, Job } from "../core/task";

type FreeSchedulerProps = {
  tasks: Task[];
  hyperperiod: number;
  scale?: number;
};

export default function FreeScheduler({ tasks, hyperperiod, scale = 20 }: FreeSchedulerProps) {
  return (
    <svg width="100%" height={tasks.length * 100}>
      <defs>
        <marker id="arrow-up" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,6 L3,0 L6,6" fill="blue" />
        </marker>
        <marker id="arrow-down" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L3,6 L6,0" fill="blue" />
        </marker>
      </defs>

      {tasks.map((task, i) => (
        <g key={task.id} transform={`translate(0, ${i * 100})`}>
          {/* Task-Label */}
          <text x="0" y="20" fontSize="14" fontWeight="bold">{task.name}</text>

          {/* Zeitachse */}
          <line x1="30" y1="20" x2={30 + hyperperiod * scale} y2="20" stroke="black" />

          {/* Zeitschritte (Slots) */}
          {Array.from({ length: hyperperiod }).map((_, t) => {
            const jobAtT = task.jobs?.find(j => j.start !== undefined && t >= j.start && t < (j.start + j.C));
            return (
              <rect
                key={t}
                x={30 + t * scale}
                y={40}
                width={scale}
                height={30}
                fill={jobAtT ? task.color : "#eee"}
                opacity={jobAtT ? 0.8 : 0.3}
                rx={4}
              />
            );
          })}

          {/* Pfeile für Release und Deadline */}
          {task.jobs?.map((job, j) => (
            <React.Fragment key={j}>
              {/* Release */}
              <line
                x1={(job.start ?? job.release) * scale + 30}
                y1={40}
                x2={(job.start ?? job.release) * scale + 30}
                y2={20}
                stroke="blue"
                strokeWidth="2"
                markerEnd="url(#arrow-up)"
              />

              {/* Deadline */}
              <line
                x1={(job.start ?? job.release + job.C) * scale + 30}
                y1={70}
                x2={(job.start ?? job.release + job.C) * scale + 30}
                y2={40}
                stroke="blue"
                strokeWidth="2"
                markerEnd="url(#arrow-down)"
              />
            </React.Fragment>
          ))}
        </g>
      ))}
    </svg>
  );
}
