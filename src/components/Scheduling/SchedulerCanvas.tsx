// @ts-nocheck

import type { Task, SuspensionInterval, SuspensionPattern } from "../../core/task";
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

// Helper function to get all the Suspension Intervals or the pattern for a task in the hyperperiod
function getSuspension(task: Task, hyperperiod: number) : SuspensionInterval[] {
  
  // If no Suspension return empty
  if (!task.suspension) {
    return [];
  }

  // If set array is given return it for given hyperperiod
  if (Array.isArray(task.suspension)) {
    return task.suspension.filter(w => w.start < hyperperiod);
  }

  // If pattern is given, generate all the Intervals for hyperperiod
  const {offset, duration, period} = task.suspension as SuspensionPattern;
  const intervals: SuspensionInterval[] = [];

  for (let i = 0; offset + i * period < hyperperiod; i++) {
    const start = offset+ i * period;
    intervals.push({start, end: start + duration});
  }
  return intervals;
}

// Type for highlighted execution blocks
type HighlightBlocks = {
  taskId: string;
  steps: number[];
};

type Props = {
  tasks: Task[];
  hyperperiod: number;
  interval?: [number, number];
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
  interval,
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
  // If interval is provided, use it instead of the full hyperperiod
  let maxDeadline = 0;
  if(interval) {
    // When interval is provided, use its width
    maxDeadline = interval[1] - interval[0];
  }
  else{
    maxDeadline = hyperperiod;

    for (const task of tasks) {
      const offset = task.O ?? 0;
      const period = task.T;
      const deadline = task.D;
      // Check each release within the hyperperiod
      for (let k = 0; k * period + offset < hyperperiod; k++) {
        const releaseTime = offset + k * period;
        const taskDeadline = releaseTime + deadline;
        maxDeadline = Math.max(maxDeadline, Math.min(taskDeadline, hyperperiod));
      }
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

  // Compute all suspension intervals for each task beforehand
  const suspensionIntervalsMap = useMemo(() => {
    const map = new Map<string, SuspensionInterval[]>();
    const effectiveLength = interval ? interval[1] : hyperperiod;
    tasks.forEach(task => {
      map.set(task.id, getSuspension(task, effectiveLength));
    });
    return map;
  }, [tasks, hyperperiod, interval]);

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
                    {Array.from({ length: maxDeadline + 1}).map((_, t) => {
                      const x = t * pxPerStep;
                      const showLabel = 1;
                      const displayTime = interval ? t + interval[0] : t;
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
                              {displayTime}
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
                  {[...highlightExecutionMap.get(task.id)!]
                    .filter((t) => {
                      // If interval is provided, only highlight entries within the interval
                      if (interval) {
                        return t >= interval[0] && t < interval[1];
                      }
                      return true;
                    })
                    .map(t => {
                      const adjustedTime = interval ? t - interval[0] : t;
                      const x = leftLabelWidth + adjustedTime * pxPerStep;
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

              {/* Suspension Blocks */}
              {suspensionIntervalsMap.get(task.id)!.length > 0 && (
                <g>
                  {suspensionIntervalsMap.get(task.id)!
                    .filter((suspensionInterval) => {
                      // If scheduler interval is given, only show suspension within the interval
                      if (interval) {
                        return suspensionInterval.start < interval[1] && suspensionInterval.end > interval[0];
                      }
                      return true;
                    })
                    .map((suspensionInterval, idx) => {
                      // Adjust the suspension block to fit within the interval if provided
                      const startTime = interval ? Math.max(suspensionInterval.start, interval[0]) : suspensionInterval.start;
                      const endTime = interval ? Math.min(suspensionInterval.end, interval[1]) : suspensionInterval.end;
                      const adjustedStart = interval ? startTime - interval[0] : startTime;
                      
                      const xStart = leftLabelWidth + adjustedStart * pxPerStep;
                      const width = (endTime - startTime) * pxPerStep;
                      // Suspension block are smaller red blocks with patterns
                      const y = centerY - heightPerTask / 2 + 20;
                      const blockHeight = heightPerTask / 2 - 30;

                      return (
                        <g key={`susp-${task.id}-${idx}`}>
                          {/* Background */}
                          <rect
                            x={xStart}
                            y={y}
                            width={width}
                            height={blockHeight}
                            rx={2}
                            fill="#dc2626"
                            opacity={0.15}
                            stroke="#991b1b"
                            strokeWidth={1.5}
                            pointerEvents="none"
                          />
                          {/* Diagonal hatching pattern */}
                          <defs>
                            <pattern id={`hatch-${task.id}-${idx}`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                              <line x1="0" y1="0" x2="0" y2="4" stroke="#991b1b" strokeWidth="1" opacity="0.4" />
                            </pattern>
                          </defs>
                          <rect
                            x={xStart}
                            y={y}
                            width={width}
                            height={blockHeight}
                            rx={2}
                            fill={`url(#hatch-${task.id}-${idx})`}
                            pointerEvents="none"
                          />
                        </g>
                      );
                    })}
                </g>
              )}

              {/* Execution Blocks */}
              {mergedVisibility.showExecutionBlocks && (
                <>
                  {schedule
                    .filter((s) => s.taskId === task.id)
                    .filter((s) => {
                      // If schedule interval is provided, only show executions that are within the interval
                      if (interval) {
                        return s.time < interval[1] && (s.time + s.duration) > interval[0];
                      }
                      return true;
                    })
                    .map((s) => {
                      const blockStart = interval ? Math.max(s.time, interval[0]) : s.time;
                      const blockEnd = interval ? Math.min(s.time + s.duration, interval[1]) : s.time + s.duration;
                      const adjustedTime = interval ? blockStart - interval[0] : blockStart;
                      const clippedDuration = blockEnd - blockStart;
                      
                      const x = leftLabelWidth + adjustedTime * pxPerStep;
                      const y = centerY - heightPerTask / 2 + 10; 
                      const blockHeight = heightPerTask / 2 - 20;
                      const blockWidth = clippedDuration * pxPerStep;
                      return (
                        <rect
                          key={`${task.id}-${s.time}`}
                          x={x}
                          y={y}
                          width={blockWidth}
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
                // Use interval end if provided, otherwise use hyperperiod
                const effectiveLength = interval ? interval[1] : hyperperiod;
                
                // Collect unique releases and map to deadlines
                const releaseSet = new Set<number>();
                for (let k = 0; k * task.T + (task.O ?? 0) < effectiveLength + (task.O ?? 0); k++) {
                  releaseSet.add((task.O ?? 0) + k * task.T);
                }
                
                let jobs = Array.from(releaseSet)
                  .filter(release => release < effectiveLength + (task.O ?? 0))
                  .map(release => ({
                    release,
                    deadline: release + task.D,
                  }));
                
                // Filter jobs based on schedule interval if interval is provided
                if (interval) {
                  jobs = jobs.filter(job => 
                    (job.release <= interval[1] && job.release >= interval[0]) ||
                    (job.deadline <= interval[1] && job.deadline >= interval[0])
                  );
                }

                return jobs.map(job => {
                  // Adjust positions if interval is provided
                  const adjustedRelease = interval ? job.release - interval[0] : job.release;
                  const adjustedDeadline = interval ? job.deadline - interval[0] : job.deadline;
                  
                  return (
                    <g key={`job-${task.id}-${job.release}`}>
                      {/* Release Marker (Up) */}
                      {mergedVisibility.showReleaseMarkers && !hideReleaseSet.has(task.id) && job.release >= (interval?.[0] ?? 0) && job.release <= (interval?.[1] ?? hyperperiod) && (
                        <line
                          x1={leftLabelWidth + adjustedRelease * pxPerStep}
                          y1={centerY - 11.5}
                          x2={leftLabelWidth + adjustedRelease * pxPerStep}
                          y2={centerY - 37.5}
                          stroke="green"
                          strokeWidth={2}
                          markerEnd="url(#arrowUp)"
                        />
                      )}

                      {/* Deadline Marker (Down) */}
                      {mergedVisibility.showDeadlineMarkers && !hideDeadlineSet.has(task.id) && job.deadline >= (interval?.[0] ?? 0) && job.deadline <= (interval?.[1] ?? hyperperiod) && (
                        <line
                          x1={leftLabelWidth + adjustedDeadline * pxPerStep}
                          y1={centerY - 36.5}
                          x2={leftLabelWidth + adjustedDeadline * pxPerStep}
                          y2={centerY - 16.5}
                          stroke="red"
                          strokeWidth={2}
                          markerEnd="url(#arrowDown)"
                        />
                      )}
                    </g>
                  );
                });
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  </div>
  );
}
