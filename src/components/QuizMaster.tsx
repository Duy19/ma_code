import { useState, useEffect } from "react";
import { Box, Paper, Typography, Container, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";


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
}

interface QuizMasterProps {
  question: QuizQuestion;
  onAnswer: (answerId: string, isCorrect: boolean) => void;
  onNext?: () => void;
  onRetry?: () => void;
  showExplanation?: boolean;
  isLastQuestion?: boolean;
}

type AnswerState = "idle" | "correct" | "incorrect";


export default function QuizMaster({
  question,
  onAnswer,
  onNext,
  onRetry,
  showExplanation = true,
  isLastQuestion = false,
}: QuizMasterProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [showResult, setShowResult] = useState(false);

  const selectedAnswerData = question.answers.find((a) => a.id === selectedAnswer);
  const isCorrect = selectedAnswerData?.isCorrect ?? false;

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setAnswerState("idle");
    setShowResult(false);
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
        {/* Question */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {question.question}
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

        {/* Answers */}
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
                  <Typography sx={{ flex: 1 }}>{answer.text}</Typography>
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

        {/* Confirm Button */}
        {selectedAnswer && !showResult && (
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
        {/* Explanation */}
        {showExplanation && showResult && question.explanation && (
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
            <Typography variant="body2">{question.explanation}</Typography>
          </Paper>
        )}

        {/* Next Button */}
        {showResult && onNext && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
              Next
            </Button>
          </Box>
        )}

        {/* Retry Button - only at the end */}
        {showResult && isLastQuestion && onRetry && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              sx={{ mt: 2, borderColor: "#f59e0b", color: "#f59e0b" }}
              onClick={onRetry}
            >
              Retry Quiz
            </Button>
          </Box>
        )}

        {/* Status Text */}
        {!showResult && selectedAnswer === null && (
          <Typography variant="body2" sx={{ color: "#999", textAlign: "center" }}>
            Chose an answer above and then confirm it.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
