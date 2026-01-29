// @ts-nocheck

import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { useMemo } from "react";

/*
The main canvas component to render the scheduling visualization.
Uses SVG to draw the schedule based on the provided tasks and schedule data.
Props:
- tasks: Array of Task objects defining the tasks to be scheduled.
- hyperperiod: The total time span to visualize (LCM of task periods).
- schedule: Optional array of ScheduleEntry objects defining the schedule.
- pxPerStep: Pixels per time unit for scaling the time axis.
- timeStepLabelEvery: Interval for labeling time steps on the axis.
- heightPerTask: Vertical space allocated per task row. 
- leftLabelWidth: Width of the left label area for task names.
*/

// Type for highlighted execution blocks
type HighlightBlocks = {
  taskId: string;
  steps: number[];
};

type Props = {
  tasks: Task[];
  hyperperiod: number;
  schedule?: ScheduleEntry[];
  pxPerStep?: number;
  timeStepLabelEvery?: number;
  heightPerTask?: number;
  leftLabelWidth?: number;
  svgManualWidth?: number;
  svgManualHeight?: number;
  visibility?: Partial<typeof DEFAULT_VISIBILITY>;
  hideReleaseMarkersFor?: string[];
  hideDeadlineMarkersFor?: string[];
  highlight?: string | null;
  highlightExecutions?: HighlightBlocks[];
};

const DEFAULT_VISIBILITY = {
  showTaskLabels: true,
  showXAxis: true,
  showYAxis: true,
  showTimeTicks: true,
  showExecutionBlocks: true,
  showReleaseMarkers: true,
  showDeadlineMarkers: true,
};

