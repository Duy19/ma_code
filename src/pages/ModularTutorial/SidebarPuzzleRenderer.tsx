// @ts-nocheck
import { useState, useMemo } from "react";
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import type { StoryState } from "./types";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";

/**
 * Sidebar Puzzle Renderer
 * Displays a sidebar puzzle where user must edit task parameters to match a canvas schedule
 * Includes custom form for parameter input and algorithm selection
 */

interface SidebarPuzzleRendererProps {
  cumulativeState: StoryState;
  onSidebarPuzzleComplete: () => void;
  onNextStep: () => void;
  
  // Puzzle configuration
  puzzleTasks: Task[];
  algorithm: (tasks: Task[], hyperperiod: number) => ScheduleEntry[];
  algorithmName: string;
  hyperperiod: number;
  interval?: [number, number];
  
  // Visibility and editability
  puzzleVisibleFields: string[];
  puzzleEditableFields: string[];
  editableTasks?: string[];
  maxFieldValues?: Record<string, number>;
  
  // Canvas props
  canvasProps: any;
  userScheduleRef: Record<string, Set<number>>;
  setUserScheduleRef: (ref: Record<string, Set<number>>) => void;
  hintBlocks: Record<string, Set<number>>;
  visibility: { showReleaseMarkers: boolean; showDeadlineMarkers: boolean };
}

export function SidebarPuzzleRenderer({
  cumulativeState,
  onSidebarPuzzleComplete,
  onNextStep,
  puzzleTasks,
  algorithm,
  algorithmName,
  hyperperiod,
  interval,
  puzzleVisibleFields,
  puzzleEditableFields,
  editableTasks,
  maxFieldValues,
  canvasProps,
  userScheduleRef,
  setUserScheduleRef,
  hintBlocks,
  visibility,
}: SidebarPuzzleRendererProps) {
  
  if (!cumulativeState.showSidebarPuzzle) {
    return null;
  }

  const [userInputValues, setUserInputValues] = useState<Record<string, Record<string, number>>>({});
  const [inputsTouched, setInputsTouched] = useState(false);
  const [checkPassed, setCheckPassed] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmName);

  // Create dummy tasks with all zeros for initial display
  const dummyTasks = useMemo(() => {
    return puzzleTasks.map((task) => ({
      ...task,
      C: 0,
      T: 0,
      D: 0,
      O: 0,
      S: 0,
    }));
  }, [puzzleTasks]);

  // Calculate the correct schedule with the real tasks
  const correctSchedule = useMemo(() => {
    return algorithm(puzzleTasks, hyperperiod).schedule;
  }, [puzzleTasks, hyperperiod, algorithm]);

  // Field display names and keys
  const fieldKeyMap: Record<string, keyof Task> = {
    executionTime: "C",
    periods: "T",
    deadlines: "D",
    offsets: "O",
    suspension: "S",
  };

  const fieldLabels: Record<keyof Task, string> = {
    id: "ID",
    name: "Name",
    color: "Color",
    C: "Execution Time (C)",
    T: "Period (T)",
    D: "Deadline (D)",
    O: "Offset (O)",
    S: "Suspension (S)",
  };

  // Check if inputs match the real values
  const inputsMatch = useMemo(() => {
    const editableFields = puzzleEditableFields.filter(
      (field) => field !== "algorithmSelection" && field !== "taskControls"
    );
    if (editableFields.length === 0) return true;

    const shouldCheckTask = (taskId: string) =>
      !editableTasks || editableTasks.length === 0 || editableTasks.includes(taskId);

    const normalizeValue = (value: number | undefined) => {
      return value === undefined || value === null ? 0 : value;
    };

    return puzzleTasks.every((task) => {
      if (!shouldCheckTask(task.id)) return true;

      return editableFields.every((field) => {
        const key = fieldKeyMap[field];
        if (!key) return true;
        
        const userValue = normalizeValue(userInputValues[task.id]?.[key]);
        const realValue = normalizeValue(task[key]);
        return userValue === realValue;
      });
    });
  }, [userInputValues, puzzleTasks, puzzleEditableFields, editableTasks, fieldKeyMap]);

  const inputsCorrect = inputsTouched && inputsMatch;

  const handleInputChange = (taskId: string, fieldKey: keyof Task, value: string) => {
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    
    // Apply max value constraints if they exist
    let finalValue = numValue;
    if (fieldKey === "C" && maxFieldValues?.executionTime !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.executionTime);
    } else if (fieldKey === "T" && maxFieldValues?.periods !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.periods);
    } else if (fieldKey === "D" && maxFieldValues?.deadlines !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.deadlines);
    } else if (fieldKey === "O" && maxFieldValues?.offsets !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.offsets);
    } else if (fieldKey === "S" && maxFieldValues?.suspension !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.suspension);
    }

    setUserInputValues((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [fieldKey]: finalValue,
      },
    }));
    setInputsTouched(true);
  };

  const onCheck = () => {
    if (!inputsTouched) {
      alert("Please edit the fields above to match the schedule");
      return;
    }
    if (puzzleEditableFields.includes("algorithmSelection") && selectedAlgorithm !== algorithmName) {
      alert("Please select the correct algorithm!");
      return;
    }
    if (!inputsMatch) {
      alert("Your values don't match yet.");
      return;
    }
    alert("Good Job! Your values match the schedule.");
    setCheckPassed(true);
    onSidebarPuzzleComplete();
  };

  const onRetry = () => {
    setUserInputValues({});
    setInputsTouched(false);
    setCheckPassed(false);
  };

  const onContinue = () => {
    onNextStep();
  };

  return (
    <Box sx={{ display: "flex", gap: 2, height: "100%", minHeight: 0, width: "100%" }}>
      <SidebarPuzzleCanvasRenderer
        puzzleTasks={puzzleTasks}
        algorithm={algorithm}
        hyperperiod={hyperperiod}
        interval={interval}
        canvasProps={canvasProps}
        userScheduleRef={userScheduleRef}
        setUserScheduleRef={setUserScheduleRef}
        hintBlocks={hintBlocks}
        visibility={visibility}
      />
      <SidebarPuzzleFormRenderer
        puzzleTasks={puzzleTasks}
        algorithmName={algorithmName}
        puzzleVisibleFields={puzzleVisibleFields}
        puzzleEditableFields={puzzleEditableFields}
        editableTasks={editableTasks}
        maxFieldValues={maxFieldValues}
        userInputValues={userInputValues}
        setUserInputValues={setUserInputValues}
        inputsTouched={inputsTouched}
        setInputsTouched={setInputsTouched}
        checkPassed={checkPassed}
        setCheckPassed={setCheckPassed}
        selectedAlgorithm={selectedAlgorithm}
        setSelectedAlgorithm={setSelectedAlgorithm}
        onSidebarPuzzleComplete={onSidebarPuzzleComplete}
        onNextStep={onNextStep}
      />
    </Box>
  );
}

