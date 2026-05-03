import { useMemo, useState } from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";
import { simulateRM, simulateDM, simulateEDF } from "../logic/simulator";

type ChapterTopic = "chapter1" | "chapter2" | "chapter3";

// Topics for quiz Selection. Add/remove IDs here as content grows.
const QUIZ_QUESTION_IDS_BY_TOPIC: Record<ChapterTopic, string[]> = {
  chapter1: ["c1_q1", "c1_q2", "c1_q3", "c1_q4", "c1_q5"],
  // Mirrors Chapter2_Quiz examples.
  chapter2: ["c2b_q1", "c2b_q2", "c2b_q3"],
  chapter3: ["c3_q1", "c3_q2", "c3_q3", "c3_q4"],
};

const TOPIC_LABELS: Record<ChapterTopic, string> = {
  chapter1: "Chapter 1",
  chapter2: "Chapter 2",
  chapter3: "Chapter 3",
};

export default function Quizzes() {
  const [selectedTopic, setSelectedTopic] = useState<ChapterTopic>("chapter1");

  const selectedQuestionIds = QUIZ_QUESTION_IDS_BY_TOPIC[selectedTopic];
  const hasQuestions = selectedQuestionIds.length > 0;

  const story: StoryStep[] = useMemo(() => {
    if (!hasQuestions) {
      return [
        {
          text: `${TOPIC_LABELS[selectedTopic]} has no quiz questions yet. Add IDs in QUIZ_QUESTION_IDS_BY_TOPIC later.`,
          showQuiz: false,
          showCanvas: false,
          showSidebar: false,
          showButtons: false,
          showOverlay: false,
        },
      ];
    }

    return [
      {
        text: `Quiz topic: ${TOPIC_LABELS[selectedTopic]}`,
        showQuiz: true,
        quizQuestionIds: selectedQuestionIds,
        showCanvas: false,
        showOverlay: false,
        showSidebar: false,
        showButtons: false,
      },
    ];
  }, [hasQuestions, selectedQuestionIds, selectedTopic]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Quiz Topics
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Choose a chapter topic. You can extend the question IDs per chapter in this page later.
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {(Object.keys(TOPIC_LABELS) as ChapterTopic[]).map((topic) => {
              const isSelected = topic === selectedTopic;
              const count = QUIZ_QUESTION_IDS_BY_TOPIC[topic].length;

              return (
                <Button
                  key={topic}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => setSelectedTopic(topic)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {TOPIC_LABELS[topic]} ({count})
                </Button>
              );
            })}
          </Box>

          {!hasQuestions && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              No quiz content mapped yet for {TOPIC_LABELS[selectedTopic]}.
            </Typography>
          )}
        </Paper>
      </Container>

      <ModularTutorialTemplate
        key={`quiz-topic-${selectedTopic}`}
        story={story}
        baseTasks={[]}
        hyperperiod={0}
        interval={[0, 0]}
        algorithms={{
          RM: simulateRM,
          DM: simulateDM,
          EDF: simulateEDF,
        }}
        defaultAlgorithm="RM"
        showOverlay={false}
        showSidebar={false}
        showButtons={false}
        canvasMode="default"
      />
    </Box>
  );
}
