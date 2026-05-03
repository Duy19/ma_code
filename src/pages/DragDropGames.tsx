import { useMemo, useState } from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { ModularTutorialTemplate } from "./ModularTutorialTemplate";
import type { StoryStep } from "./ModularTutorial/types";

type ChapterTopic = "chapter1" | "chapter2" | "chapter3";

// Topics for selection. Add/remove IDs here as content grows.
const DROP_VAULT_IDS_BY_TOPIC: Record<ChapterTopic, string[]> = {
  chapter1: [],
  chapter2: ["taskutil", "tda", "llub", "hyperbound"],
  chapter3: [],
};

const TOPIC_LABELS: Record<ChapterTopic, string> = {
  chapter1: "Chapter 1",
  chapter2: "Chapter 2",
  chapter3: "Chapter 3",
};

export default function DragDropGames() {
  const [selectedTopic, setSelectedTopic] = useState<ChapterTopic>("chapter2");

  const selectedVaultIds = DROP_VAULT_IDS_BY_TOPIC[selectedTopic];
  const hasDropContent = selectedVaultIds.length > 0;

  const story: StoryStep[] = useMemo(() => {
    if (!hasDropContent) {
      return [
        {
          text: `${TOPIC_LABELS[selectedTopic]} has no drag-and-drop content yet. Add IDs in DROP_VAULT_IDS_BY_TOPIC later.`,
          showDropGame: false,
          showCanvas: false,
          showSidebar: false,
          showButtons: false,
          showOverlay: false,
        },
      ];
    }

    return [
      {
        text: `Drag & Drop topic: ${TOPIC_LABELS[selectedTopic]}`,
        showDropGame: true,
        dropGameVaultIds: selectedVaultIds,
        showOverlay: false,
        showCanvas: false,
        showSidebar: false,
        showButtons: false,
      },
    ];
  }, [hasDropContent, selectedTopic, selectedVaultIds]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Drag & Drop Topics
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Choose a chapter topic. You can extend the vault IDs per chapter in this page later.
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {(Object.keys(TOPIC_LABELS) as ChapterTopic[]).map((topic) => {
              const isSelected = topic === selectedTopic;
              const count = DROP_VAULT_IDS_BY_TOPIC[topic].length;

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

          {!hasDropContent && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              No drag-and-drop content mapped yet for {TOPIC_LABELS[selectedTopic]}.
            </Typography>
          )}
        </Paper>
      </Container>

      <ModularTutorialTemplate
        key={`drop-topic-${selectedTopic}`}
        story={story}
        baseTasks={[]}
        hyperperiod={0}
        interval={[0, 0]}
        algorithm={() => ({ schedule: [], jobInstancesPerTask: new Map() })}
        defaultAlgorithm=""
        showOverlay={false}
        showSidebar={false}
        showButtons={false}
        canvasMode="default"
      />
    </Box>
  );
}
