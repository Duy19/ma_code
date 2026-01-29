// @ts-nocheck
import { Button, Stack } from "@mui/material";
import type { ButtonsRenderProps } from "./types";

/**
 * Default button renderer component
 * Handles Check and Continue buttons
 */

export function ButtonsRenderer(props: ButtonsRenderProps) {
  const { onCheck, wcrtCorrect, scheduleCorrect, customCheckCorrect, onSuccess } = props;
  const anyCorrect = wcrtCorrect || scheduleCorrect || customCheckCorrect;
  
  return (
    <Stack p={2} spacing={2}>
      <Button variant="outlined" onClick={onCheck}>
        Check
      </Button>
      {anyCorrect && (
        <Button
          variant="outlined"
          sx={{ borderColor: "#2e7d32", color: "#2e7d32" }}
          onClick={onSuccess}
        >
          Continue
        </Button>
      )}
    </Stack>
  );
}