/**
 * Sidebar Puzzle Canvas Renderer
 * Displays only the canvas for the puzzle
 */
export function SidebarPuzzleCanvasRenderer({
  puzzleTasks,
  algorithm,
  hyperperiod,
  interval,
  canvasProps,
  userScheduleRef,
  setUserScheduleRef,
  hintBlocks,
  visibility,
}: Omit<SidebarPuzzleRendererProps, 'cumulativeState' | 'onSidebarPuzzleComplete' | 'onNextStep' | 'algorithmName' | 'puzzleVisibleFields' | 'puzzleEditableFields' | 'editableTasks' | 'maxFieldValues'>) {
  
  // Calculate the correct schedule with the real tasks
  const correctSchedule = useMemo(() => {
    return algorithm(puzzleTasks, hyperperiod).schedule;
  }, [puzzleTasks, hyperperiod, algorithm]);

  return (
    <Box
      sx={{
        flex: "0 0 auto",
        width: "67%",
        display: "flex",
        flexDirection: "column",
        padding: 1,
        minHeight: 0,
        overflow: "auto",
      }}
    >
      <SchedulerCanvas
        tasks={puzzleTasks}
        hyperperiod={hyperperiod}
        interval={interval}
        schedule={correctSchedule}
        userScheduleRef={userScheduleRef}
        setUserScheduleRef={setUserScheduleRef}
        hintBlocks={hintBlocks}
        visibility={{
          showReleaseMarkers: visibility.showReleaseMarkers,
          showDeadlineMarkers: visibility.showDeadlineMarkers,
          showTaskLabels: true,
          showXAxis: true,
          showExecutionBlocks: true,
        }}
        pxPerStep={canvasProps.pxPerStep ?? 30}
        heightPerTask={canvasProps.heightPerTask ?? 130}
        leftLabelWidth={canvasProps.leftLabelWidth ?? 140}
        canvasMode="default"
      />
    </Box>
  );
}

/**
 * Sidebar Puzzle Form Renderer
 * Displays only the parameter editing form
 */
