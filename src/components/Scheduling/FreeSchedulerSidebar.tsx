// @ts-nocheck
import { Box, Typography, TextField, IconButton, Divider, 
  MenuItem, Select, FormControl, InputLabel, Button, FormGroup, FormControlLabel, Checkbox,
  Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { SuspensionPattern, Task } from "../../core/task";
import CloseIcon from '@mui/icons-material/Close';
import { useRef, useState, useEffect } from "react";


/**
Sidebar component allowing task parameter adjustments and algorithm selection.
Need a prop to to handle change of task parameters and algorithm selection. 
**/

interface SidebarVisibility {
  showTaskNames?: boolean;
  showExecutionTime?: boolean;
  showPeriods?: boolean;  
  showDeadlines?: boolean;
  showOffsets?: boolean;
  showSuspension?: boolean;
  showSuspensionToggle?: boolean;
  showTaskControls?: boolean;
  showAlgorithmSelection?: boolean;

}
interface FreeSchedulerSidebarProps {
  tasks: Task[];
  algorithm?: string;
  onTasksChange: (tasks: Task[]) => void;
  onAlgorithmChange?: (algorithm: string) => void;
  onClose: () => void;
  visibility?: SidebarVisibility;
  maxExecution?: number;
  maxPeriod?: number;
  maxDeadline?: number;
  maxSuspension?: number;
  maxOffset?: number;
  hyperperiod?: number;
  isFieldEditable?: (task: Task, field: keyof Task | "algorithm") => boolean;
  algorithmOptions?: string[];
  interval?: [number, number];
  onIntervalChange?: (interval: [number, number]) => void;
  allowSuspension?: boolean;
  onAllowSuspensionChange?: (enabled: boolean) => void;
}

export default function FreeSchedulerSidebar({ tasks, algorithm, onTasksChange, onAlgorithmChange, onClose, visibility, isFieldEditable, 
  maxExecution, maxDeadline, maxPeriod, maxSuspension, maxOffset, hyperperiod, algorithmOptions, interval, onIntervalChange, allowSuspension = false, onAllowSuspensionChange }: FreeSchedulerSidebarProps) {
  const roundTo1 = (value: number) => Math.round(value * 10) / 10;
  const [tempIntervalStart, setTempIntervalStart] = useState<string>(interval?.[0]?.toString() ?? "");
  const [tempIntervalEnd, setTempIntervalEnd] = useState<string>(interval?.[1]?.toString() ?? "");
  const DEFAULT_VISIBILITY: SidebarVisibility = {
    showTaskNames: true,
    showExecutionTime: true,
    showPeriods: true,
    showDeadlines: true,
    showOffsets: true,
    showSuspension: true,
    showSuspensionToggle: true,
    showTaskControls: true,
    showAlgorithmSelection: true
  };

  const mergedVisibility = {
    ...DEFAULT_VISIBILITY,
    ...visibility,
  };

  // Set max values with defaults and cap at 1000
  const effectiveMaxExecution = Math.min(maxExecution ?? 1000, 1000);
  const effectiveMaxDeadline = Math.min(maxDeadline ?? 1000, 1000);
  const effectiveMaxPeriod = Math.min(maxPeriod ?? 1000, 1000);
  const effectiveMaxSuspension = Math.min(maxSuspension ?? 1000, 1000);
  const effectiveMaxOffset = Math.min(maxOffset ?? 1000, 1000);

  const nextTaskNumber = useRef(1);
  const userDisabledSuspension = useRef(false);
  const taskColors = [
    "#f94e8aff", 
    "#3B82F6", 
    "#4dd5eaff", 
    "#b37914ff", 
    "#8B5CF6", 
  ];

  // Default suspension pattern, generated for each task when enabling suspension
  const defaultSuspensionPattern = () => ({
    offset: 0,
    duration: 0,
    period: 0,
  });

  // Show suspension automatically if provided for the tasks but the toggle is not enabled
  useEffect(() => {
    if (!allowSuspension && !userDisabledSuspension.current && mergedVisibility.showSuspension) {
      const hasAnySuspension = tasks.some(t => 
        (t.suspension !== undefined && t.suspension !== null) ||
        (t.S !== undefined && t.S > 0)
      );
      if (hasAnySuspension) {
        onAllowSuspensionChange?.(true);
      }
    }
  }, []);

  // Handler for toggling the suspension feature on each task input
  const handleAllowSuspensionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    userDisabledSuspension.current = !enabled;
    onAllowSuspensionChange?.(enabled);

    const updatedTasks = tasks.map((task) => {
      const existingPattern = task.suspension && !Array.isArray(task.suspension) ? task.suspension : undefined;

      return {
        ...task,
        S: 0,
        suspension: enabled ? existingPattern ?? defaultSuspensionPattern() : defaultSuspensionPattern(),
      };
    });

    onTasksChange(updatedTasks);
  };


  const handleTaskChange = (index: number, field: keyof Task, value: any) => {
    if ((field === "id") || (field === "name") && tasks.some((t, i) => i !== index && t[field] === value)) {
      alert(`Task with same ${field} already exist. They have to be unique.`);
      return;
    }

    // Apply min and max value constraints
    let finalValue = value;
    
    // Enforce minimum values
    if (value === "" || Number(value) === 0) {
      if (field === "T" || field === "D" || field === "C") {
        return;
      }
    }

    if (field === "C") {
      finalValue = Math.min(finalValue, effectiveMaxExecution);
    } else if (field === "T") {
      finalValue = Math.min(finalValue, effectiveMaxPeriod);
    } else if (field === "D") {
      finalValue = Math.min(finalValue, effectiveMaxDeadline);
    } else if (field === "O") {
      finalValue = Math.min(finalValue, effectiveMaxOffset);
    } else if (field === "S") {
      finalValue = Math.min(finalValue, effectiveMaxSuspension);
    }

    if (typeof finalValue === "number" && Number.isFinite(finalValue) && ["C", "T", "D", "O", "S"].includes(field)) {
      finalValue = roundTo1(finalValue);
    }

    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: finalValue === "" ? "" : finalValue };
    onTasksChange(newTasks);
  };


  // Update schedule when suspension pattern changes
  const handleSuspensionChange = (index: number, field: keyof SuspensionPattern, value: number) => {
    const newTasks = [...tasks];
    const currentSuspension = !Array.isArray(newTasks[index].suspension) && newTasks[index].suspension
      ? newTasks[index].suspension
      : defaultSuspensionPattern();

    newTasks[index] = {
      ...newTasks[index],
      S: 0,
      suspension: {
        ...currentSuspension,
        [field]: roundTo1(Math.max(0, value)),
      },
    };

    onTasksChange(newTasks);
  };

  // Function to add a new task. Default values can be adjusted as needed.

  const addTask = () => {

    const id = `t${nextTaskNumber.current}`;
    const name = `τ${nextTaskNumber.current}`;
    const color = taskColors[(nextTaskNumber.current - 1) % taskColors.length];
    nextTaskNumber.current += 1;

    const newTask: Task = {
      id,
      name,
      color,
      C: 1,
      T: 5,
      D: 5,
      S: 0,
      suspension: allowSuspension ? defaultSuspensionPattern() : undefined,
    };
    onTasksChange([...tasks, newTask]);
  };

  // Function to remove a task by index  
  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
      onTasksChange(newTasks);
  };
    
  // Rendering sidebar UI
  return (
    // Sidebar Container and Title
    <Box sx={{ width: "100%", p: 2, height: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Task Settings
        {/* Close Button */}
        <IconButton color="default" onClick={onClose} sx={{ float: 'right' }}>
          <CloseIcon/>
        </IconButton>
      </Typography>

      {/* Interval Input */}
      {onIntervalChange && (
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: "#f0f0f0", borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>View Interval</Typography>
          <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Start"
                type="number"
                size="small"
                value={tempIntervalStart}
                onChange={(e) => setTempIntervalStart(e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="End"
                type="number"
                size="small"
                value={tempIntervalEnd}
                onChange={(e) => setTempIntervalEnd(e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                sx={{ flex: 1 }}
              />
            </Box>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => {
                const start = Number(tempIntervalStart);
                const end = Number(tempIntervalEnd);
                if (start >= 0 && end > start) {
                  onIntervalChange([roundTo1(start), roundTo1(end)]);
                } else {
                  alert("Valid interval: Start >= 0 and End > Start");
                }
              }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      )}

      {/* Hyperperiod Display */}
      {hyperperiod && (
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: "#666" }}>
            Interval: <span style={{ fontWeight: 700, fontSize: "1.1em" }}>0 – {hyperperiod}</span>
          </Typography>
        </Box>
      )}

      {/* Suspension Checkbox */}
      {mergedVisibility.showSuspensionToggle && (
        <>
          <FormGroup>
            <FormControlLabel control={<Checkbox checked={allowSuspension} onChange={handleAllowSuspensionChange} />} label="Allow Suspension" />
          </FormGroup>
        </>
      )}

      {/* Algorithm Selection using MUI formcontrol */}
      {mergedVisibility.showAlgorithmSelection && (
        <>
          <FormControl fullWidth margin="normal" size="small" disabled={isFieldEditable ? !isFieldEditable({} as Task, "algorithmSelection" as any) : false}>
            <InputLabel>Algorithm</InputLabel>
            <Select
              value={algorithm ?? ""}
              label="Algorithm"
              onChange={(e) => onAlgorithmChange?.(e.target.value as string)}
            >
              {(!algorithmOptions || algorithmOptions.includes("DM")) && <MenuItem value="DM">Deadline Monotonic (DM)</MenuItem>}
              {(!algorithmOptions || algorithmOptions.includes("EDF")) && <MenuItem value="EDF">Earliest Deadline First (EDF)</MenuItem>}
              {(!algorithmOptions || algorithmOptions.includes("RM")) && <MenuItem value="RM">Rate Monotonic (RM)</MenuItem>}
            </Select>
          </FormControl>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Task List with parameters*/}
      <Typography variant="subtitle1" gutterBottom>
        Tasks
      </Typography>

      {tasks.map((task, index) => (
        <Accordion
          key={task.id}
          defaultExpanded
          sx={{ mb: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: "none", "&:before": { display: "none" } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 2, minHeight: 0, "& .MuiAccordionSummary-content": { my: 1 } }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", pr: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: "1.2rem" }}>
                {task.name}
              </Typography>
              {mergedVisibility.showTaskControls && (
                <IconButton size="small" sx={{ mr: 2 }} onClick={() => removeTask(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 1.5 }}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                alignItems: "start",
                gridTemplateColumns:
                  allowSuspension && mergedVisibility.showSuspension
                    ? "minmax(0, 1fr) minmax(180px, 240px)"
                    : "minmax(0, 1fr)",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                {mergedVisibility.showTaskNames && (
                  <TextField
                    label="N (Task name)"
                    type="string"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={task.name}
                    onChange={(e) => handleTaskChange(index, "name", String(e.target.value))}
                    slotProps={{ htmlInput: {maxLength: 5}}}
                    disabled={isFieldEditable ? !isFieldEditable(task, "name") : false}
                  />
                )}

                {mergedVisibility.showExecutionTime && (
                  <TextField
                    label="C (Execution)"
                    type="number"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={task.C}
                    onChange={(e) => handleTaskChange(index, "C", Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0, max: effectiveMaxExecution, step: 0.1 } }}
                    disabled={isFieldEditable ? !isFieldEditable(task, "C") : false}
                  />
                )}

                {mergedVisibility.showPeriods && (
                  <TextField
                    label="T (Period)"
                    type="number"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={task.T}
                    onChange={(e) => handleTaskChange(index, "T", Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0.1, max: effectiveMaxPeriod, step: 0.1 } }}
                    disabled={isFieldEditable ? !isFieldEditable(task, "T") : false}
                  />
                )}

                {mergedVisibility.showDeadlines && (
                  <TextField
                    label="D (Deadline)"
                    type="number"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={task.D}
                    onChange={(e) => handleTaskChange(index, "D", Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0.1, max: effectiveMaxDeadline, step: 0.1 } }}
                    disabled={isFieldEditable ? !isFieldEditable(task, "D") : false}
                  />
                )}

                {mergedVisibility.showOffsets && (
                  <TextField
                    label="O (Offset)"
                    type="number"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={task.O ?? 0}
                    onChange={(e) => handleTaskChange(index, "O", Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0, max: effectiveMaxOffset, step: 0.1 } }}
                    disabled={isFieldEditable ? !isFieldEditable(task, "O") : false}
                  />
                )}
              </Box>

              {mergedVisibility.showSuspension && (allowSuspension || (!mergedVisibility.showSuspensionToggle && (task.suspension !== undefined && task.suspension !== null || (task.S !== undefined && task.S > 0)))) && (
                <Box
                  sx={{
                    minWidth: 0,
                    borderLeft: "1px solid #e0e0e0",
                    pl: 2,
                  }}
                >
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {Array.isArray(task.suspension) ? (
                      <>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Suspension Bound for dynamic self-suspension
                        </Typography>
                        {/* For suspension where you input intervals, show S as upper bound */}
                        <TextField
                          label="S (Suspension)"
                          type="number"
                          size="small"
                          fullWidth
                          value={task.S ?? 0}
                          onChange={(e) => handleTaskChange(index, "S", Number(e.target.value))}
                          slotProps={{ htmlInput: { min: 0, max: effectiveMaxSuspension, step: 0.1 } }}
                          disabled={isFieldEditable ? !isFieldEditable(task, "S") : false}
                        />
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Suspension Pattern for segmented self-suspension
                        </Typography>
                        {/* For pattern-based suspension, show offset, duration, period */}
                        <TextField
                          label="Offset"
                          type="number"
                          size="small"
                          fullWidth
                          value={task.suspension ? task.suspension.offset : 0}
                          onChange={(e) => handleSuspensionChange(index, "offset", Number(e.target.value))}
                          slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                          disabled={isFieldEditable ? !isFieldEditable(task, "suspension" as any) : false}
                        />
                        <TextField
                          label="Length"
                          type="number"
                          size="small"
                          fullWidth
                          value={task.suspension ? task.suspension.duration : 0}
                          onChange={(e) => handleSuspensionChange(index, "duration", Number(e.target.value))}
                          slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                          disabled={isFieldEditable ? !isFieldEditable(task, "suspension" as any) : false}
                        />
                        <TextField
                          label="Interval"
                          type="number"
                          size="small"
                          fullWidth
                          value={task.suspension ? task.suspension.period : 0}
                          onChange={(e) => handleSuspensionChange(index, "period", Number(e.target.value))}
                          slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                          disabled={isFieldEditable ? !isFieldEditable(task, "suspension" as any) : false}
                        />
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Button to add a new task */}
      {mergedVisibility.showTaskControls && (
        <>
          <Button startIcon={<AddIcon />} fullWidth variant="outlined" onClick={addTask}>
            Add Task
          </Button>
        </>
      )}

      <Divider sx={{ my: 2 }} />
    </Box>
  );
}