import { useState } from "react";
import type { Task } from "../core/task";

interface Props {
  tasks: Task[];
  hyperperiod: number;
  pxPerStep?: number;
  heightPerTask?: number;
  leftLabelWidth?: number;
  userScheduleRef: Record<string, Set<number>>;
  setUserScheduleRef: (ref: Record<string, Set<number>>) => void;
  highlight?: string | null;
}

export default function InteractiveSchedulerCanvas({
  tasks,
  hyperperiod,
  pxPerStep = 50,
  heightPerTask = 120,
  leftLabelWidth = 120,
  userScheduleRef,
  setUserScheduleRef,
  highlight,
}: Props) {
  const svgWidth = leftLabelWidth + hyperperiod * pxPerStep + 40;
  const svgHeight = tasks.length * heightPerTask + 40;
  const axisColor = "#0d2b6c";

  const [dragStart, setDragStart] = useState<{ taskId: string; time: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);

  const handleMouseDown = (taskId: string, time: number) => {
    setDragStart({ taskId, time });
    setDragEnd(time);
  };

  const handleMouseMove = (taskId: string, time: number) => {
    if (dragStart && dragStart.taskId === taskId) {
      setDragEnd(time);
    }
  };

  const handleMouseUp = () => {
    if (!dragStart || dragEnd === null) return;
    const { taskId, time: start } = dragStart;
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

  const getRectColor = (taskId: string, time: number) => {
    const filled = userScheduleRef[taskId]?.has(time) ?? false;
    const taskColor = tasks.find(t => t.id === taskId)?.color ?? "#60a5fa";

    // temporär beim Drag
    if (dragStart && dragStart.taskId === taskId && dragEnd !== null) {
      const start = dragStart.time;
      const end = dragEnd;
      const minT = Math.min(start, end);
      const maxT = Math.max(start, end);
      if (time >= minT && time <= maxT) {
        return taskColor + "77"; // halbtransparent
      }
    }

    return filled ? taskColor : "#f0f0f0";
  };

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      style={{ border: "1px solid #ddd" }}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {tasks.map((task, i) => {
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
            <text
              x={10}
              y={centerY}
              fontSize={18}
              alignmentBaseline="middle"
              fill="#111"
            >
              {task.name}
            </text>

            {/* X-Achse */}
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
                  <line
                    x1={x}
                    y1={centerY + 20}
                    x2={x}
                    y2={centerY + 30}
                    stroke={axisColor}
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={centerY + 45}
                    fontSize={12}
                    textAnchor="middle"
                  >
                    {t}
                  </text>
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
                  width={pxPerStep - 4}
                  height={55}
                  fill={color}
                  stroke="#000"
                  rx={4}
                  onMouseDown={() => handleMouseDown(task.id, t)}
                  onMouseEnter={() => handleMouseMove(task.id, t)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
