import { Box, Typography, TextField, IconButton, Divider, 
    MenuItem, Select, FormControl, InputLabel, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Task } from "../core/task";

interface FreeSchedulerSidebarProps {
  tasks: Task[];
  algorithm?: string;
  onTasksChange: (tasks: Task[]) => void;
  onAlgorithmChange?: (algorithm: string) => void;
  onClose: () => void;
}

export default function FreeSchedulerSidebar({ tasks, algorithm, onTasksChange, onAlgorithmChange, onClose }: FreeSchedulerSidebarProps) {
  
    const handleTaskChange = (index: number, field: keyof Task, value: any) => {
        const newTasks = [...tasks];
        newTasks[index] = { ...newTasks[index], [field]: value };
        onTasksChange(newTasks);
    };

    const addTask = () => {
        const newTask: Task = {
        id: `t${tasks.length + 1}`,
        name: `τ${tasks.length + 1}`,
        color: "#a65a5aff",
        C: 1,
        T: 5,
        D: 5,
        S: 0,
        };
        onTasksChange([...tasks, newTask]);
    };

    const removeTask = (index: number) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        onTasksChange(newTasks);
    };
    
  
    return (
    <Box sx={{ width: 240, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Scheduler Setting
      </Typography>

      <Button variant="contained" onClick={onClose}>
        Close
      </Button>  
      {/* Algorithm Selection */}
      <FormControl fullWidth margin="normal" size="small">
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

      <Divider sx={{ my: 2 }} />

      {/* Task List */}
      <Typography variant="subtitle1" gutterBottom>
        Tasks
      </Typography>

      {tasks.map((task, index) => (
        <Box key={task.id} sx={{ mb: 2, border: "1px solid #ddd", borderRadius: 2, p: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2">{task.name}</Typography>
            <IconButton size="small" onClick={() => removeTask(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <TextField
            label="C (Execution)"
            type="number"
            size="small"
            fullWidth
            margin="dense"
            value={task.C}
            onChange={(e) => handleTaskChange(index, "C", Number(e.target.value))}
          />
          <TextField
            label="T (Period)"
            type="number"
            size="small"
            fullWidth
            margin="dense"
            value={task.T}
            onChange={(e) => handleTaskChange(index, "T", Number(e.target.value))}
          />
          <TextField
            label="D (Deadline)"
            type="number"
            size="small"
            fullWidth
            margin="dense"
            value={task.D}
            onChange={(e) => handleTaskChange(index, "D", Number(e.target.value))}
          />
          <TextField
            label="S (Suspension)"
            type="number"
            size="small"
            fullWidth
            margin="dense"
            value={task.S ?? 0}
            onChange={(e) => handleTaskChange(index, "S", Number(e.target.value))}
          />
        </Box>
      ))}

      <Button startIcon={<AddIcon />} fullWidth variant="outlined" onClick={addTask}>
        Add Task
      </Button>

      <Divider sx={{ my: 2 }} />
    </Box>
  );
}