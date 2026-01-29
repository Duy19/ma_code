// @ts-nocheck
import { useMemo } from "react";
import type { StoryState, StoryStep } from "./types";
import type { Task } from "../../core/task";

/**
 * Hook for managing tutorial state progression
 * Handles cumulative state patching as the story progresses through steps
 */

interface UseTutorialStateProps {
  baseTasks: Task[];
  story: StoryStep[];
  step: number;
  hyperperiod: number;
  defaultAlgorithm?: string;
  showOverlay: boolean;
  showHintCheckboxes: boolean;
  showSidebar: boolean;
  showButtons: boolean;
  showDefinitions: boolean;
  canvasMode: "interactive" | "default";
  layoutStyle: "standard" | "interactive";
  sidebarVisibleFields: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  sidebarEditableFields: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  showSummary: boolean;
  userSelectedAlgorithm?: string;
  userInputTasks?: Task[];
  userManuallyChangedAlgorithm: boolean;
}

/**
 * Creates the initial state from props
 * This is the baseline state before any story steps are applied
 */

export function createInitialState(props: UseTutorialStateProps): StoryState {
  return {
    tasks: props.baseTasks,
    selectedAlgorithm: props.defaultAlgorithm,
    hiddenTasks: [],
    hyperperiod: props.hyperperiod,
    showOverlay: props.showOverlay,
    showHintCheckboxes: props.showHintCheckboxes,
    showSidebar: props.showSidebar,
    showButtons: props.showButtons,
    showDefinitions: props.showDefinitions,
    showCanvas: true,
    showQuiz: false,
    showDropGame: false,
    dropGameVaultIds: [],
    quizQuestionIds: [],
    showSummary: props.showSummary,
    summaryIds: [],
    canvasMode: props.canvasMode,
    layoutStyle: props.layoutStyle,
    sidebarVisibleFields: props.sidebarVisibleFields,
    sidebarEditableFields: props.sidebarEditableFields,
    editableTasks: [],
    maxFieldValues: {},
    highlight: undefined,
    highlightExecutions: undefined,
    checkFunction: undefined,
  };
}

/**
 * Applies a story step patch to the current state
 * Only updates fields that are explicitly defined in the step
 */
export function applyStepPatch(state: StoryState, stepPatch: StoryStep): StoryState {
  const newState = { ...state };
  
  if (stepPatch.tasks !== undefined) newState.tasks = stepPatch.tasks;
  if (stepPatch.selectedAlgorithm !== undefined) newState.selectedAlgorithm = stepPatch.selectedAlgorithm;
  if (stepPatch.hiddenTasks !== undefined) newState.hiddenTasks = stepPatch.hiddenTasks;
  if (stepPatch.hyperperiod !== undefined) newState.hyperperiod = stepPatch.hyperperiod;
  if (stepPatch.showOverlay !== undefined) newState.showOverlay = stepPatch.showOverlay;
  if (stepPatch.showHintCheckboxes !== undefined) newState.showHintCheckboxes = stepPatch.showHintCheckboxes;
  if (stepPatch.showSidebar !== undefined) newState.showSidebar = stepPatch.showSidebar;
  if (stepPatch.showButtons !== undefined) newState.showButtons = stepPatch.showButtons;
  if (stepPatch.showDefinitions !== undefined) newState.showDefinitions = stepPatch.showDefinitions;
  if (stepPatch.showCanvas !== undefined) newState.showCanvas = stepPatch.showCanvas;
  if (stepPatch.showQuiz !== undefined) newState.showQuiz = stepPatch.showQuiz;
  if (stepPatch.quizQuestionIds !== undefined) newState.quizQuestionIds = stepPatch.quizQuestionIds;
  if (stepPatch.showSummary !== undefined) newState.showSummary = stepPatch.showSummary;
  if (stepPatch.summaryIds !== undefined) newState.summaryIds = stepPatch.summaryIds;
  if (stepPatch.showDropGame !== undefined) newState.showDropGame = stepPatch.showDropGame;
  if (stepPatch.dropGameVaultIds !== undefined) newState.dropGameVaultIds = stepPatch.dropGameVaultIds;
  if (stepPatch.canvasMode !== undefined) newState.canvasMode = stepPatch.canvasMode;
  if (stepPatch.layoutStyle !== undefined) newState.layoutStyle = stepPatch.layoutStyle;
  if (stepPatch.sidebarVisibleFields !== undefined) newState.sidebarVisibleFields = stepPatch.sidebarVisibleFields;
  if (stepPatch.sidebarEditableFields !== undefined) newState.sidebarEditableFields = stepPatch.sidebarEditableFields;
  if (stepPatch.editableTasks !== undefined) newState.editableTasks = stepPatch.editableTasks;
  if (stepPatch.maxFieldValues !== undefined) newState.maxFieldValues = stepPatch.maxFieldValues;
  if (stepPatch.highlight !== undefined) newState.highlight = stepPatch.highlight;
  if (stepPatch.highlightExecutions !== undefined) newState.highlightExecutions = stepPatch.highlightExecutions;
  if ("renderCompanion" in stepPatch) newState.renderCompanion = stepPatch.renderCompanion;
  if (stepPatch.checkFunction !== undefined) newState.checkFunction = stepPatch.checkFunction;
  
  return newState;
}

/**
 * Main hook for managing tutorial state
 * Computes cumulative state by applying all patches from first step to current step
 */
export function useTutorialState(props: UseTutorialStateProps): StoryState {
  const cumulativeState = useMemo(() => {
    let state = createInitialState(props);
    
    // Apply patches from each step up to the current one
    for (let i = 0; i <= props.step && i < props.story.length; i++) {
      const stepPatch = props.story[i];
      state = applyStepPatch(state, stepPatch);
    }
    
    // Prioritize user edits: always use user input if it has been set
    // This allows edits to persist even after the field becomes non-editable
    if (props.userInputTasks !== undefined) {
      state.tasks = props.userInputTasks;
    }
    
    // Only override with user selection if user manually changed it
    // This allows story steps to control the algorithm until the user intervenes
    if (props.userManuallyChangedAlgorithm && props.userSelectedAlgorithm !== undefined) {
      state.selectedAlgorithm = props.userSelectedAlgorithm;
    }
    
    return state;
  }, [
    props.step,
    props.story,
    props.baseTasks,
    props.defaultAlgorithm,
    props.showOverlay,
    props.showHintCheckboxes,
    props.showSidebar,
    props.showButtons,
    props.showDefinitions,
    props.canvasMode,
    props.layoutStyle,
    props.sidebarVisibleFields,
    props.sidebarEditableFields,
    props.userSelectedAlgorithm,
    props.userInputTasks,
    props.userManuallyChangedAlgorithm,
    props.showSummary,
  ]);

  return cumulativeState;
}
