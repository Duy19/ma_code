// @ts-nocheck
import { Box, Typography, TextField, IconButton, Divider, 
    MenuItem, Select, FormControl, InputLabel, Button, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Task } from "../../core/task";
import CloseIcon from '@mui/icons-material/Close';
import { useRef, useState } from "react";


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
}

export default function FreeSchedulerSidebar({ tasks, algorithm, onTasksChange, onAlgorithmChange, onClose, visibility, isFieldEditable, 
  maxExecution, maxDeadline, maxPeriod, maxSuspension, maxOffset, hyperperiod, algorithmOptions, interval, onIntervalChange }: FreeSchedulerSidebarProps) {
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
  const taskColors = [
    "#f94e8aff", 
    "#3B82F6", 
    "#4dd5eaff", 
    "#b37914ff", 
    "#8B5CF6", 
  ];
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
    <Box sx={{ width: "90%", p: 2, height: "100%", boxSizing: "border-box", overflowY: "auto" }}>
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
      {mergedVisibility.showSuspension && (
        <>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} label="Allow Suspension" />
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
        <Box key={task.id} sx={{ mb: 2, border: "1px solid #ddd", borderRadius: 2, p: 1 }}>
          {mergedVisibility.showTaskControls && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2">{task.name}</Typography>
                <IconButton size="small" onClick={() => removeTask(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}

          {mergedVisibility.showTaskNames && (
            <>
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
            </>
          )}

          {mergedVisibility.showExecutionTime && (
            <>
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
            </>
          )}

          {mergedVisibility.showPeriods && (
          <>
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
          </>
          )}

          {mergedVisibility.showDeadlines && (
            <>
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
            </>
          )}

          {mergedVisibility.showOffsets && (
            <>
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
            </>
          )}

          {mergedVisibility.showSuspension && ( 
            <>
              <TextField
                label="S (Suspension)"
                type="number"
                size="small"
                fullWidth
                margin="dense"
                value={task.S ?? 0}
                onChange={(e) => handleTaskChange(index, "S", Number(e.target.value))}
                slotProps={{ htmlInput: { min: 0, max: effectiveMaxSuspension, step: 0.1 } }}
                disabled={isFieldEditable ? !isFieldEditable(task, "S") : false}
              />
            </>
          )}
        </Box>
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