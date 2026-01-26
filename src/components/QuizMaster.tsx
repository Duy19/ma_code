import { useState, useEffect } from "react";
import { Box, Paper, Typography, Container, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { Task } from "../core/task";
import { renderWithMath } from "../utils/formulas";

// How an answer looks like (explanation not used yet)
export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

// How a question looks like (Optional explanation after answer and difficulty level)
export interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
  difficulty?: "easy" | "medium" | "hard";
  explanation?: string;
  visualContent?: QuizVisualContent;
}

// Visual content for a question, which can be a canvas, image, or nothing
export interface QuizVisualContent {
  type: "canvas" | "image" | "none";
  // For canvas
  tasks?: Task[];
  canvasMode?: "interactive" | "default";
  // Which algorithm to use (e.g., "RM", "DM", "EDF")
  algorithm?: string; 
  hyperperiod?: number;
  // For image
  imageUrl?: string;
  imageAlt?: string;
  // Only one of the above can be used based on type and will be checked later
}

interface QuizMasterProps {
  question: QuizQuestion;
  onAnswer: (answerId: string, isCorrect: boolean) => void;
  onNext?: () => void;
  onRetry?: () => void;
  showExplanation?: boolean;
  isLastQuestion?: boolean;
  renderCanvas?: (tasks: Task[], canvasMode: "interactive" | "default", hyperperiod: number, algorithm?: string) => React.ReactNode;
}

type AnswerState = "idle" | "correct" | "incorrect";


