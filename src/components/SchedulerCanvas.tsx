import type { Task } from "../core/task";

type Props = {
  tasks: Task[];
  hyperperiod: number;       // Gesamtzeit (z.B. 24)
  pxPerStep?: number;        // Pixel pro Zeiteinheit (z.B. 24)
  timeStepLabelEvery?: number; // wie oft ein Label (z.B. 1 => jedes Feld beschriften, 2 => jede 2.)
  heightPerTask?: number;    // Höhe pro Task-Zeile
  leftLabelWidth?: number;   // Platz links für Task-Label
};

export default function SchedulerCanvas({
  tasks,
  hyperperiod,
  pxPerStep = 28,
  timeStepLabelEvery = 1,
  heightPerTask = 125,
  leftLabelWidth = 72,
}: Props) {
  const svgWidth = leftLabelWidth + hyperperiod * pxPerStep + 40; // extra right padding
  const svgHeight = tasks.length * heightPerTask + 80; // bottom padding for axis
  const axisColor = "#0d2b6cff";
  const timeFontSize = 15;
  const labelFontSize = 18;

  return (
    <div className="w-full overflow-auto border rounded-md shadow-sm bg-white">
        <svg
        width={Math.min(svgWidth, 1200)}
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
                height={heightPerTask - 12 - 20} // Platz für mini-X-Achse
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
            </g>
            );
        })}
        </svg>



      {/* If svgWidth > displayed width, show hint */}
      <div className="text-xs text-gray-500 p-2">
        Tip: horizontales Scrollen möglich — Pixel pro Schritt: <span className="font-medium">{pxPerStep}</span>
      </div>
    </div>
  );
}
