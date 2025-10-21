import type { Schedule, Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";

type Props = {
  tasks: Task[];
  hyperperiod: number;
  schedule?: ScheduleEntry[];
  pxPerStep?: number;
  timeStepLabelEvery?: number;
  heightPerTask?: number;
  leftLabelWidth?: number;
};

export default function SchedulerCanvas({
  tasks,
  hyperperiod,
  schedule = [],
  pxPerStep = 28,
  timeStepLabelEvery = 1,
  heightPerTask = 125,
  leftLabelWidth = 72,
}: Props) {
  const svgWidth = leftLabelWidth + hyperperiod * pxPerStep + 40;
  const svgHeight = tasks.length * heightPerTask + 80;
  const axisColor = "#0d2b6cff";
  const timeFontSize = 15;
  const labelFontSize = 18;

  return (
    <div className="flex h-screen">
        <div className="flex-1 min-w-0 overflow-auto border-r rounded-md shadow-sm bg-white">
            <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="block"
            aria-label="Scheduler Canvas"
            >
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
                refY="-6"
                orient="180"
                markerUnits="strokeWidth"
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
                markerUnits="strokeWidth"
              >
                <path d="M0,6 L6,6 L3,0 Z" fill="red" />
              </marker>
            </defs>

            {/* Background */}
            <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="white" />

            {/* Horizontal rows for each task */}
            {tasks.map((task, i) => {
                const yTop = 24 + i * heightPerTask;
                const centerY = yTop + heightPerTask / 2;

                return (
                <g key={task.id}>
                    {/* task label area */}
                    <rect
                    x={0}
                    y={yTop}
                    width={leftLabelWidth - 12}
                    height={heightPerTask - 12 - 20}
                    rx={8}
                    fill="#f8fafc"
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

                    {/* horizontale Task-X-Achse */}
                    <line
                    x1={leftLabelWidth}
                    y1={centerY - 10}
                    x2={leftLabelWidth + hyperperiod * pxPerStep}
                    y2={centerY - 10}
                    stroke="#1442a5ff"
                    strokeWidth={2}
                    />

                    {/* kleine vertikale Y-Achse links für diese Task */}
                    <line
                    x1={leftLabelWidth}
                    y1={yTop}
                    x2={leftLabelWidth}
                    y2={yTop + heightPerTask - heightPerTask / 1.75} // bis zur Mini-X-Achse
                    stroke={axisColor}
                    strokeWidth={2}
                    />

                    {/* mini time axis unter dem Task */}
                    <g transform={`translate(${leftLabelWidth}, ${yTop + heightPerTask - heightPerTask / 1.75})`}>
                    {Array.from({ length: hyperperiod + 1 }).map((_, t) => {
                        const x = t * pxPerStep;
                        const showLabel = t % timeStepLabelEvery === 0;
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

                    {/* small marker on the left */}
                    <circle cx={leftLabelWidth - 18} cy={centerY - 10} r={4} fill={task.color ?? "#60a5fa"} />
                    {/* --- EDF Schedule Blocks --- */}
                {schedule
                  .filter((s) => s.taskId === task.id)
                  .map((s) => {
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

                {Array.from({ length: Math.ceil(hyperperiod / task.T) }, (_, k) => {
                  const releaseTime = k * task.T;
                  const deadlineTime = releaseTime + task.D;

                  const centerY = yTop + heightPerTask / 2;
                  const arrowLength = 12;
                  const offset = 0; // Abstand vom Task-Line

                  return (
                    <g key={`markers-${k}`}>
                      {/* Release-Pfeil nach oben (über der Linie) */}
                      <line
                        x1={leftLabelWidth + releaseTime * pxPerStep}
                        y1={centerY + arrowLength}
                        x2={leftLabelWidth + releaseTime * pxPerStep}
                        y2={centerY}
                        stroke="green"
                        strokeWidth={2}
                        markerEnd="url(#arrowUp)"
                      />

                      {/* Deadline-Pfeil nach unten */}
                      <line
                        x1={leftLabelWidth + deadlineTime * pxPerStep}
                        y1={centerY + offset}
                        x2={leftLabelWidth + deadlineTime * pxPerStep}
                        y2={centerY + offset + 15}
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
