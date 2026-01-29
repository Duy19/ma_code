// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHints } from "../logic/HintManager";
import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";

// Import components and functions for logic
import { useTutorialState } from "./ModularTutorial/useTutorialState";
import { LayoutManager } from "./ModularTutorial/LayoutManager";
import { 
  handleCheck, 
  handleRetry, 
  handleNextStep, 
  handleToggleHint 
} from "./ModularTutorial/handlers";
import type { 
  ModularTutorialTemplateProps,
  CanvasRenderProps,
  SidebarRenderProps,
  ButtonsRenderProps,
} from "./ModularTutorial/types";


export type {
  HintType,
  HintConfig,
  StoryState,
  StoryStep,
  OverlayRenderProps,
  CanvasRenderProps,
  SidebarRenderProps,
  ButtonsRenderProps,
  DefinitionsRenderProps,
  ModularTutorialTemplateProps,
} from "./ModularTutorial/types";

/*
This Template allows flexible page building for the Scheduling Puzzle Website.
The main components consist of Story Elements (text, highlighting, overrides), 
Layout (standard, interactive), Core Logic (Tasks, Algorithms, Hints, Checking), 
and UI Modules (Canvas, Sidebar, Buttons).

ARCHITECTURE:
- types.ts: All type definitions
- useTutorialState.ts: State management and patching logic
- handlers.ts: Event handlers (check, retry, navigation)
- CanvasRenderer.tsx: Canvas rendering (default and interactive)
- SidebarRenderer.tsx: Sidebar rendering
- ButtonsRenderer.tsx: Buttons rendering (check buttons, navigation)
- QuizRenderer.tsx: Quiz rendering
- DropGameRenderer.tsx: Drag&Drop game rendering
- LayoutManager.tsx: Layout management
*/

