// @ts-nocheck
import { useState, useEffect, useMemo, ReactNode, use } from "react";
import { useNavigate } from "react-router-dom";
import SchedulerCanvas from "../components/Scheduling/SchedulerCanvas";
import InteractiveSchedulerCanvas from "../components/Scheduling/InteractiveSchedulerCanvas";
import TutorialOverlay from "../components/tutorial/TutorialOverlay";
import HintCheckboxes from "../components/General/HintCheckboxes";
import FreeSchedulerSidebar from "../components/Scheduling/FreeSchedulerSidebar";
import DefinitionsBox, { type Definition } from "../components/General/DefinitionsBox";
import { SummaryContent } from "../components/Summary/summary";
import QuizMaster, { type QuizQuestion } from "../components/Quiz/QuizMaster";
import quizQuestions from "../components/Quiz/questions";
import DropMaster from "../components/DragDrop/DropMaster";
import { DropMasterVault } from "../components/DragDrop/dropGame";
import { Button, Stack } from "@mui/material";
import { useHints } from "../logic/HintManager";
import type { Task } from "../core/task";
import type { ScheduleEntry } from "../logic/simulator";
import { computeWCRT } from "../logic/simulator";

/*
This Template should allow flexible page building for the Scheduling Puzzle Website,
just using some configurations and framework code. 
The main components consists of Story Elements (text, highlighting, overrides), Layout (standard, interacvtive),
Core Logic (Tasks, Algorithms, Hints, Checking) and UI Modules (Canvas, Sidebar, Buttons).
*/


export type HintType = "releaseMarker" | "deadlineMarker" | "fullExecution";

export interface HintConfig {
  type: HintType;
  unlockAt: number;
}

/*
StoryState = The accumulated state of the page as it progresses through steps.
This includes all UI visibility, sidebar configuration, canvas settings, etc.
It starts with the initial props and is patched by each StoryStep.
*/

export interface StoryState {
  // Tasks and algorithms
  tasks: Task[];
  selectedAlgorithm: string | undefined;
  hiddenTasks: string[]; // Array of task IDs to hide from canvas
  hyperperiod: number;
  
  // Visibility
  showOverlay: boolean;
  showHintCheckboxes: boolean;
  showSidebar: boolean;
  showButtons: boolean;
  showDefinitions: boolean;
  showCanvas: boolean; // Toggle canvas visibility
  showQuiz: boolean; // Toggle quiz visibility
  quizQuestionIds: string[]; // Array of question IDs to display in quiz
  showSummary: boolean; // Toggle summary visibility
  summaryIds: string[]; // Array of summary IDs to display
  showDropGame: boolean; // Toggle drop game visibility
  dropGameVaultIds: string[]; // Array of vault IDs to use in drop game
  // Canvas configuration
  canvasMode: "interactive" | "default";
  layoutStyle: "standard" | "interactive";
  
  // Sidebar configuration
  sidebarVisibleFields: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  sidebarEditableFields: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  // Task IDs that can be edited - if empty, all tasks can be edited
  editableTasks: string[];
  // Maximum values for sidebar fields
  maxFieldValues: {
    executionTime?: number;
    periods?: number;
    deadlines?: number;
    offsets?: number;
    suspension?: number;
  };
  
  // Highlight
  highlight?: string | null;
  highlightExecutions?: Array<{ taskId: string; steps: number[] }>;
  
  // Additional renderComponent (car scene, images, diagrams, etc.)
  renderComponent?: (props: OverlayRenderProps) => ReactNode;
  
  // Custom check function for this step
  checkFunction?: (state: {
    userScheduleRef: Record<string, Set<number>>;
    inputTasks: Task[];
    correctSchedule: ScheduleEntry[];
    baseTasks: Task[];
    visibleTasks: Task[];
    canvasMode: "interactive" | "default";
  }) => boolean;
}