export function SidebarPuzzleFormRenderer({
  puzzleTasks,
  algorithmName,
  puzzleVisibleFields,
  puzzleEditableFields,
  editableTasks,
  maxFieldValues,
  userInputValues,
  setUserInputValues,
  inputsTouched,
  setInputsTouched,
  checkPassed,
  setCheckPassed,
  selectedAlgorithm,
  setSelectedAlgorithm,
  onSidebarPuzzleComplete,
  onNextStep,
}: {
  puzzleTasks: Task[];
  algorithmName: string;
  puzzleVisibleFields: string[];
  puzzleEditableFields: string[];
  editableTasks?: string[];
  maxFieldValues?: Record<string, number>;
  userInputValues: Record<string, Record<string, number>>;
  setUserInputValues: (values: Record<string, Record<string, number>>) => void;
  inputsTouched: boolean;
  setInputsTouched: (touched: boolean) => void;
  checkPassed: boolean;
  setCheckPassed: (passed: boolean) => void;
  selectedAlgorithm: string;
  setSelectedAlgorithm: (algorithm: string) => void;
  onSidebarPuzzleComplete: () => void;
  onNextStep: () => void;
}) {
  
  const fieldKeyMap: Record<string, keyof Task> = {
    executionTime: "C",
    periods: "T",
    deadlines: "D",
    offsets: "O",
    suspension: "S",
  };

  const fieldLabels: Record<keyof Task, string> = {
    id: "ID",
    name: "Name",
    color: "Color",
    C: "Execution Time (C)",
    T: "Period (T)",
    D: "Deadline (D)",
    O: "Offset (O)",
    S: "Suspension (S)",
  };

  // Check if inputs match the real values
  const inputsMatch = useMemo(() => {
    const editableFields = puzzleEditableFields.filter(
      (field) => field !== "algorithmSelection" && field !== "taskControls"
    );
    if (editableFields.length === 0) return true;

    const shouldCheckTask = (taskId: string) =>
      !editableTasks || editableTasks.length === 0 || editableTasks.includes(taskId);

    const normalizeValue = (value: number | undefined) => {
      return value === undefined || value === null ? 0 : value;
    };

    return puzzleTasks.every((task) => {
      if (!shouldCheckTask(task.id)) return true;

      return editableFields.every((field) => {
        const key = fieldKeyMap[field];
        if (!key) return true;
        
        const userValue = normalizeValue(userInputValues[task.id]?.[key]);
        const realValue = normalizeValue(task[key]);
        return userValue === realValue;
      });
    });
  }, [userInputValues, puzzleTasks, puzzleEditableFields, editableTasks, fieldKeyMap]);

  const handleInputChange = (taskId: string, fieldKey: keyof Task, value: string) => {
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    
    // Apply max value constraints if they exist
    let finalValue = numValue;
    if (fieldKey === "C" && maxFieldValues?.executionTime !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.executionTime);
    } else if (fieldKey === "T" && maxFieldValues?.periods !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.periods);
    } else if (fieldKey === "D" && maxFieldValues?.deadlines !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.deadlines);
    } else if (fieldKey === "O" && maxFieldValues?.offsets !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.offsets);
    } else if (fieldKey === "S" && maxFieldValues?.suspension !== undefined) {
      finalValue = Math.min(finalValue, maxFieldValues.suspension);
    }

    setUserInputValues({
      ...userInputValues,
      [taskId]: {
        ...(userInputValues[taskId] || {}),
        [fieldKey]: finalValue,
      },
    });
    setInputsTouched(true);
  };

  const onCheck = () => {
    if (!inputsTouched) {
      alert("👉 Please edit the fields above to match the schedule");
      return;
    }
    if (puzzleEditableFields.includes("algorithmSelection") && selectedAlgorithm !== algorithmName) {
      alert("⚠️ Please select the correct algorithm!");
      return;
    }
    if (!inputsMatch) {
      alert("⚠️ Your values don't match yet. Keep trying!");
      return;
    }
    alert("✓ Perfect! Your values match the schedule.");
    setCheckPassed(true);
    onSidebarPuzzleComplete();
  };

  const onRetry = () => {
    setUserInputValues({});
    setInputsTouched(false);
    setCheckPassed(false);
  };

  const onContinue = () => {
    onNextStep();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        border: "none",
        borderRadius: 2,
        padding: 2,
        minHeight: 0,
        overflow: "auto",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        flex: 1,
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: 2, marginTop: 0, fontWeight: 700, color: "#1a1a1a" }}>
        Edit Parameters
      </Typography>

      {/* Algorithm selection */}
      {puzzleVisibleFields.includes("algorithmSelection") && (
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Algorithm</InputLabel>
          <Select 
            value={selectedAlgorithm} 
            label="Algorithm"
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            sx={{
              borderRadius: 1,
              backgroundColor: "#fafafa",
              "& .MuiOutlinedInput-root": {
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            }}
          >
            <MenuItem value="RM">RM</MenuItem>
            <MenuItem value="EDF">EDF</MenuItem>
            <MenuItem value="DM">DM</MenuItem>
            <MenuItem value="LLF">LLF</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Task parameters inputs */}
      <Box sx={{ flex: 1, overflow: "auto", marginBottom: 2, marginTop: 2 }}>
        {puzzleTasks.map((task) => {
          const isEditableTask =
            !editableTasks || editableTasks.length === 0 || editableTasks.includes(task.id);

          if (!isEditableTask) return null;

          return (
            <Accordion 
              key={task.id} 
              defaultExpanded 
              sx={{ 
                marginBottom: 1.5,
                border: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                borderRadius: 1,
                overflow: "hidden",
                backgroundColor: "#ffffff",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: task.color ? `${task.color}40` : "#f5f5f5",
                  padding: "12px 16px",
                  minHeight: 0,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: task.color ? `${task.color}50` : "#eeeeee",
                  },
                  "& .MuiAccordionSummary-content": {
                    margin: "8px 0",
                    padding: 0,
                  },
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#1a1a1a",
                  }}
                >
                  {task.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails 
                sx={{ 
                  padding: "12px 16px",
                  backgroundColor: task.color ? `${task.color}15` : "#ffffff",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >

              {/* Execution time field */}
              {puzzleVisibleFields.includes("executionTime") && (
                <TextField
                  label={fieldLabels.C}
                  type="number"
                  size="small"
                  fullWidth
                  margin="dense"
                  value={userInputValues[task.id]?.C ?? ""}
                  onChange={(e) => handleInputChange(task.id, "C", e.target.value)}
                  disabled={!puzzleEditableFields.includes("executionTime")}
                  inputProps={{ min: 0, max: maxFieldValues?.executionTime }}
                />
              )}

              {/* Period field */}
              {puzzleVisibleFields.includes("periods") && (
                <TextField
                  label={fieldLabels.T}
                  type="number"
                  size="small"
                  fullWidth
                  margin="dense"
                  value={userInputValues[task.id]?.T ?? ""}
                  onChange={(e) => handleInputChange(task.id, "T", e.target.value)}
                  disabled={!puzzleEditableFields.includes("periods")}
                  inputProps={{ min: 0, max: maxFieldValues?.periods }}
                />
              )}

              {/* Deadline field */}
              {puzzleVisibleFields.includes("deadlines") && (
                <TextField
                  label={fieldLabels.D}
                  type="number"
                  size="small"
                  fullWidth
                  margin="dense"
                  value={userInputValues[task.id]?.D ?? ""}
                  onChange={(e) => handleInputChange(task.id, "D", e.target.value)}
                  disabled={!puzzleEditableFields.includes("deadlines")}
                  inputProps={{ min: 0, max: maxFieldValues?.deadlines }}
                />
              )}

              {/* Offset field */}
              {puzzleVisibleFields.includes("offsets") && (
                <TextField
                  label={fieldLabels.O}
                  type="number"
                  size="small"
                  fullWidth
                  margin="dense"
                  value={userInputValues[task.id]?.O ?? ""}
                  onChange={(e) => handleInputChange(task.id, "O", e.target.value)}
                  disabled={!puzzleEditableFields.includes("offsets")}
                  inputProps={{ min: 0, max: maxFieldValues?.offsets }}
                />
              )}

              {/* Suspension field */}
              {puzzleVisibleFields.includes("suspension") && (
                <TextField
                  label={fieldLabels.S}
                  type="number"
                  size="small"
                  fullWidth
                  margin="dense"
                  value={userInputValues[task.id]?.S ?? ""}
                  onChange={(e) => handleInputChange(task.id, "S", e.target.value)}
                  disabled={!puzzleEditableFields.includes("suspension")}
                  inputProps={{ min: 0, max: maxFieldValues?.suspension }}
                />
              )}
</AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 1, marginTop: "auto", paddingTop: 1.5 }}>
        {!checkPassed ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={onCheck}
              fullWidth
              disabled={!inputsTouched}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                padding: "10px 16px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(25, 103, 210, 0.2)",
                "&:hover:not(:disabled)": {
                  boxShadow: "0 4px 12px rgba(25, 103, 210, 0.3)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              Check
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onRetry}
              fullWidth
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                padding: "10px 16px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Reset
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={onContinue}
              fullWidth
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                padding: "10px 16px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(76, 175, 80, 0.2)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Continue
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onRetry}
              fullWidth
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                padding: "10px 16px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Reset
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
