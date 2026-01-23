// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";

// Type for highlighted execution blocks
type HighlightBlocks = {
  taskId: string;
  steps: number[];
};

interface Props {
  tasks: Task[];
  hyperperiod: number;
  schedule: ScheduleEntry[];
  hintBlocks?: Record<string, Set<number>>;      // Execution of a Task (hint)
  pxPerStep?: number;
  heightPerTask?: number;
  visibility?: Partial<typeof DEFAULT_VISIBILITY>;
  leftLabelWidth?: number;
  userScheduleRef: Record<string, Set<number>>;
  setUserScheduleRef: (ref: Record<string, Set<number>>) => void;
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


export default function InteractiveSchedulerCanvas({
  tasks,
  hyperperiod,
  hintBlocks = {},
  pxPerStep = 28,
  heightPerTask = 150,
  leftLabelWidth = 72,
  visibility,
  userScheduleRef,
  setUserScheduleRef,
  highlight,
  highlightExecutions = [],
}: Props) {

  const maxOffset = Math.max(...tasks.map(t => t.O ?? 0));
  const svgWidth = leftLabelWidth + (hyperperiod + maxOffset) * pxPerStep + 40;
  const svgHeight = tasks.length * heightPerTask + 80;

  const axisColor = "#0d2b6cff";
  const timeFontSize = 15;
  const labelFontSize = 18;

  // Merged Visibility with Hint States
  const mergedVisibility = {
    ...DEFAULT_VISIBILITY,
    ...visibility,
    showReleaseMarkers: visibility?.showReleaseMarkers, 
    showDeadlineMarkers: visibility?.showDeadlineMarkers
  };

  const [dragStart, setDragStart] = useState<{ taskId: string; time: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);

  // Lock Tasks which have hints applied 
  const isTaskLocked = (taskId: string) => hintBlocks[taskId]?.size > 0;

  // Delete Schedule Entries if hint is applied
  useEffect(() => {
    Object.keys(hintBlocks).forEach(taskId => {
      if (isTaskLocked(taskId)) {
        const newSchedule: Record<string, Set<number>> = {};
        Object.entries(userScheduleRef).forEach(([key, val]) => {
          newSchedule[key] = key === taskId ? new Set<number>() : new Set(val);
        });
        setUserScheduleRef(newSchedule);
      }
    });
  }, [hintBlocks, userScheduleRef, setUserScheduleRef]);

  // Drag & Drop 
  const handleMouseDown = (taskId: string, time: number) => {
    if (isTaskLocked(taskId)) return;
    setDragStart({ taskId, time });
    setDragEnd(time);
  };

  const handleMouseMove = (taskId: string, time: number) => {
    if (dragStart && dragStart.taskId === taskId && !isTaskLocked(taskId)) setDragEnd(time);
  };

  const handleMouseUp = () => {
    if (!dragStart || dragEnd === null) return;
    const { taskId, time: start } = dragStart;
    if (isTaskLocked(taskId)) {
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const end = dragEnd;
    const newSchedule = { ...userScheduleRef };
    const set = newSchedule[taskId] ?? new Set<number>();
    const range = start <= end ? [start, end] : [end, start];

    for (let t = range[0]; t <= range[1]; t++) {
      if (set.has(t)) set.delete(t);
      else set.add(t);
    }
    newSchedule[taskId] = set;
    setUserScheduleRef(newSchedule);

    setDragStart(null);
    setDragEnd(null);
  };

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

  // Block Color for dragging and hints
  const getRectColor = (taskId: string, time: number) => {
    const filled = userScheduleRef[taskId]?.has(time) ?? false;
    const taskColor = tasks.find(t => t.id === taskId)?.color ?? "#60a5fa";
    const hintApplied = hintBlocks[taskId]?.has(time) ?? false;

    if (dragStart && dragStart.taskId === taskId && dragEnd !== null) {
      const start = dragStart.time;
      const end = dragEnd;
      if (time >= Math.min(start, end) && time <= Math.max(start, end)) return taskColor + "77";
    }

    if (hintApplied) return taskColor + 50;
    return filled ? taskColor : "#f0f0f0";
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 min-w-0 overflow-auto border-r rounded-md shadow-sm bg-white">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >

          {/* Marker Definition */}
          <defs>
            <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="180">
              <path d="M0,0 L6,0 L3,6 Z" fill="green" />
            </marker>
            <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="180">
              <path d="M0,6 L6,6 L3,0 Z" fill="red" />
            </marker>
          </defs>

          {tasks.map((task, i) => {
            if (!task.T || task.T <= 0) return null;

            const yTop = 24 + i * heightPerTask;
            const centerY = yTop + heightPerTask / 2;
            const isHighlighted = task.id === highlight;

            return (
              <g
                key={task.id}
                style={{
                  opacity: highlight && !isHighlighted ? 0.25 : 1,
                }}
              >

                {/* Task Label */}
                {mergedVisibility.showTaskLabels && (
                  <>
                    <rect
                      x={0}
                      y={yTop}
                      width={leftLabelWidth - 12}
                      height={heightPerTask - 32}
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

                {/* X Axis */}
                {mergedVisibility.showXAxis && (
                  <line
                    x1={leftLabelWidth}
                    y1={centerY - 10}
                    x2={leftLabelWidth + (hyperperiod + maxOffset) * pxPerStep}
                    y2={centerY - 10}
                    stroke="#1442a5ff"
                    strokeWidth={2}
                  />
                )}

                {/* Time Ticks */}
                {mergedVisibility.showTimeTicks && (
                  <g transform={`translate(${leftLabelWidth}, ${yTop + heightPerTask - heightPerTask / 1.75})`}>
                    {Array.from({ length: hyperperiod + maxOffset + 1 }).map((_, t) => {
                      const x = t * pxPerStep;
                      return (
                        <g key={t}>
                          <line x1={x} y1={0} x2={x} y2={6} stroke={axisColor} />
                          <text
                            x={x}
                            y={18}
                            textAnchor="middle"
                            fontSize={timeFontSize - 2}
                          >
                            {t}
                          </text>
                        </g>
                      );
                    })}
                  </g>
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

                {/* Execution Blocks with drag&drop */}
                {Array.from({ length: hyperperiod + maxOffset }).map((_, t) => {
                  const x = leftLabelWidth + t * pxPerStep;
                  const y = centerY - heightPerTask / 2 + 10;
                  const blockHeight = heightPerTask / 2 - 20;

                  return (
                    <rect
                      key={t}
                      x={x}
                      y={y}
                      width={pxPerStep}
                      height={blockHeight}
                      rx={3}
                      fill={getRectColor(task.id, t)}
                      opacity={0.85}
                      stroke="#1e293b"
                      strokeWidth={0.5}
                      onMouseDown={() => handleMouseDown(task.id, t)}
                      onMouseEnter={() => handleMouseMove(task.id, t)}
                      style={{
                        cursor: isTaskLocked(task.id) ? "not-allowed" : "pointer",
                      }}
                    />
                  );
                })}

                {/* Release and Deadline Markers */}
                {Array.from({ length: Math.ceil((hyperperiod + (task.O ?? 0)) / task.T) }, (_, k) => {
                  const releaseTime = (task.O ?? 0) + k * task.T;
                  const deadlineTime = releaseTime + task.D;
                  if (releaseTime >= hyperperiod + (task.O ?? 0)) return null;

                  return (
                    <g key={k}>
                      {mergedVisibility.showReleaseMarkers && (
                        <line
                          x1={leftLabelWidth + releaseTime * pxPerStep}
                          y1={centerY - 11.5}
                          x2={leftLabelWidth + releaseTime * pxPerStep}
                          y2={centerY - 37.5}
                          stroke="green"
                          strokeWidth={2}
                          markerEnd="url(#arrowUp)"
                        />
                      )}
                      {mergedVisibility.showDeadlineMarkers && (
                        <line
                          x1={leftLabelWidth + deadlineTime * pxPerStep}
                          y1={centerY - 36.5}
                          x2={leftLabelWidth + deadlineTime * pxPerStep}
                          y2={centerY - 16.5}
                          stroke="red"
                          strokeWidth={2}
                          markerEnd="url(#arrowDown)"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