// SchedulerCanvas function to visualize the scheduling
export default function SchedulerCanvas({
  tasks,
  hyperperiod,
  schedule = [],
  pxPerStep = 28,
  //timeStepLabelEvery = 1,
  heightPerTask = 125,
  leftLabelWidth = 72,
  visibility,
  hideReleaseMarkersFor = [],
  hideDeadlineMarkersFor = [],
  highlight,
  highlightExecutions = [],
}: Props) {

  // Calculate the maximum deadline that appears within the hyperperiod
  let maxDeadline = hyperperiod;
  for (const task of tasks) {
    const offset = task.O ?? 0;
    const period = task.T;
    const deadline = task.D;
    // Check each release within the hyperperiod
    for (let k = 0; k * period + offset < hyperperiod; k++) {
      const releaseTime = offset + k * period;
      const taskDeadline = releaseTime + deadline;
      maxDeadline = Math.max(maxDeadline, taskDeadline);
    }
  }

  const svgWidth = leftLabelWidth + maxDeadline * pxPerStep + 40;
  const svgHeight = tasks.length * heightPerTask + 80;
  const axisColor = "#0d2b6cff";
  const timeFontSize = 15;
  const labelFontSize = 18;

  const mergedVisibility = {
    ...DEFAULT_VISIBILITY,
    ...visibility,
  }

  const hideReleaseSet = useMemo(() => new Set(hideReleaseMarkersFor), [hideReleaseMarkersFor]);
  const hideDeadlineSet = useMemo(() => new Set(hideDeadlineMarkersFor), [hideDeadlineMarkersFor]);

  // Lookup Map for highlighted executions
  const highlightExecutionMap = useMemo(() => {
    const map = new Map<string, Set<number>>();
    highlightExecutions.forEach(h => {
      map.set(h.taskId, new Set(h.steps));
    });
    return map;
  }, [highlightExecutions]);

  const isExecutionHighlighted = (taskId: string, time: number) => {
    return highlightExecutionMap.get(taskId)?.has(time) ?? false;
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 min-w-0 overflow-auto border-r rounded-md shadow-sm bg-white">
        {/* SVG Canvas */}
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
          aria-label="Scheduler Canvas"
          >
        {/* Definitions for patterns and markers */}
        <defs>
          <pattern id="lightGrid" width={pxPerStep} height={pxPerStep} patternUnits="userSpaceOnUse">
          <rect width={pxPerStep} height={pxPerStep} fill="transparent" />
          </pattern>
        </defs>

        <defs>
          <marker
            id="arrowUp"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="6"
            orient="180"
            markerUnits="userSpaceOnUse"
            >
            <path d="M0,0 L6,0 L3,6 Z" fill="green" />
          </marker>

          <marker
            id="arrowDown"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="6"
            orient="180"
            markerUnits="userSpaceOnUse"
            >
            <path d="M0,6 L6,6 L3,0 Z" fill="red" />
          </marker>
        </defs>

        {/* Background */}
        <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="transparent" />

        {tasks.map((task, i) => {
          if (!task.T || task.T <= 0 || isNaN(task.T)) {
            return null;
          }
          const isHighlightedTask =  task.id === highlight;
          const yTop = 24 + i * heightPerTask;
          const centerY = yTop + heightPerTask / 2;

          return (
            <g key={task.id}
              style={{
                opacity: highlight && !isHighlightedTask ? 0.25 : 1,
                pointerEvents: isHighlightedTask ? "auto" : "none",
              }}
            >

              {/* Task label area at the left */}
              {mergedVisibility.showTaskLabels && (
                <>
                  <rect
                    x={0}
                    y={yTop}
                    width={leftLabelWidth - 12}
                    height={heightPerTask - 12 - 20}
                    rx={3}
                    fill={task.color}
                    opacity={0.85}
                    stroke="#1e293b"
                    strokeWidth={0.5}
                  />

                  <text
                    x={12}
                    y={centerY - 10}
                    fontSize={labelFontSize}
                    fontWeight={600}
                    fill="#111827"
                    >
                    {task.name}
                  </text>
                </>
              )}

              {/* X-axis */}
              {mergedVisibility.showXAxis && (
                <>
                  <line
                    x1={leftLabelWidth}
                    y1={centerY - 10}
                    x2={leftLabelWidth + maxDeadline * pxPerStep}
                    y2={centerY - 10}
                    stroke="#1442a5ff"
                    strokeWidth={2}
                  />
                </>
              )}

              {mergedVisibility.showYAxis && (
                <>
                  {/* Y-axis */}
                  <line
                    x1={leftLabelWidth}
                    y1={yTop}
                    x2={leftLabelWidth}
                    y2={yTop + heightPerTask - heightPerTask / 1.75}
                    stroke={axisColor}
                    strokeWidth={2}
                  />
                </>
              )}

              {/* Timesteps for x-axis */}
              {mergedVisibility.showTimeTicks && (
                <>
                  <g transform={`translate(${leftLabelWidth}, ${yTop + heightPerTask - heightPerTask / 1.75})`}>
                    {Array.from({ length: maxDeadline + 1 }).map((_, t) => {
                      const x = t * pxPerStep;
                      const showLabel = 1;
                      return (
                        <g key={t}>
                          {/* Small ticks */}
                          <line
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={6}
                            stroke={axisColor}
                            strokeWidth={1}
                          />
                          {/* Optional label */}
                          {showLabel && (
                            <text
                              x={x}
                              y={18}
                              textAnchor="middle"
                              fontSize={timeFontSize - 2}
                              fill="#0f0e0dff"
                            >
                              {t}
                            </text>
                            )}
                        </g>
                      );
                    })}
                  </g>
                </>
              )}  

              {/* Highlighting for Execution Blocks */}
              {highlightExecutionMap.has(task.id) && (
                <g>
                  {[...highlightExecutionMap.get(task.id)!].map(t => {
                    const x = leftLabelWidth + t * pxPerStep;
                    const y = centerY - heightPerTask / 2 - 5;
                    const blockHeight = heightPerTask / 2 + 10

                    return (
                      <rect
                        key={`exec-highlight-${task.id}-${t}`}
                        x={x}
                        y={y}
                        width={pxPerStep}
                        height={blockHeight}
                        rx={3}
                        fill="#fde68a"
                        opacity={0.45}
                        pointerEvents="none"
                      />
                    );
                  })}
                </g>
              )}


              {/* Execution Blocks */}
              {mergedVisibility.showExecutionBlocks && (
                <>
                  {schedule.filter((s) => s.taskId === task.id).map((s) => {
                    const x = leftLabelWidth + s.time * pxPerStep;
                    const y = centerY - heightPerTask / 2 + 10; 
                    const blockHeight = heightPerTask / 2 - 20;
                    return (
                      <rect
                        key={`${task.id}-${s.time}`}
                        x={x}
                        y={y}
                        width={pxPerStep}
                        height={blockHeight}
                        fill={task.color}
                        opacity={0.85}
                        stroke="#1e293b"
                        strokeWidth={0.5}
                        rx={3}
                      />
                    );
                  })}
                </>
              )}

              {/* Release and Deadline Markers */}
              {(() => {
                // Calculate release times and deadlines for this task
                // Collect unique releases and map to deadlines
                const releaseSet = new Set<number>();
                for (let k = 0; k * task.T + (task.O ?? 0) < hyperperiod + (task.O ?? 0); k++) {
                  releaseSet.add((task.O ?? 0) + k * task.T);
                }
                
                const jobs = Array.from(releaseSet)
                  .filter(release => release < hyperperiod + (task.O ?? 0))
                  .map(release => ({
                    release,
                    deadline: release + task.D,
                  }))

                return jobs.map(job => (
                  <g key={`job-${task.id}-${job.release}`}>
                    {/* Release Marker (Up) */}
                    {mergedVisibility.showReleaseMarkers && !hideReleaseSet.has(task.id) && (
                      <line
                        x1={leftLabelWidth + job.release * pxPerStep}
                        y1={centerY - 11.5}
                        x2={leftLabelWidth + job.release * pxPerStep}
                        y2={centerY - 37.5}
                        stroke="green"
                        strokeWidth={2}
                        markerEnd="url(#arrowUp)"
                      />
                    )}

                    {/* Deadline Marker (Down) */}
                    {mergedVisibility.showDeadlineMarkers && !hideDeadlineSet.has(task.id) && (
                      <line
                        x1={leftLabelWidth + job.deadline * pxPerStep}
                        y1={centerY - 36.5}
                        x2={leftLabelWidth + job.deadline * pxPerStep}
                        y2={centerY - 16.5}
                        stroke="red"
                        strokeWidth={2}
                        markerEnd="url(#arrowDown)"
                      />
                    )}
                  </g>
                ));
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  </div>
  );
}
