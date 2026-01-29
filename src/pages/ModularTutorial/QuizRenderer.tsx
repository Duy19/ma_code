// @ts-nocheck
import QuizMaster from "../../components/Quiz/QuizMaster";
import quizQuestions from "../../components/Quiz/questions";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import type { StoryState, CanvasRenderProps } from "./types";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";

/**
 * Quiz renderer component
 * Handles quiz question display and progression
 */

interface QuizRendererProps {
  cumulativeState: StoryState;
  currentQuizQuestion: number;
  onQuizQuestionChange: (questionIndex: number) => void;
  onQuizComplete: () => void;
  onNextStep: (overrideQuizCompleted?: boolean) => void;
  // Canvas rendering props
  userScheduleRef: Record<string, Set<number>>;
  setUserScheduleRef: (ref: Record<string, Set<number>>) => void;
  hintBlocks: Record<string, Set<number>>;
  visibility: { showReleaseMarkers: boolean; showDeadlineMarkers: boolean };
  visibilityDefaultCanvas: {
    showReleaseMarkersDefault: boolean;
    showDeadlineMarkersDefault: boolean;
  };
  canvasProps: any;
  algorithmMap: Record<string, (tasks: Task[], hyperperiod: number) => ScheduleEntry[]>;
  effectiveAlgorithmName: string;
  correctSchedule: ScheduleEntry[];
}

export function QuizRenderer({
  cumulativeState,
  currentQuizQuestion,
  onQuizQuestionChange,
  onQuizComplete,
  onNextStep,
  userScheduleRef,
  setUserScheduleRef,
  hintBlocks,
  visibility,
  visibilityDefaultCanvas,
  canvasProps,
  algorithmMap,
  effectiveAlgorithmName,
  correctSchedule,
}: QuizRendererProps) {
  
  if (!cumulativeState.showQuiz || cumulativeState.quizQuestionIds.length === 0) {
    return null;
  }

  // Get the questions for the quiz based on IDs
  const selectedQuestions = cumulativeState.quizQuestionIds
    .map((id) => quizQuestions.find((q) => q.id === id))
    .filter((q) => q !== undefined);

  if (selectedQuestions.length === 0 || currentQuizQuestion >= selectedQuestions.length) {
    return null;
  }

  const currentQuestion = selectedQuestions[currentQuizQuestion];
  if (!currentQuestion) return null;

  // Function to render canvas for quiz questions
  const renderQuizCanvas = (tasks: Task[], canvasMode: "interactive" | "default", hyperperiod: number, algorithm?: string) => {
    // Use the specified algorithm or fall back to the current one
    const algorithmToUse = algorithm || effectiveAlgorithmName;
    const algorithmFunc = algorithmMap[algorithmToUse];
    const scheduleToUse = algorithmFunc ? algorithmFunc(tasks, hyperperiod) : correctSchedule;

    const canvasRenderProps: CanvasRenderProps = {
      tasks: tasks.filter(task => !cumulativeState.hiddenTasks.includes(task.id)),
      hyperperiod: hyperperiod || cumulativeState.hyperperiod,
      schedule: scheduleToUse,
      userScheduleRef,
      setUserScheduleRef,
      hintBlocks,
      visibility,
      pxPerStep: canvasProps.pxPerStep ?? 30,
      heightPerTask: canvasProps.heightPerTask ?? 130,
      leftLabelWidth: canvasProps.leftLabelWidth ?? 140,
      canvasMode: "default" // Quiz should only use default canvas
    };

    return (
      <SchedulerCanvas
        tasks={canvasRenderProps.tasks}
        hyperperiod={canvasRenderProps.hyperperiod}
        schedule={canvasRenderProps.schedule}
        pxPerStep={canvasRenderProps.pxPerStep}
        leftLabelWidth={canvasRenderProps.leftLabelWidth}
        visibility={{
          showTaskLabels: true,
          showXAxis: true,
          showExecutionBlocks: true,
          showReleaseMarkers: visibilityDefaultCanvas.showReleaseMarkersDefault,
          showDeadlineMarkers: visibilityDefaultCanvas.showDeadlineMarkersDefault,
        }}
      />
    );
  };

  return (
    <QuizMaster
      question={currentQuestion}
      onAnswer={(answerId, isCorrect) => {
        // Answer is submitted, quiz handles feedback display
      }}
      onNext={() => {
        if (currentQuizQuestion < selectedQuestions.length - 1) {
          onQuizQuestionChange(currentQuizQuestion + 1);
        } else {
          // On the last question, mark quiz as completed and advance to next story step
          onQuizComplete();
          onNextStep(true);
        }
      }}
      onRetry={() => {
        // Reset quiz to first question
        onQuizQuestionChange(0);
      }}
      isLastQuestion={currentQuizQuestion === selectedQuestions.length - 1}
      showExplanation={true}
      renderCanvas={renderQuizCanvas}
    />
  );
}