export function ModularTutorialTemplate(props: ModularTutorialTemplateProps) {
  const {
    baseTasks,
    story,
    hyperperiod,
    algorithm,
    algorithms,
    defaultAlgorithm,
    algorithmName,
    hintConfig = [],
    showOverlay = true,
    showHintCheckboxes = true,
    showSidebar = true,
    showButtons = true,
    canvasMode = "interactive",
    renderOverlay,
    renderCompanion,
    renderCanvas,
    renderSidebar,
    renderButtons,
    renderDefinitions,
    layoutStyle = "standard",
    overlayPosition = "top-left",
    canvasProps = {},
    sidebarVisibleFields = ["executionTime", "periods", "deadlines", "algorithmSelection"],
    sidebarEditableFields = [],
    onTasksChange,
    showDefinitions = false,
    definitions = [],
    definitionsTitle = "Definitions",
    showSummary = false,
    summaryDescriptionVariant = 'body1',
    summaryContentVariant = 'body1',
    showDropGame = false,
    dropGameVaultIds = [],
    onSuccess,
  } = props;

  // Current state
  const [definitionsCollapsed, setDefinitionsCollapsed] = useState(false);
  const [userScheduleRef, setUserScheduleRef] = useState<Record<string, Set<number>>>({});
  const [step, setStep] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [wcrtCorrect, setWcrtCorrect] = useState(false);
  const [scheduleCorrect, setScheduleCorrect] = useState(false);
  const [customCheckCorrect, setCustomCheckCorrect] = useState(false);
  const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState<string | undefined>(undefined);
  const [userManuallyChangedAlgorithm, setUserManuallyChangedAlgorithm] = useState(false);
  const [userInputTasks, setUserInputTasks] = useState<Task[] | undefined>(undefined);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [dropGameCompleted, setDropGameCompleted] = useState(false);

  const [visibility, setVisibility] = useState({
    showReleaseMarkers: false,
    showDeadlineMarkers: false,
  });

  const [visibilityDefaultCanvas, setVisibilityDefaultCanvas] = useState({
    showReleaseMarkersDefault: true,
    showDeadlineMarkersDefault: true,
  });

  const navigate = useNavigate();

  // Tutorial state hook which managages cumulative state based on story steps
  const cumulativeState = useTutorialState({
    baseTasks,
    story,
    step,
    hyperperiod,
    defaultAlgorithm,
    showOverlay,
    showHintCheckboxes,
    showSidebar,
    showButtons,
    showDefinitions,
    canvasMode,
    layoutStyle,
    sidebarVisibleFields,
    sidebarEditableFields,
    showSummary,
    userSelectedAlgorithm,
    userInputTasks,
    userManuallyChangedAlgorithm,
  });

  const currentStep = story[step];
  const currentTasks = cumulativeState.tasks;
  
  // Setup algorithms for selection
  const algorithmMap = algorithms || (algorithm ? { [algorithm.name.replace(/^simulate/, "") || "Default"]: algorithm } : {});

  const effectiveAlgorithmName = cumulativeState.selectedAlgorithm ?? defaultAlgorithm;
  const currentAlgorithmFunc = algorithmMap[effectiveAlgorithmName];
  
  // Get visible tasks (for canvas display only) 
  const visibleTasks = useMemo(() => {
    return currentTasks.filter(task => !cumulativeState.hiddenTasks.includes(task.id));
  }, [currentTasks, cumulativeState.hiddenTasks]);
  
  // Calculates the correct schedule based on current tasks and selected algorithm
  const correctSchedule = useMemo(() => {
    if (!currentAlgorithmFunc) return [];
    return currentAlgorithmFunc(currentTasks, cumulativeState.hyperperiod);
  }, [currentAlgorithmFunc, currentTasks, cumulativeState.hyperperiod]);

  // Derived state from cumulative state
  const effectiveShowOverlay = cumulativeState.showOverlay;
  const effectiveShowHintCheckboxes = cumulativeState.showHintCheckboxes;
  const effectiveShowSidebar = cumulativeState.showSidebar;
  const effectiveShowButtons = cumulativeState.showButtons;
  const effectiveShowDefinitions = cumulativeState.showDefinitions;
  const effectiveShowCanvas = cumulativeState.showCanvas;
  const effectiveSidebarVisibleFields = cumulativeState.sidebarVisibleFields;
  const effectiveSidebarEditableFields = cumulativeState.sidebarEditableFields;
  const effectiveCanvasMode = cumulativeState.canvasMode;
  const effectiveLayoutStyle = cumulativeState.layoutStyle;

  // Hint Manager
  const { hints, unlockHint, lockHint, setHintTask, getHintBlocks } = useHints({
    baseTasks,
    correctSchedule,
    failedCount,
    hintConfig,
  });

  const hintBlocks = getHintBlocks;

  // Prepare correctSchedule map using all current tasks for lookup
  const correctScheduleMap = useMemo(() => {
    const map: Record<string, Set<number>> = {};
    currentTasks.forEach((task) => {
      map[task.id] = new Set(
        correctSchedule
          .filter((e) => e.taskId === task.id)
          .map((e) => e.time)
      );
    });
    return map;
  }, [correctSchedule, currentTasks]);

  // Set which task to show for fullExecution hint
  useEffect(() => {
    const execHint = hints.find((h) => h.type === "fullExecution");
    if (execHint && !execHint.taskId) setHintTask(execHint.id, "media");
  }, [hints]);

  // Reset quiz when step changes or showQuiz becomes false
  useEffect(() => {
    setCurrentQuizQuestion(0);
    setQuizCompleted(false);
  }, [step, cumulativeState.showQuiz]);

  useEffect(() => {
    setDropGameCompleted(false);
  }, [step, cumulativeState.showDropGame]);

  // Handlers
  const onCheck = () => {
    handleCheck({
      currentStep,
      currentTasks,
      baseTasks,
      visibleTasks,
      userScheduleRef,
      correctScheduleMap,
      correctSchedule,
      cumulativeState,
      setWcrtCorrect,
      setScheduleCorrect,
      setCustomCheckCorrect,
      setFailedCount,
      effectiveCanvasMode,
    });
  };

  const onRetry = () => {
    handleRetry({
      setUserScheduleRef,
      setUserInputTasks,
      setUserSelectedAlgorithm,
      setUserManuallyChangedAlgorithm,
      setStep,
      setFailedCount,
      setWcrtCorrect,
      setScheduleCorrect,
      setCustomCheckCorrect,
      hints,
      lockHint,
    });
  };

  const onNextStep = (overrideQuizCompleted?: boolean, overrideDropGameCompleted?: boolean) => {
    handleNextStep(
      {
        currentStep,
        userSelectedAlgorithm,
        failedCount,
        wcrtCorrect,
        scheduleCorrect,
        customCheckCorrect,
        quizCompleted,
        dropGameCompleted,
        navigate,
        setStep,
        storyLength: story.length,
      },
      overrideQuizCompleted,
      overrideDropGameCompleted
    );
  };

  const onPreviousStep = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const isHintAllowed = (hintId: string) => {
    const hint = hints.find((h) => h.id === hintId);
    return hint ? failedCount >= hint.unlockAt : false;
  };

  const onToggleHint = (hintId: string, enabled: boolean) => {
    handleToggleHint({
      hintId,
      enabled,
      hints,
      currentTasks,
      setVisibility,
      unlockHint,
      lockHint,
      setHintTask,
    });
  };

  const onTasksChangeHandler = (newTasks: Task[]) => {
    setUserInputTasks(newTasks);
    onTasksChange?.(newTasks);
  };

  const onAlgorithmChangeHandler = (newAlgorithm: string) => {
    setUserSelectedAlgorithm(newAlgorithm);
    setUserManuallyChangedAlgorithm(true);
  };

  const onSuccessHandler = onSuccess || (() => {
    if (currentStep?.navigateTo) {
      navigate(currentStep.navigateTo);
    } else if (step < story.length - 1) {
      setStep((s) => s + 1);
      setWcrtCorrect(false);
      setScheduleCorrect(false);
      setCustomCheckCorrect(false);
      setUserScheduleRef({});
    } else {
      navigate("/");
    }
  });

  // Prepare render props
  const pxPerStep = canvasProps.pxPerStep ?? 30;
  const heightPerTask = canvasProps.heightPerTask ?? 130;
  const leftLabelWidth = canvasProps.leftLabelWidth ?? 140;

  const canvasRenderProps: CanvasRenderProps = {
    tasks: visibleTasks,
    hyperperiod,
    schedule: correctSchedule,
    userScheduleRef,
    setUserScheduleRef,
    hintBlocks,
    visibility,
    highlight: cumulativeState.highlight,
    highlightExecutions: cumulativeState.highlightExecutions,
    pxPerStep,
    heightPerTask,
    leftLabelWidth,
    canvasMode: effectiveCanvasMode
  };

  const sidebarRenderProps: SidebarRenderProps = {
    baseTasks,
    algorithm: effectiveAlgorithmName,
  };

  const buttonsRenderProps: ButtonsRenderProps = {
    onCheck,
    onRetry,
    wcrtCorrect,
    scheduleCorrect,
    customCheckCorrect,
    onSuccess: onSuccessHandler,
  };

  const quizRendererProps = {
    userScheduleRef,
    setUserScheduleRef,
    hintBlocks,
    visibility,
    visibilityDefaultCanvas,
    canvasProps,
    algorithmMap,
    effectiveAlgorithmName,
    correctSchedule,
  };

  return (
    <LayoutManager
      cumulativeState={cumulativeState}
      currentStep={currentStep}
      step={step}
      storyLength={story.length}
      onPreviousStep={onPreviousStep}
      onNextStep={onNextStep}
      canvasRenderProps={canvasRenderProps}
      sidebarRenderProps={sidebarRenderProps}
      buttonsRenderProps={buttonsRenderProps}
      renderOverlay={renderOverlay}
      renderCanvas={renderCanvas}
      renderSidebar={renderSidebar}
      renderButtons={renderButtons}
      renderDefinitions={renderDefinitions}
      hints={hints}
      isHintAllowed={isHintAllowed}
      onToggleHint={onToggleHint}
      definitions={definitions}
      definitionsTitle={definitionsTitle}
      onDefinitionsCollapsedChange={setDefinitionsCollapsed}
      summaryDescriptionVariant={summaryDescriptionVariant}
      summaryContentVariant={summaryContentVariant}
      currentTasks={currentTasks}
      effectiveSidebarVisibleFields={effectiveSidebarVisibleFields}
      effectiveSidebarEditableFields={effectiveSidebarEditableFields}
      onTasksChange={onTasksChangeHandler}
      onAlgorithmChange={onAlgorithmChangeHandler}
      currentQuizQuestion={currentQuizQuestion}
      onQuizQuestionChange={setCurrentQuizQuestion}
      onQuizComplete={() => setQuizCompleted(true)}
      quizRendererProps={quizRendererProps}
      onDropGameComplete={() => setDropGameCompleted(true)}
      visibilityDefaultCanvas={visibilityDefaultCanvas}
    />
  );
}
