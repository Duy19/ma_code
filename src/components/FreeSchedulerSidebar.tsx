import { Box, Typography, TextField, IconButton, Divider, 
    MenuItem, Select, FormControl, InputLabel, Button, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Task } from "../core/task";
import CloseIcon from '@mui/icons-material/Close';
import { useRef } from "react";


/**
  
Sidebar exclusive for Freescheduler with UI to set task parameters.
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
  isFieldEditable?: (task: Task, field: keyof Task | "algorithm") => boolean;
}

export default function FreeSchedulerSidebar({ tasks, algorithm, onTasksChange, onAlgorithmChange, onClose, visibility, isFieldEditable, 
  maxExecution, maxDeadline, maxPeriod, maxSuspension, maxOffset }: FreeSchedulerSidebarProps) {
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

    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value === "" ? "" : value };
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
          <FormControl fullWidth margin="normal" size="small" disabled={isFieldEditable ? !isFieldEditable({} as Task, "algorithm") : false}>
            <InputLabel>Algorithm</InputLabel>
            <Select
              value={algorithm ?? ""}
              label="Algorithm"
              onChange={(e) => onAlgorithmChange?.(e.target.value as string)}
            >
              <MenuItem value="DM">Deadline Monotonic (DM)</MenuItem>
              <MenuItem value="EDF">Earliest Deadline First (EDF)</MenuItem>
              <MenuItem value="RM">Rate Monotonic (RM)</MenuItem>
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
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
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
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
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
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
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
                slotProps={{ htmlInput: { min: 0, max: maxOffset, step: 1 } }}
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
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
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