/*
StoryStep = A step/state of the Tutorials and Chapters. They are build progressivley like a picture book or games
telling a story. After rendering the entry state of the page with the template, you can freely configure the page, 
adding/removing/changing modules (Sidebar, Canvas), UI, highlights, tasksets, algorithms, visibility, ...
*/

export interface StoryStep {
  text: string;
  
  // State patches - only include what you want to change from previous step
  tasks?: Task[];
  selectedAlgorithm?: string;
  hiddenTasks?: string[]; // Task IDs to hide from canvas
  hyperperiod?: number; // Hyperperiod for schedule calculation
  
  // Visibility patches (undefined = no change from previous step)
  showOverlay?: boolean;
  showHintCheckboxes?: boolean;
  showSidebar?: boolean;
  showButtons?: boolean;
  showDefinitions?: boolean;
  showCanvas?: boolean;
  showQuiz?: boolean; // Toggle quiz visibility
  quizQuestionIds?: string[]; // Question IDs to display in quiz
  showSummary?: boolean; // Toggle summary visibility
  summaryIds?: string[]; // Summary IDs to display
  dropGameVaultIds?: string[]; // Vault IDs to use in drop game
  showDropGame?: boolean; // Toggle drop game visibility
  // Canvas patches
  canvasMode?: "interactive" | "default";
  layoutStyle?: "standard" | "interactive";
  
  // Sidebar patches
  sidebarVisibleFields?: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  sidebarEditableFields?: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  editableTasks?: string[]; // Task IDs that can be edited in this step
  maxFieldValues?: { // Maximum values for sidebar fields (e.g., {offsets: 12, executionTime: 5})
    executionTime?: number;
    periods?: number;
    deadlines?: number;
    offsets?: number;
    suspension?: number;
  };
  
  // Highlight patches
  highlight?: string | null;
  highlightExecutions?: Array<{ taskId: string; steps: number[] }>;
  
  // Custom render companion patch
  renderCompanion?: (props: OverlayRenderProps) => ReactNode;
  
  // Custom check function for this step - flexible checking based on canvas mode or task properties
  checkFunction?: (state: {
    userScheduleRef: Record<string, Set<number>>;
    inputTasks: Task[];
    correctSchedule: ScheduleEntry[];
    baseTasks: Task[];
    visibleTasks: Task[];
    canvasMode: "interactive" | "default";
  }) => boolean;
  
  // WCRT (Worst-Case Response Time) check - for fixed-priority scheduling analysis
  // If wcrtTaskId is specified, the check will compute the actual WCRT for that task
  // based on the current task offsets and verify it matches the expected WCRT (computed from baseTasks)
  wcrtTaskId?: string;
  
  // Navigation and conditions
  navigateTo?: string;
  waitFor?: (state: {
    selectedAlgorithm: string | undefined;
    failedCount: number;
    wcrtCorrect: boolean;
    scheduleCorrect: boolean;
    customCheckCorrect: boolean;
    quizCompleted: boolean;
    dropGameCompleted: boolean;
  }) => boolean;
}

interface ModularTutorialTemplateProps {
  story: StoryStep[];
  baseTasks: Task[];
  hyperperiod: number;
  algorithm?: (tasks: Task[], hyperperiod: number) => ScheduleEntry[];
  algorithms?: Record<string, (tasks: Task[], hyperperiod: number) => ScheduleEntry[]>;
  defaultAlgorithm?: string;
  algorithmName?: string;
  hintConfig?: HintConfig[];

  // Layout sections
  showOverlay?: boolean;
  showHintCheckboxes?: boolean;
  showSidebar?: boolean;
  showButtons?: boolean;
  canvasMode?: "interactive" | "default";

  // Custom render functions for flexibility
  renderOverlay?: (props: OverlayRenderProps) => ReactNode;
  renderCompanion?: (props: OverlayRenderProps) => ReactNode; // Render content alongside Mr. Tau (car scene, images, etc.)
  renderCanvas?: (props: CanvasRenderProps) => ReactNode;
  renderSidebar?: (props: SidebarRenderProps) => ReactNode;
  renderButtons?: (props: ButtonsRenderProps) => ReactNode;
  renderDefinitions?: (props: DefinitionsRenderProps) => ReactNode;

