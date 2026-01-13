import { FormGroup, FormControlLabel, Checkbox, Typography } from "@mui/material";
import type { Hint } from "../logic/HintManager";

interface HintCheckboxesProps {
  hints: Hint[];
  isHintAllowed: (hintId: string) => boolean;
  onToggle: (hintId: string, enabled: boolean) => void;
}

export default function HintCheckboxes({
  hints,
  isHintAllowed,
  onToggle,
}: HintCheckboxesProps) {
  return (
    <FormGroup>
      {hints.map(hint => {
        const allowed = isHintAllowed(hint.id);

        return (
          <FormControlLabel
            key={hint.id}
            control={
              <Checkbox
                checked={hint.unlocked}
                disabled={!allowed}
                onChange={(_, checked) => onToggle(hint.id, checked)}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  opacity: allowed ? 1 : 0.5,
                  fontStyle: allowed ? "normal" : "italic",
                }}
              >
                {hint.description}
              </Typography>
            }
          />
        );
      })}
    </FormGroup>
  );
}
