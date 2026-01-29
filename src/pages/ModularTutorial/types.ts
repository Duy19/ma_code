// @ts-nocheck
import { ReactNode } from "react";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import type { Definition } from "../../components/General/DefinitionsBox";

/**
 * Type definitions for the ModularTutorialTemplate
 * This file contains all interfaces and types used across the template and its components
 */

export type HintType = "releaseMarker" | "deadlineMarker" | "fullExecution";

export interface HintConfig {
  type: HintType;
  unlockAt: number;
}

/**
 * StoryState = The state of the page as it progresses through steps.
 * This includes all UI visibility, sidebar configuration, canvas settings, etc.
 * It starts with the initial props and is patched by each StoryStep.
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
  showCanvas: boolean;
  showQuiz: boolean;
  quizQuestionIds: string[];
  showSummary: boolean;
  summaryIds: string[];
  showDropGame: boolean;
  dropGameVaultIds: string[];
  
  // Canvas configuration
  canvasMode: "interactive" | "default";
  layoutStyle: "standard" | "interactive";
  
  // Sidebar configuration
  sidebarVisibleFields: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  sidebarEditableFields: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  editableTasks: string[];
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
  
  // Additional renderComponent (Images, Videos, etc.)
  renderComponent?: (props: OverlayRenderProps) => ReactNode;
  
  // Custom check function for this step
  checkFunction?: (state: CheckFunctionState) => boolean;
}

/**
 * StoryStep = A step/state of the Tutorials and Chapters.
 * They are built progressively like a picture book or game, telling a story.
 */
export interface StoryStep {
  text: string;
  
  // State patches only include what you want to change from previous step
  tasks?: Task[];
  selectedAlgorithm?: string;
  hiddenTasks?: string[];
  hyperperiod?: number;
  
  // Visibility patches
  showOverlay?: boolean;
  showHintCheckboxes?: boolean;
  showSidebar?: boolean;
  showButtons?: boolean;
  showDefinitions?: boolean;
  showCanvas?: boolean;
  showQuiz?: boolean;
  quizQuestionIds?: string[];
  showSummary?: boolean;
  summaryIds?: string[];
  dropGameVaultIds?: string[];
  showDropGame?: boolean;
  
  // Canvas patches
  canvasMode?: "interactive" | "default";
  layoutStyle?: "standard" | "interactive";
  
  // Sidebar patches
  sidebarVisibleFields?: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  sidebarEditableFields?: ("executionTime" | "periods" | "deadlines" | "offsets" | "suspension" | "taskControls" | "algorithmSelection")[];
  editableTasks?: string[];
  maxFieldValues?: {
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
  
  // Custom check function for this step
  checkFunction?: (state: CheckFunctionState) => boolean;
  
  // WCRT (Worst-Case Response Time) check
  wcrtTaskId?: string;
  
  // Navigation and conditions
  navigateTo?: string;
  waitFor?: (state: WaitForState) => boolean;
}

export interface CheckFunctionState {
  userScheduleRef: Record<string, Set<number>>;
  inputTasks: Task[];
  correctSchedule: ScheduleEntry[];
  baseTasks: Task[];
  visibleTasks: Task[];
  canvasMode: "interactive" | "default";
}

export interface WaitForState {
  selectedAlgorithm: string | undefined;
  failedCount: number;
  wcrtCorrect: boolean;
  scheduleCorrect: boolean;
  customCheckCorrect: boolean;
  quizCompleted: boolean;
  dropGameCompleted: boolean;
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

export interface ModularTutorialTemplateProps {
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
  renderCompanion?: (props: OverlayRenderProps) => ReactNode;
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