  // Layout customization
  layoutStyle?: "standard" | "interactive";
  overlayPosition?: "top-left" | "top-center" | "left";
  canvasProps?: Partial<{
    pxPerStep: number;
    heightPerTask: number;
    leftLabelWidth: number;
  }>;

  // Sidebar control
  sidebarVisibleFields?: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  sidebarEditableFields?: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  onTasksChange?: (tasks: Task[]) => void;

  // Definitions box
  showDefinitions?: boolean;
  definitions?: Definition[];
  definitionsTitle?: string;

  // Summary box
  showSummary?: boolean;
  showDropGame?: boolean;
  dropGameVaultIds?: string[];
  summaryDescriptionVariant?: 'body1' | 'body2' | 'h6' | 'h5' | 'h4';
  summaryContentVariant?: 'body1' | 'body2' | 'h6' | 'h5' | 'h4';

  // Callbacks
  onSuccess?: () => void;
}

export interface OverlayRenderProps {
  text: string;
  onNext: () => void;
  step: number;
  totalSteps: number;
}

export interface CanvasRenderProps {
  tasks: Task[];
  hyperperiod: number;
  schedule: ScheduleEntry[];
  userScheduleRef: Record<string, Set<number>>;
  setUserScheduleRef: (ref: Record<string, Set<number>>) => void;
  hintBlocks: Record<string, Set<number>>;
  visibility: { showReleaseMarkers: boolean; showDeadlineMarkers: boolean };
  highlight?: string | null;
  highlightExecutions?: Array<{ taskId: string; steps: number[] }>;
  pxPerStep: number;
  heightPerTask: number;
  leftLabelWidth: number;
  canvasMode: "interactive" | "default";
}

export interface DefinitionsRenderProps {
  definitions?: Definition[];
}

export interface SidebarRenderProps {
  baseTasks: Task[];
  algorithm: string;
}

