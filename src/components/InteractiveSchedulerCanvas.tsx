import { useState, useEffect } from "react";
import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";

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
}

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
  pxPerStep = 50,
  heightPerTask = 120,
  leftLabelWidth = 120,
  visibility,
  userScheduleRef,
  setUserScheduleRef,
  highlight,
}: Props) {

  const maxOffset = Math.max(...tasks.map(t => t.O ?? 0));
  const svgWidth = leftLabelWidth + (hyperperiod + maxOffset) * pxPerStep + 40;
  const svgHeight = tasks.length * heightPerTask + 40;
  const axisColor = "#0d2b6c";


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

    if (hintApplied) return taskColor;
    return filled ? taskColor : "#f0f0f0";
  };

  return (
    <svg width={svgWidth} height={svgHeight} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

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
      
      {tasks.map((task, i) => {
        if (!task.T || task.T <= 0 || isNaN(task.T)) {
          return null;
        }
    
        const yTop = 20 + i * heightPerTask;
        const centerY = yTop + heightPerTask / 2;
        const isHighlightedTask = highlight && highlight === task.id;

        return (
          <g key={task.id} style={{ opacity: highlight && !isHighlightedTask ? 0.25 : 1 }}>
            {/* Task Label */}
            <rect
              x={0}
              y={yTop + 10}
              width={leftLabelWidth - 10}
              height={heightPerTask - 20}
              rx={6}
              fill={task.color}
              opacity={0.85}
              stroke="#000"
              strokeWidth={0.5}
            />
            <text x={10} y={centerY} fontSize={18} alignmentBaseline="middle" fill="#111">
              {task.name}
            </text>

            {/* X-Axis */}
            <line
              x1={leftLabelWidth}
              y1={centerY + 20}
              x2={leftLabelWidth + hyperperiod * pxPerStep}
              y2={centerY + 20}
              stroke={axisColor}
              strokeWidth={2}
            />

            {/* Time Ticks */}
            {Array.from({ length: hyperperiod }).map((_, t) => {
              const x = leftLabelWidth + t * pxPerStep;
              return (
                <g key={t}>
                  <line x1={x} y1={centerY + 20} x2={x} y2={centerY + 30} stroke={axisColor} strokeWidth={1} />
                  <text x={x} y={centerY + 45} fontSize={12} textAnchor="middle">{t}</text>
                </g>
              );
            })}

            {/* Execution Blocks */}
            {Array.from({ length: hyperperiod }).map((_, t) => {
              const x = leftLabelWidth + t * pxPerStep;
              const color = getRectColor(task.id, t);
              return (
                <rect
                  key={t}
                  x={x}
                  y={centerY - 35}
                  width={pxPerStep - 1}
                  height={55}
                  fill={color}
                  stroke="#000"
                  rx={4}
                  onMouseDown={() => handleMouseDown(task.id, t)}
                  onMouseEnter={() => handleMouseMove(task.id, t)}
                  style={{ cursor: isTaskLocked(task.id) ? "not-allowed" : "pointer" }}
                />
              );
            })}

            {/* Release & Deadline Markers */}
            {Array.from({ length: Math.ceil(hyperperiod / task.T) }, (_, k) => {
              const releaseTime = k === 0 ? (task.O ?? 0) : k * task.T;
              const deadlineTime = releaseTime + task.D;

              return (
                <g key={`markers-${task.id}-${k}`}>
                  {/* Release Marker */}
                  {mergedVisibility.showReleaseMarkers && (
                    <line
                      x1={leftLabelWidth + releaseTime * pxPerStep}
                      y1={centerY + 20}
                      x2={leftLabelWidth + releaseTime * pxPerStep}
                      y2={centerY - 15}
                      stroke="green"
                      strokeWidth={2.5}
                      markerEnd="url(#arrowUp)"
                    />
                  )}

                  {/* Deadline Marker */}
                  {mergedVisibility.showDeadlineMarkers && (
                    <line
                      x1={leftLabelWidth + deadlineTime * pxPerStep}
                      y1={centerY - 10}
                      x2={leftLabelWidth + deadlineTime * pxPerStep}
                      y2={centerY + 25}
                      stroke="red"
                      strokeWidth={2.5}
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
  );
}
