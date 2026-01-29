// @ts-nocheck
import InteractiveSchedulerCanvas from "../../components/Scheduling/InteractiveSchedulerCanvas";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import type { CanvasRenderProps } from "./types";

/**
 * Default canvas renderer component
 * Handles both interactive and default canvas 
 */

interface CanvasRendererProps {
  canvasRenderProps: CanvasRenderProps;
  visibilityDefaultCanvas: {
    showReleaseMarkersDefault: boolean;
    showDeadlineMarkersDefault: boolean;
  };
}

export function CanvasRenderer({ canvasRenderProps, visibilityDefaultCanvas }: CanvasRendererProps) {
  const {
    tasks,
    hyperperiod,
    schedule,
    userScheduleRef,
    setUserScheduleRef,
    hintBlocks,
    visibility,
    highlight,
    highlightExecutions,
    pxPerStep,
    heightPerTask,
    leftLabelWidth,
    canvasMode,
  } = canvasRenderProps;

  return (
    <>
      {canvasMode === "interactive" ? (
        <InteractiveSchedulerCanvas
          tasks={tasks}
          hyperperiod={hyperperiod}
          schedule={schedule}
          userScheduleRef={userScheduleRef}
          setUserScheduleRef={setUserScheduleRef}
          hintBlocks={hintBlocks}
          visibility={visibility}
          highlight={highlight}
          highlightExecutions={highlightExecutions}
          pxPerStep={pxPerStep}
          heightPerTask={heightPerTask}
          leftLabelWidth={leftLabelWidth}
        />
      ) : (
        <SchedulerCanvas
          tasks={tasks}
          hyperperiod={hyperperiod}
          schedule={schedule}
          pxPerStep={pxPerStep}
          leftLabelWidth={leftLabelWidth}
          visibility={{
            showTaskLabels: true,
            showXAxis: true,
            showExecutionBlocks: true,
            showReleaseMarkers: visibilityDefaultCanvas.showReleaseMarkersDefault,
            showDeadlineMarkers: visibilityDefaultCanvas.showDeadlineMarkersDefault,
          }}
          highlight={highlight}
          highlightExecutions={highlightExecutions}
        />
      )}
    </>
  );
}