export interface ButtonsRenderProps {
  onCheck: () => void;
  onRetry: () => void;
  wcrtCorrect: boolean;
  scheduleCorrect: boolean;
  customCheckCorrect: boolean;
  onSuccess: () => void;
}

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

  // Create initial state from props
  const createInitialState = (): StoryState => ({
    tasks: baseTasks,
    selectedAlgorithm: defaultAlgorithm,
    hiddenTasks: [],
    hyperperiod,
    showOverlay,
    showHintCheckboxes,
    showSidebar,
    showButtons,
    showDefinitions,
    showCanvas: true,
    showQuiz: false,
    showDropGame: false,
    dropGameVaultIds: [],
    quizQuestionIds: [],
    showSummary,
    summaryIds: [],
    canvasMode,
    layoutStyle,
    sidebarVisibleFields,
    sidebarEditableFields,
    editableTasks: [],
    maxFieldValues: {},
    highlight: undefined,
    highlightExecutions: undefined,
    checkFunction: undefined,
  });

  // Compute cumulative state by applying all patches from first step to current step
  const cumulativeState = useMemo(() => {
    let state = createInitialState();
    
    // Apply patches from each step up to the current one
    for (let i = 0; i <= step && i < story.length; i++) {
      const stepPatch = story[i];
      
      if (stepPatch.tasks !== undefined) state.tasks = stepPatch.tasks;
      if (stepPatch.selectedAlgorithm !== undefined) state.selectedAlgorithm = stepPatch.selectedAlgorithm;
      if (stepPatch.hiddenTasks !== undefined) state.hiddenTasks = stepPatch.hiddenTasks;
      if (stepPatch.hyperperiod !== undefined) state.hyperperiod = stepPatch.hyperperiod;
      if (stepPatch.showOverlay !== undefined) state.showOverlay = stepPatch.showOverlay;
      if (stepPatch.showHintCheckboxes !== undefined) state.showHintCheckboxes = stepPatch.showHintCheckboxes;
      if (stepPatch.showSidebar !== undefined) state.showSidebar = stepPatch.showSidebar;
      if (stepPatch.showButtons !== undefined) state.showButtons = stepPatch.showButtons;
      if (stepPatch.showDefinitions !== undefined) state.showDefinitions = stepPatch.showDefinitions;
      if (stepPatch.showCanvas !== undefined) state.showCanvas = stepPatch.showCanvas;
      if (stepPatch.showQuiz !== undefined) state.showQuiz = stepPatch.showQuiz;
      if (stepPatch.quizQuestionIds !== undefined) state.quizQuestionIds = stepPatch.quizQuestionIds;
      if (stepPatch.showSummary !== undefined) state.showSummary = stepPatch.showSummary;
      if (stepPatch.summaryIds !== undefined) state.summaryIds = stepPatch.summaryIds;
      if (stepPatch.showDropGame !== undefined) state.showDropGame = stepPatch.showDropGame;
      if (stepPatch.dropGameVaultIds !== undefined) state.dropGameVaultIds = stepPatch.dropGameVaultIds;
      if (stepPatch.canvasMode !== undefined) state.canvasMode = stepPatch.canvasMode;
      if (stepPatch.layoutStyle !== undefined) state.layoutStyle = stepPatch.layoutStyle;
      if (stepPatch.sidebarVisibleFields !== undefined) state.sidebarVisibleFields = stepPatch.sidebarVisibleFields;
      if (stepPatch.sidebarEditableFields !== undefined) state.sidebarEditableFields = stepPatch.sidebarEditableFields;
      if (stepPatch.editableTasks !== undefined) state.editableTasks = stepPatch.editableTasks;
      if (stepPatch.maxFieldValues !== undefined) state.maxFieldValues = stepPatch.maxFieldValues;
      if (stepPatch.highlight !== undefined) state.highlight = stepPatch.highlight;
      if (stepPatch.highlightExecutions !== undefined) state.highlightExecutions = stepPatch.highlightExecutions;
      if ("renderCompanion" in stepPatch) state.renderCompanion = stepPatch.renderCompanion;
      if (stepPatch.checkFunction !== undefined) state.checkFunction = stepPatch.checkFunction;
    }
    
    // Prioritize applying user-edits persistently: always use user input if it has been set
    // This allows edits to persist even after the field becomes non-editable
    if (userInputTasks !== undefined) {
      state.tasks = userInputTasks;
    }
    
    // Only override with user selection if user manually changed it
    // This allows story steps to control the algorithm until the user intervenes
    if (userManuallyChangedAlgorithm && userSelectedAlgorithm !== undefined) {
      state.selectedAlgorithm = userSelectedAlgorithm;
    }
    
    return state;
  }, [step, story, baseTasks, defaultAlgorithm, showOverlay, showHintCheckboxes, showSidebar, showButtons, showDefinitions, canvasMode, layoutStyle, sidebarVisibleFields, sidebarEditableFields, userSelectedAlgorithm, userInputTasks, userManuallyChangedAlgorithm]);

  const currentStep = story[step];
  const currentTasks = cumulativeState.tasks;
  
  // Setup algorithms - support both single algorithm and multiple algorithms
  const algorithmMap = algorithms || (algorithm ? { [algorithm.name.replace(/^simulate/, "") || "Default"]: algorithm } : {});

  const effectiveAlgorithmName = cumulativeState.selectedAlgorithm ?? defaultAlgorithm;
  const currentAlgorithmFunc = algorithmMap[effectiveAlgorithmName];
  const navigate = useNavigate();
  
  // Get visible tasks (for canvas display only) - but schedule uses ALL tasks
  const visibleTasks = useMemo(() => {
    return currentTasks.filter(task => !cumulativeState.hiddenTasks.includes(task.id));
  }, [currentTasks, cumulativeState.hiddenTasks]);
  
  const correctSchedule = useMemo(() => {
    if (!currentAlgorithmFunc) return [];
    // Use ALL tasks for schedule calculation, not just visible ones
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

  const [visibility, setVisibility] = useState({
    showReleaseMarkers: false,
    showDeadlineMarkers: false,
  });

  const [visibilityDefaultCanvas, setVisibilityDefaultCanvas] = useState({
    showReleaseMarkersDefault: true,
    showDeadlineMarkersDefault: true,
  });
  // Prepare correctSchedule map using ALL tasks
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

  const handleCheck = () => {
    // Check if this step requires WCRT validation
    if (currentStep?.wcrtTaskId) {
      const targetTask = currentTasks.find((t) => t.id === currentStep.wcrtTaskId);
      if (!targetTask) {
        alert("❌ Task not found for WCRT check");
        setFailedCount((fc) => fc + 1);
        return;
      }

      // Compute theoretical WCRT from base tasks
      const baseTask = baseTasks.find((t) => t.id === currentStep.wcrtTaskId);
      if (!baseTask) {
        alert("❌ Task not found in base tasks for WCRT check");
        setFailedCount((fc) => fc + 1);
        return;
      }
      const baseHigherPrio = baseTasks.filter((t) => t.T < baseTask.T);
      const theoreticalWCRT = computeWCRT(baseTask, baseHigherPrio);

      // Find actual WCRT by examining the schedule for each release
      // Get all execution times for this task from the current schedule
      const taskExecutions = correctScheduleMap[targetTask.id] ?? new Set();
      let maxActualRT = 0;

      // Check each release of the target task within the hyperperiod
      for (let k = 0; k * targetTask.T + (targetTask.O ?? 0) < cumulativeState.hyperperiod; k++) {
        const releaseTime = (targetTask.O ?? 0) + k * targetTask.T;
        const nextReleaseTime = releaseTime + targetTask.T;
        
        // Find when this specific job finishes by looking at the schedule between its release and the next release
        let finishTime = releaseTime;
        
        for (let t = releaseTime; t < nextReleaseTime && t < cumulativeState.hyperperiod; t++) {
          if (taskExecutions.has(t)) {
            finishTime = t + 1;
          }
        }
        
        // Response time = finish time - release time
        const responseTime = finishTime - releaseTime;
        maxActualRT = Math.max(maxActualRT, responseTime);
      }
      
      const ok = maxActualRT === theoreticalWCRT;
      setWcrtCorrect(ok);
      if (!ok) {
        alert(`❌ Nicht ganz. Finde die WCRT vom ${targetTask.name} Task!\nAktuelle WCRT: ${maxActualRT}\nKorrekte WCRT: ${theoreticalWCRT}`);
        setFailedCount((fc) => fc + 1);
      } else {
        alert(`✅ Super! Du hast die WCRT herausgefunden!\nWCRT: ${theoreticalWCRT}`);
      }
      return;
    }

    // Use custom check function if provided by the current step, otherwise use default
    let ok: boolean;
    
    if (cumulativeState.checkFunction) {
      ok = cumulativeState.checkFunction({
        userScheduleRef,
        inputTasks: currentTasks,
        correctSchedule,
        baseTasks,
        visibleTasks,
        canvasMode: effectiveCanvasMode,
      });
      setCustomCheckCorrect(ok);
    } else {
      // Default check: compare user schedule with correct schedule for ALL tasks
      ok = currentTasks.every((task) => {
        const user = userScheduleRef[task.id] ?? new Set();
        const correct = correctScheduleMap[task.id] ?? new Set();
        return user.size === correct.size && [...user].every((t) => correct.has(t));
      });
      setScheduleCorrect(ok);
    }

    if (ok) {
      alert("✅ Sehr gut! Deine Lösung ist richtig!");
    } else {
      alert("❌ Das ist leider nicht ganz richtig. Versuche es nochmal!");
      setFailedCount((fc) => fc + 1);
    }
  };

  const handleRetry = () => {
    setUserScheduleRef({});
    setUserInputTasks(undefined);
    setUserSelectedAlgorithm(undefined);
    setUserManuallyChangedAlgorithm(false);
    setStep(0);
    setFailedCount(0);
    setWcrtCorrect(false);
    setScheduleCorrect(false);
    setCustomCheckCorrect(false);
    hints.forEach((h) => lockHint(h.id));
  };

  const isHintAllowed = (hintId: string) => {
    const hint = hints.find((h) => h.id === hintId);
    return hint ? failedCount >= hint.unlockAt : false;
  };

  const handleToggleHint = (hintId: string, enabled: boolean) => {
    const hint = hints.find((h) => h.id === hintId);
    if (!hint) return;

    if (hint.type === "releaseMarker")
      setVisibility((v) => ({ ...v, showReleaseMarkers: enabled }));
    if (hint.type === "deadlineMarker")
      setVisibility((v) => ({ ...v, showDeadlineMarkers: enabled }));

    if (enabled) {
      if (!hint.taskId) {
        if (hint.type === "fullExecution") setHintTask(hint.id, "media");
        else currentTasks.forEach((t) => setHintTask(hint.id, t.id));
      }
      unlockHint(hintId);
    } else {
      lockHint(hintId);
    }
  };

  const handleNextStep = (overrideQuizCompleted?: boolean, overrideDropGameCompleted?: boolean) => {
    const currentStep = story[step];
    if (currentStep?.waitFor) {
      const ready = currentStep.waitFor({
        selectedAlgorithm: userSelectedAlgorithm,
        failedCount,
        wcrtCorrect,
        scheduleCorrect,
        customCheckCorrect,
        quizCompleted: overrideQuizCompleted ?? quizCompleted,
        dropGameCompleted: overrideDropGameCompleted ?? dropGameCompleted,
      });
      if (!ready) return;
    }

    if (currentStep?.navigateTo) {
      navigate(currentStep.navigateTo);
    } else {
      setStep((s) => Math.min(s + 1, story.length - 1));
    }
  };


  // Default canvas render
  const defaultCanvasRender = (canvasRenderProps: CanvasRenderProps) => {
    const {
      tasks: currentTasks,
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
            tasks={currentTasks}
            hyperperiod={cumulativeState.hyperperiod}
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
            tasks={currentTasks}
            hyperperiod={cumulativeState.hyperperiod}
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
  };

  // Default sidebar render
  const defaultSidebarRender = (sidebarRenderProps: SidebarRenderProps) => {
    const { baseTasks, algorithm } = sidebarRenderProps;
    
    const isFieldEditable = (task: Task, fieldName: string | keyof Task) => {
      // Convert fieldName to string for comparison
      const fieldStr = typeof fieldName === 'string' ? fieldName : String(fieldName);
      
      // Map user-friendly field names to Task properties
      const fieldMap: Record<string, string> = {
        "C": "executionTime",
        "T": "periods",
        "D": "deadlines",
        "O": "offsets",
        "S": "suspension",
      };
      
      // Get the user-friendly field name (e.g., "O" -> "offsets")
      const userFieldName = fieldMap[fieldStr] || fieldStr;
      
      // Field must be in editableFields
      if (!effectiveSidebarEditableFields.includes(userFieldName as any)) return false;
      // If editableTasks is empty, all tasks can be edited; otherwise only specified tasks
      if (cumulativeState.editableTasks.length === 0) return true;
      return cumulativeState.editableTasks.includes(task.id);
    };

    const isFieldVisible = (fieldName: string) => {
      return effectiveSidebarVisibleFields.includes(fieldName as any);
    };

    return (
      <FreeSchedulerSidebar
        tasks={currentTasks}
        onTasksChange={(newTasks) => {
          setUserInputTasks(newTasks);
          onTasksChange?.(newTasks);
        }}
        onAlgorithmChange={(newAlgorithm) => {
          setUserSelectedAlgorithm(newAlgorithm);
          setUserManuallyChangedAlgorithm(true);
        }}
        algorithm={sidebarRenderProps.algorithm}
        onClose={() => {}}
        visibility={{
          showExecutionTime: isFieldVisible("executionTime"),
          showPeriods: isFieldVisible("periods"),
          showDeadlines: isFieldVisible("deadlines"),
          showOffsets: isFieldVisible("offsets"),
          showSuspension: isFieldVisible("suspension"),
          showTaskControls: isFieldVisible("taskControls"),
          showTaskNames: true,
          showAlgorithmSelection: isFieldVisible("algorithmSelection"),
        }}
        isFieldEditable={isFieldEditable}
        maxExecution={cumulativeState.maxFieldValues.executionTime}
        maxPeriod={cumulativeState.maxFieldValues.periods}
        maxDeadline={cumulativeState.maxFieldValues.deadlines}
        maxOffset={cumulativeState.maxFieldValues.offsets}
        maxSuspension={cumulativeState.maxFieldValues.suspension}
        hyperperiod={cumulativeState.hyperperiod}
      />
    );
  };

  // Default drop game render
  const dropGameRender = () => {
    if (!cumulativeState.showDropGame || cumulativeState.dropGameVaultIds.length === 0) {
      return null;
    }

    return (
      <DropMaster
        vaultIds={cumulativeState.dropGameVaultIds}
        onComplete={() => {
          setDropGameCompleted(true);
        }}
      />
    );
  };

  // Default quiz render
  const quizRender = () => {
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
            setCurrentQuizQuestion((cq) => cq + 1);
          } else {
            // On the last question, mark quiz as completed and advance to next story step
            setQuizCompleted(true);
            handleNextStep(true);
          }
        }}
        onRetry={() => {
          // Reset quiz to first question
          setCurrentQuizQuestion(0);
        }}
        isLastQuestion={currentQuizQuestion === selectedQuestions.length - 1}
        showExplanation={true}
        renderCanvas={renderQuizCanvas}
      />
    );
  };

  // Default buttons render
  const defaultButtonsRender = (buttonsRenderProps: ButtonsRenderProps) => {
    const { onCheck, wcrtCorrect, scheduleCorrect, customCheckCorrect, onSuccess } = buttonsRenderProps;
    const anyCorrect = wcrtCorrect || scheduleCorrect || customCheckCorrect;
    return (
      <Stack p={2} spacing={2}>
        <Button variant="outlined" onClick={onCheck}>
          Check
        </Button>
        {anyCorrect && (
          <Button
            variant="outlined"
            sx={{ borderColor: "#2e7d32", color: "#2e7d32" }}
            onClick={onSuccess}
          >
            Continue
          </Button>
        )}
      </Stack>
    );
  };

  // Layout rendering
  const renderLayout = () => {
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
      onCheck: handleCheck,
      onRetry: handleRetry,
      wcrtCorrect,
      scheduleCorrect,
      customCheckCorrect,
      onSuccess: onSuccess || (() => {
        if (currentStep?.navigateTo) {
          navigate(currentStep.navigateTo);
        } else if (step < story.length - 1) {
          // Go to next step if available
          setStep((s) => s + 1);
          setWcrtCorrect(false); // Reset for next task
          setScheduleCorrect(false);
          setCustomCheckCorrect(false);
          setUserScheduleRef({}); // Clear schedule for next task
        } else {
          // Last step - go to home
          navigate("/");
        }
      }),
    };

    if (effectiveLayoutStyle === "standard") {
      return (
        <div style={{ display: "flex", height: "100%", flexDirection: "row" }}>
          {/* Left side: Canvas + Overlay + Definitions (80% width) */}
          <div style={{ flex: "0 0 80%", display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Overlay section */}
            {effectiveShowOverlay && (
              <div
                style={{
                  flex: "0 0 25%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  paddingLeft: 40,
                  paddingRight: 40,
                  paddingTop: 20,
                  gap: 40,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                  {renderOverlay ? (
                    renderOverlay({
                      text: currentStep?.text || "",
                      onNext: handleNextStep,
                      step,
                      totalSteps: story.length,
                    })
                  ) : (
                    <>
                      <TutorialOverlay
                        visible
                        text={currentStep?.text || ""}
                        onNext={handleNextStep}
                      />
                      {cumulativeState.renderCompanion && cumulativeState.renderCompanion({
                        text: currentStep?.text || "",
                        onNext: handleNextStep,
                        step,
                        totalSteps: story.length,
                      })}
                    </>
                  )}

                  {/* Hint checkboxes */}
                  {effectiveShowHintCheckboxes && (
                    <HintCheckboxes
                      hints={hints}
                      isHintAllowed={isHintAllowed}
                      onToggle={handleToggleHint}
                    />
                  )}
                </div>

                {/* Definitions box - positioned on the right */}
                {effectiveShowDefinitions && (
                  renderDefinitions ? (
                    renderDefinitions({ definitions })
                  ) : (
                    <DefinitionsBox
                      definitions={definitions}
                      title={definitionsTitle}
                      onCollapsedChange={setDefinitionsCollapsed}
                    />
                  )
                )}
              </div>
            )}

            {/* Canvas section */}
            {effectiveShowCanvas && (
              <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20, paddingRight: 8 }}>
                {renderCanvas ? renderCanvas(canvasRenderProps) : defaultCanvasRender(canvasRenderProps)}
              </div>
            )}

            {/* Quiz section - below canvas or at canvas position */}
            {cumulativeState.showQuiz && cumulativeState.quizQuestionIds.length > 0 && (
              <div style={{ flex: 1, paddingLeft: 150, paddingBottom: 20, paddingRight: 40, marginTop: -60 }}>
                {quizRender()}
              </div>
            )}

            {/* DropMaster section */}
            {cumulativeState.showDropGame && cumulativeState.dropGameVaultIds.length > 0 && (
              <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20, paddingRight: 8 }}>
                {dropGameRender()}
              </div>
            )}

            {/* Summary box */}
            {cumulativeState.showSummary && cumulativeState.summaryIds.length > 0 && (
              <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20, paddingRight: 8, paddingTop: 20 }}>
                <SummaryContent
                  ids={cumulativeState.summaryIds}
                  descriptionVariant={summaryDescriptionVariant}
                  contentVariant={summaryContentVariant}
                />
              </div>
            )}
          </div>

          {/* Right side: Buttons (sticky) + Sidebar (20% width) */}
          <div
            style={{
              flex: "0 0 20%",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              padding: 8,
              height: "100%",
              borderLeft: "1px solid #e0e0e0",
            }}
          >
            {/* Buttons section - sticky at top to avoid scrolling */}
            {effectiveShowButtons && (
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: 8,
                  background: "#ffffff",
                }}
              >
                {renderButtons ? renderButtons(buttonsRenderProps) : defaultButtonsRender(buttonsRenderProps)}
              </div>
            )}

            {/* Sidebar section - scrollable with smaller height budget */}
            {effectiveShowSidebar && (
              <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, marginTop: 12 }}>
                {renderSidebar ? renderSidebar(sidebarRenderProps) : defaultSidebarRender(sidebarRenderProps)}
              </div>
            )}
          </div>
        </div>
      );
    }

    // interactive layout (minimal UI)
    return (
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {renderCanvas ? renderCanvas(canvasRenderProps) : defaultCanvasRender(canvasRenderProps)}
          </div>
        </div>

        {effectiveCanvasMode === "interactive" && effectiveShowButtons && (
          <div style={{ flex: "0 0 auto", padding: 16 }}>
            {renderButtons ? renderButtons(buttonsRenderProps) : defaultButtonsRender(buttonsRenderProps)}
          </div>
        )}
      </div>
    );
  };

  return <>{renderLayout()}</>;
}
