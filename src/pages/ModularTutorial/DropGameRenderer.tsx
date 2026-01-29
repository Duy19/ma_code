// @ts-nocheck
import DropMaster from "../../components/DragDrop/DropMaster";
import type { StoryState } from "./types";

/**
 * Drop game renderer component
 * Handles Drag&Drop game display
 */

interface DropGameRendererProps {
  cumulativeState: StoryState;
  onDropGameComplete: () => void;
}

export function DropGameRenderer({ cumulativeState, onDropGameComplete }: DropGameRendererProps) {
  if (!cumulativeState.showDropGame || cumulativeState.dropGameVaultIds.length === 0) {
    return null;
  }

  return (
    <DropMaster
      vaultIds={cumulativeState.dropGameVaultIds}
      onComplete={onDropGameComplete}
    />
  );
}
