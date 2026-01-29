// @ts-nocheck
import FreeSchedulerSidebar from "../../components/Scheduling/FreeSchedulerSidebar";
import type { SidebarRenderProps, StoryState } from "./types";
import type { Task } from "../../core/task";

/**
 * Default sidebar renderer component
 * Handles task editing, field visibility, and algorithm selection
 */

interface SidebarRendererProps {
  sidebarRenderProps: SidebarRenderProps;
  currentTasks: Task[];
  cumulativeState: StoryState;
  effectiveSidebarVisibleFields: string[];
  effectiveSidebarEditableFields: string[];
  onTasksChange: (tasks: Task[]) => void;
  onAlgorithmChange: (algorithm: string) => void;
}

export function SidebarRenderer({
  sidebarRenderProps,
  currentTasks,
  cumulativeState,
  effectiveSidebarVisibleFields,
  effectiveSidebarEditableFields,
  onTasksChange,
  onAlgorithmChange,
}: SidebarRendererProps) {
  
  const isFieldEditable = (task: Task, fieldName: string | keyof Task) => {
    // Convert field name to string for comparison
    const fieldStr = typeof fieldName === 'string' ? fieldName : String(fieldName);
    
    // Map field abbreviations
    const fieldMap: Record<string, string> = {
      "C": "executionTime",
      "T": "periods",
      "D": "deadlines",
      "O": "offsets",
      "S": "suspension",
    };
    
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
      onTasksChange={onTasksChange}
      onAlgorithmChange={onAlgorithmChange}
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
}
