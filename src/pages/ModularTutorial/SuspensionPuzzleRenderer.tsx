// @ts-nocheck
import { useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Alert,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchedulerCanvas from "../../components/Scheduling/SchedulerCanvas";
import type { StoryState } from "./types";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import type { SuspensionInterval, SuspensionPuzzleConfig } from "./types";

/**
 * Suspension Puzzle Renderer
 * Displays a puzzle where users must place suspension intervals at the correct time instances
 */

interface SuspensionPuzzleRendererProps {
  cumulativeState: StoryState;
  onSuspensionPuzzleComplete: () => void;
  onNextStep: () => void;

  // Puzzle configuration
  puzzleTasks: Task[];
  algorithm: (tasks: Task[], hyperperiod: number) => ScheduleEntry[];
  hyperperiod: number;
  interval?: [number, number];
  suspensionConfig: SuspensionPuzzleConfig;

  // Canvas props
  canvasProps: any;
  userScheduleRef: Record<string, Set<number>>;
  setUserScheduleRef: (ref: Record<string, Set<number>>) => void;
  hintBlocks: Record<string, Set<number>>;
  visibility: { showReleaseMarkers: boolean; showDeadlineMarkers: boolean };
}


// Validates suspension intervals
 
const validateSuspensionIntervals = (
  userIntervals: SuspensionInterval[],
  solution: SuspensionInterval[],
  totalSuspension: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Total suspension time must equal required suspension
  const userTotal = userIntervals.reduce((sum, interval) => {
    return sum + (interval.end - interval.start);
  }, 0);

  if (userTotal !== totalSuspension) {
    errors.push(
      `Total suspension time is ${userTotal}, should be ${totalSuspension}`
    );
  }

  // Intervals must not overlap
  const sorted = [...userIntervals].sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].end > sorted[i + 1].start) {
      errors.push(`Intervals overlap between interval ${i + 1} and ${i + 2}`);
    }
  }

  // Start must be less than end for each interval
  for (let i = 0; i < userIntervals.length; i++) {
    if (userIntervals[i].start >= userIntervals[i].end) {
      errors.push(`Interval ${i + 1}: start must be before end`);
    }
  }

  // Exact match with solution
  const solutionSorted = [...solution].sort((a, b) => a.start - b.start);
  const userSorted = [...userIntervals].sort((a, b) => a.start - b.start);

  const solutionMatches = solutionSorted.every((sol, idx) => {
    const user = userSorted[idx];
    return user && user.start === sol.start && user.end === sol.end;
  });

  if (!solutionMatches && errors.length === 0) {
    errors.push("Intervals don't match the optimal solution");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export function SuspensionPuzzleRenderer({
  cumulativeState,
  onSuspensionPuzzleComplete,
  onNextStep,
  puzzleTasks,
  algorithm,
  hyperperiod,
  interval,
  suspensionConfig,
  canvasProps,
  userScheduleRef,
  setUserScheduleRef,
  hintBlocks,
  visibility,
}: SuspensionPuzzleRendererProps) {
  if (!cumulativeState.showSuspensionPuzzle) {
    return null;
  }

  // State for managing intervals per task
  const [userIntervalsByTask, setUserIntervalsByTask] = useState<Record<string, SuspensionInterval[]>>(() => {
    const initial: Record<string, SuspensionInterval[]> = {};
    suspensionConfig.tasks.forEach((taskSpec) => {
      initial[taskSpec.taskId] = Array.from(
        { length: taskSpec.numIntervals },
        () => ({ start: 0, end: 0 })
      );
    });
    return initial;
  });

  const [inputsTouched, setInputsTouched] = useState(false);
  const [checkPassed, setCheckPassed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate the correct schedule with the real suspension
  const correctSchedule = useMemo(() => {
    return algorithm(puzzleTasks, hyperperiod);
  }, [puzzleTasks, hyperperiod, algorithm]);

  const handleIntervalChange = (
    taskId: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value) || 0);

    setUserIntervalsByTask((prev) => {
      const taskIntervals = [...(prev[taskId] || [])];
      taskIntervals[index] = {
        ...taskIntervals[index],
        [field]: numValue,
      };
      return {
        ...prev,
        [taskId]: taskIntervals,
      };
    });
    setInputsTouched(true);
  };

  const onCheck = () => {
    if (!inputsTouched) {
      alert(
        "👉 Please edit the suspension intervals to match the schedule"
      );
      return;
    }

    const allErrors: string[] = [];

    // Validate each task
    suspensionConfig.tasks.forEach((taskSpec) => {
      const userIntervals = userIntervalsByTask[taskSpec.taskId] || [];
      const validation = validateSuspensionIntervals(
        userIntervals,
        taskSpec.solution,
        taskSpec.totalSuspension
      );

      if (!validation.valid) {
        allErrors.push(
          `${puzzleTasks.find((t) => t.id === taskSpec.taskId)?.name}:`,
          ...validation.errors
        );
      }
    });

    setValidationErrors(allErrors);

    if (allErrors.length === 0) {
      alert("✓ Perfect! Your suspension intervals match the schedule.");
      setCheckPassed(true);
      onSuspensionPuzzleComplete();
    }
  };

  const onRetry = () => {
    const resetIntervals: Record<string, SuspensionInterval[]> = {};
    suspensionConfig.tasks.forEach((taskSpec) => {
      resetIntervals[taskSpec.taskId] = Array.from(
        { length: taskSpec.numIntervals },
        () => ({ start: 0, end: 0 })
      );
    });
    setUserIntervalsByTask(resetIntervals);
    setInputsTouched(false);
    setCheckPassed(false);
    setValidationErrors([]);
  };

  const onContinue = () => {
    onNextStep();
  };

  // Create tasks with user suspension intervals
  const userTasksWithSuspension = useMemo(() => {
    return puzzleTasks.map((task) => {
      const taskSpec = suspensionConfig.tasks.find((t) => t.taskId === task.id);
      if (taskSpec) {
        const intervals = userIntervalsByTask[task.id] || [];
        return {
          ...task,
          suspension: intervals.filter(
            (interval) => interval.start !== 0 || interval.end !== 0
          ),
        };
      }
      return task;
    });
  }, [puzzleTasks, userIntervalsByTask, suspensionConfig.tasks]);

  // Calculate the user schedule based on their input
  const userSchedule = useMemo(() => {
    return algorithm(userTasksWithSuspension, hyperperiod);
  }, [userTasksWithSuspension, hyperperiod, algorithm]);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        height: "100%",
        minHeight: 0,
        width: "100%",
      }}
    >
      {/* Canvas on the left Side */}
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
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Your Schedule
        </Typography>
        <SchedulerCanvas
          tasks={userTasksWithSuspension}
          hyperperiod={hyperperiod}
          interval={interval}
          schedule={userSchedule}
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

      {/* Right Side */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Scrollable Content Container */}
        <Box sx={{ flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ flex: "0 0 auto", padding: 2, backgroundColor: "#ffffff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)" }}>
            <Typography
              variant="h5"
              sx={{
                marginBottom: 0,
                marginTop: 0,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              Place Suspension Intervals
            </Typography>
          </Box>

          {/* Task Info */}
          {suspensionConfig.tasks.map((taskSpec) => {
            const task = puzzleTasks.find((t) => t.id === taskSpec.taskId);
            const taskIntervals = userIntervalsByTask[taskSpec.taskId] || [];
            const taskTotalSuspension = taskIntervals.reduce((sum, interval) => {
              return sum + (Math.max(0, interval.end - interval.start));
            }, 0);

            return (
              <Box key={taskSpec.taskId} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Paper
                  sx={{
                    padding: 2,
                    backgroundColor: task?.color
                      ? `${task.color}15`
                      : "#f5f5f5",
                    border: `2px solid ${task?.color || "#ccc"}`,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Task: {task?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Total Suspension Time (S):</strong> {taskSpec.totalSuspension}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Number of Intervals:</strong> {taskSpec.numIntervals}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Your Current Total:</strong> {taskTotalSuspension} / {taskSpec.totalSuspension}
                  </Typography>

                  {/* Progress bar */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 8,
                      backgroundColor: "#e0e0e0",
                      borderRadius: 1,
                      marginTop: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        backgroundColor: task?.color || "#1976d2",
                        width: `${(taskTotalSuspension / taskSpec.totalSuspension) * 100}%`,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Paper>

                <Accordion defaultExpanded={true}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: task?.color ? `${task.color}20` : "#f5f5f5",
                      border: `2px solid ${task?.color || "#ccc"}`,
                      borderRadius: "4px 4px 0 0",
                      marginBottom: 0,
                      "&.Mui-expanded": {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: task?.color || "#1976d2",
                      }}
                    >
                      {task?.name} - Intervals
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      padding: 2,
                      backgroundColor: "#fafafa",
                      borderLeft: `2px solid ${task?.color || "#ccc"}`,
                      borderRight: `2px solid ${task?.color || "#ccc"}`,
                      borderBottom: `2px solid ${task?.color || "#ccc"}`,
                      borderBottomLeftRadius: "4px",
                      borderBottomRightRadius: "4px",
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      {taskIntervals.map((interval, idx) => (
                        <Paper
                          key={`${taskSpec.taskId}-${idx}`}
                          sx={{
                            padding: 1.5,
                            marginBottom: 1.5,
                            backgroundColor: "#ffffff",
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: "#666", display: "block", marginBottom: 1 }}
                          >
                            Interval {idx + 1}
                          </Typography>

                          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                            <TextField
                              label="Start Time"
                              type="number"
                              value={interval.start}
                              onChange={(e) =>
                                handleIntervalChange(taskSpec.taskId, idx, "start", e.target.value)
                              }
                              inputProps={{ min: 0 }}
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#ffffff",
                                },
                              }}
                            />
                            <TextField
                              label="End Time"
                              type="number"
                              value={interval.end}
                              onChange={(e) =>
                                handleIntervalChange(taskSpec.taskId, idx, "end", e.target.value)
                              }
                              inputProps={{ min: 0 }}
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#ffffff",
                                },
                              }}
                            />
                          </Box>

                          {interval.start !== 0 || interval.end !== 0 ? (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                marginTop: 1,
                                color: "#666",
                              }}
                            >
                              Duration: {Math.max(0, interval.end - interval.start)} units
                            </Typography>
                          ) : null}
                        </Paper>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            );
          })}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Box sx={{ flex: "0 0 auto" }}>
              <Alert severity="error">
                <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                  {validationErrors.map((error, idx) => (
                    <li key={idx} style={{ fontSize: "0.875rem" }}>
                      {error}
                    </li>
                  ))}
                </ul>
              </Alert>
            </Box>
          )}
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            flex: "0 0 auto",
            padding: 2,
            backgroundColor: "#ffffff",
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            display: "flex",
            gap: 1,
          }}
        >
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
    </Box>
  );
}
