import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";

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

type Props = {
  tasks: Task[];
  hyperperiod: number;
  schedule?: ScheduleEntry[];
  pxPerStep?: number;
  timeStepLabelEvery?: number;
  heightPerTask?: number;
  leftLabelWidth?: number;
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
}: Props) {
  const maxOffset = Math.max(...tasks.map(t => t.O ?? 0));
  const svgWidth = leftLabelWidth + (hyperperiod + maxOffset) * pxPerStep + 40;
  const svgHeight = tasks.length * heightPerTask + 80;
  const axisColor = "#0d2b6cff";
  const timeFontSize = 15;
  const labelFontSize = 18;

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
        <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="white" />

        {tasks.map((task, i) => {
          if (!task.T || task.T <= 0 || isNaN(task.T)) {
            return null;
          }
          const yTop = 24 + i * heightPerTask;
          const centerY = yTop + heightPerTask / 2;

          return (
            <g key={task.id}>

              {/* task label area at the left*/}
              <rect
                x={0}
                y={yTop}
                width={leftLabelWidth - 12}
                height={heightPerTask - 12 - 20}
                rx={8}
                fill="#ffffffff"
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

              {/* X-axis */}
              <line
                x1={leftLabelWidth}
                y1={centerY - 10}
                x2={leftLabelWidth + (hyperperiod + maxOffset) * pxPerStep}
                y2={centerY - 10}
                stroke="#1442a5ff"
                strokeWidth={2}
              />

              {/* Y-axis */}
              <line
                x1={leftLabelWidth}
                y1={yTop}
                x2={leftLabelWidth}
                y2={yTop + heightPerTask - heightPerTask / 1.75}
                stroke={axisColor}
                strokeWidth={2}
              />

              {/* timesteps for x-axis */}
              <g transform={`translate(${leftLabelWidth}, ${yTop + heightPerTask - heightPerTask / 1.75})`}>
                {Array.from({ length: hyperperiod + maxOffset + 1 }).map((_, t) => {
                  const x = t * pxPerStep;
                  const showLabel = 1;
                  return (
                    <g key={t}>
                      {/* small tick */}
                      <line
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={6}
                        stroke={axisColor}
                        strokeWidth={1}
                      />
                      {/* optional label */}
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
                    
              {/* Execution Blocks */}
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
              
              {/* Release and Deadline Markers */}

              {Array.from({ length: Math.ceil(hyperperiod / task.T) }, (_, k) => {
                const releaseTime = k === 0 ? (task.O ?? 0) : k * task.T;
                const deadlineTime = releaseTime + task.D;

                return (
                  <g key={`markers-${k}`}>
                    {/* Release marker (Up) */}
                    <line
                      x1={leftLabelWidth + releaseTime * pxPerStep}
                      y1={centerY - 11.5}
                      x2={leftLabelWidth + releaseTime * pxPerStep}
                      y2={centerY- 37.5}
                      stroke="green"
                      strokeWidth={2}
                      markerEnd="url(#arrowUp)"
                    />

                    {/* Deadline marker (Down) */}
                    <line
                      x1={leftLabelWidth + deadlineTime * pxPerStep}
                      y1={centerY - 36.5}
                      x2={leftLabelWidth + deadlineTime * pxPerStep}
                      y2={centerY - 16.5}
                      stroke="red"
                      strokeWidth={2}
                      markerEnd="url(#arrowDown)"
                    />
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