export default function QuizMaster({
  question,
  onAnswer,
  onNext,
  onRetry,
  showExplanation = true,
  isLastQuestion = false,
  renderCanvas,
}: QuizMasterProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [showResult, setShowResult] = useState(false);

  // Start with question view, toggle to visual view on click
  const [showVisual, setShowVisual] = useState(false);

  const selectedAnswerData = question.answers.find((a) => a.id === selectedAnswer);
  const isCorrect = selectedAnswerData?.isCorrect ?? false;

  // Check if visual content exists
  const hasVisualContent = question.visualContent && question.visualContent.type !== "none";
  const isCanvasVisual = question.visualContent?.type === "canvas";
  const isImageVisual = question.visualContent?.type === "image";

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setAnswerState("idle");
    setShowResult(false);
    setShowVisual(false);
  }, [question.id]);

  // Handle selecting an answer but not confirming it yet
  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return; 
    setSelectedAnswer(answerId);
  };

  // Handle confirming the selected answer and providing feedback
  const confirmAnswer = (answerId: string) => {
    // Prevent changing answer after submission
    if (answerState !== "idle") return;

    // Set selected answer and check in question.answers (from questions.ts) if correct
    setSelectedAnswer(answerId);
    const answer = question.answers.find((a) => a.id === answerId);
    const correct = answer?.isCorrect ?? false;

    // Visual feedback
    const newState = correct ? "correct" : "incorrect";
    setAnswerState(newState);
    setShowResult(true);

    // Callback
    onAnswer(answerId, correct);

    // Auto-hide feedback after delay
    setTimeout(() => {
      if (correct) {
        setAnswerState("idle");
      }
    }, 1500);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setAnswerState("idle");
    setShowResult(false);
    onNext?.();
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Question and visual content are rendered here (with toggle if both exist) */}
        {hasVisualContent && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Toggle button if visual content exists (positioned on the right) */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => setShowVisual(!showVisual)}
                sx={{ textTransform: "none", fontSize: "0.9rem" }}
              >
                {showVisual ? "Show Question" : "Show Visual"}
              </Button>
            </Box>

            {/* Rendering Canvas if visual content is of type canvas */}
            {isCanvasVisual && showVisual && question.visualContent?.tasks && (
              <Box>
                {renderCanvas ? (
                  renderCanvas(
                    question.visualContent.tasks,
                    question.visualContent.canvasMode || "default",
                    question.visualContent.hyperperiod || 0,
                    question.visualContent.algorithm
                  )
                ) : (
                  <Typography color="textSecondary">Canvas content requires renderCanvas prop</Typography>
                )}
              </Box>
            )}

            {/* Rendering Image if visual content is of type image */}
            {isImageVisual && showVisual && question.visualContent?.imageUrl && (
              <Box sx={{ borderRadius: 1, overflow: "hidden", maxHeight: "400px" }}>
                <img
                  src={question.visualContent.imageUrl}
                  alt={question.visualContent.imageAlt || "No Picture added"}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            )}

            {/* Show question when not showing visual */}
            {!showVisual && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {renderWithMath(question.question)}
                  </Typography>
                  {/* Show difficulty badge if difficulty is set */}
                  {question.difficulty && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor:
                          question.difficulty === "easy"
                            ? "#c8e6c9"
                            : question.difficulty === "medium"
                              ? "#ffe0b2"
                              : "#ffccbc",
                        color:
                          question.difficulty === "easy"
                            ? "#2e7d32"
                            : question.difficulty === "medium"
                              ? "#e65100"
                              : "#d84315",
                        fontSize: "0.75em",
                        fontWeight: 600,
                      }}
                    >
                      {question.difficulty === "easy"
                        ? "Easy"
                        : question.difficulty === "medium"
                          ? "Medium"
                          : "Hard"}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Question, shown if no visual content is set or when visual is hidden */}
        {!hasVisualContent && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {renderWithMath(question.question)}
              </Typography>
              {/* Show difficulty badge if difficulty is set */}
              {question.difficulty && (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor:
                      question.difficulty === "easy"
                        ? "#c8e6c9"
                        : question.difficulty === "medium"
                          ? "#ffe0b2"
                          : "#ffccbc",
                    color:
                      question.difficulty === "easy"
                        ? "#2e7d32"
                        : question.difficulty === "medium"
                          ? "#e65100"
                          : "#d84315",
                    fontSize: "0.75em",
                    fontWeight: 600,
                  }}
                >
                  {question.difficulty === "easy"
                    ? "Easy"
                    : question.difficulty === "medium"
                      ? "Medium"
                      : "Hard"}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Answers */}
        {(!hasVisualContent || !showVisual) && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {/* Map through answers and display them in a grid (there is no minimum or limit required for answers)*/}
          {question.answers.map((answer) => {
            {/* Layout/Look of the boxes in the grid */}
            const isSelected = selectedAnswer === answer.id;
            let bgColor = "#fff";
            let borderColor = "#e0e0e0";
            let textColor = "#000";

            {/* Change colors based on selection and correctness */}
            if (isSelected && showResult) {
              if (isCorrect) {
                bgColor = "#e8f5e9";
                borderColor = "#4caf50";
                textColor = "#1b5e20";
              } else {
                bgColor = "#ffebee";
                borderColor = "#f44336";
                textColor = "#b71c1c";
              }
            } else if (isSelected) {
              bgColor = "#e3f2fd";
              borderColor = "#2196f3";
            }

            {/* Return the styled answer boxes and add animations and correct/wrong icon to it */}
            return (
              <Paper
                key={answer.id}
                onClick={() => handleSelectAnswer(answer.id)}
                sx={{
                  p: 3,
                  cursor: answerState === "idle" ? "pointer" : "default",
                  border: "2px solid",
                  borderColor,
                  backgroundColor: bgColor,
                  color: textColor,
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: "1.1em",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "100px",
                  position: "relative",
                  animation:
                    isSelected && showResult
                      ? isCorrect
                        ? "correctFlash 0.6s ease-out"
                        : "incorrectShake 0.6s ease-out"
                      : "none",
                   "@keyframes correctFlash": {
                    "0%": { backgroundColor: "#fff9c4", borderColor: "#fbc02d" },
                    "50%": { backgroundColor: "#e8f5e9", borderColor: "#4caf50" },
                    "100%": { backgroundColor: "#e8f5e9", borderColor: "#4caf50" },
                  },
                  "@keyframes incorrectShake": {
                    "0%, 100%": { transform: "translateX(0)" },
                    "25%": { transform: "translateX(-10px)" },
                    "75%": { transform: "translateX(10px)" },
                  }, 
                  "&:hover": {
                    boxShadow: answerState === "idle" ? 3 : 0,
                    transform: answerState === "idle" && !isSelected ? "translateY(-2px)" : "none",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                  <Typography sx={{ flex: 1 }}>{renderWithMath(answer.text)}</Typography>
                  {isSelected && showResult && (
                    <Box>
                      {isCorrect ? (
                        <CheckCircleIcon sx={{ fontSize: 32, color: "#4caf50" }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 32, color: "#f44336" }} />
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
        )}

        {/* Confirm Button, only show when not displaying visual content */}
        {(!hasVisualContent || !showVisual) && selectedAnswer && !showResult && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() =>confirmAnswer(selectedAnswer)}
            >
              Confirm
            </Button>
          </Box>
        )}
        {/* Explanation, only show when not displaying visual content */}
        {(!hasVisualContent || !showVisual) && showExplanation && showResult && question.explanation && (
          <Paper
            sx={{
              p: 3,
              backgroundColor: isCorrect ? "#e8f5e9" : "#fff3e0",
              borderLeft: `4px solid ${isCorrect ? "#4caf50" : "#ff9800"}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {isCorrect ? "✓ Correct!" : "✗ Wrong"}
            </Typography>
            <Typography variant="body2">{renderWithMath(question.explanation)}</Typography>
          </Paper>
        )}

        {/* Next and Retry Buttons, only show when not displaying visual content */}
        {(!hasVisualContent || !showVisual) && showResult && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            {isLastQuestion && onRetry ? (
              <Button
                variant="outlined"
                sx={{ borderColor: "#622da8", color: "#78194a" }}
                onClick={onRetry}
              >
                Retry Quiz
              </Button>
            ) : (
              <Box />
            )}
            {onNext && (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        )}

        {/* Status Text, only show when not displaying visual content */}
        {(!hasVisualContent || !showVisual) && !showResult && selectedAnswer === null && (
          <Typography variant="body2" sx={{ color: "#999", textAlign: "center" }}>
            Chose an answer above and then confirm it.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
