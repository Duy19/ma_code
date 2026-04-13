import type { DifficultyLevel } from "../../../logic/taskGenConfigs";



// Detective Game UI Parts for taskgen
interface TaskGenPuzzleOverlayProps {
  selectedDifficulty: DifficultyLevel;
  setSelectedDifficulty: (difficulty: DifficultyLevel) => void;
  onConfirmDifficulty: () => void;
  isGenerating: boolean;
  hasTaskset: boolean;
  currentPuzzleDifficulty: number | null;
  errorText: string;
}

export function TaskGenPuzzleOverlay({
  selectedDifficulty,
  setSelectedDifficulty,
  onConfirmDifficulty,
  isGenerating,
  hasTaskset,
  currentPuzzleDifficulty,
  errorText,
}: TaskGenPuzzleOverlayProps) {
  return (
    <div
      style={{
        width: "min(840px, 100%)",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
        padding: 18,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, color: "#0f172a" }}>Detective Taskset Generator</h3>
        <button
          type="button"
          onClick={onConfirmDifficulty}
          disabled={isGenerating}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            color: "#fff",
            background: isGenerating ? "#94a3b8" : "#0f766e",
            cursor: isGenerating ? "not-allowed" : "pointer",
          }}
        >
          {isGenerating
            ? "Generating with GA..."
            : hasTaskset
              ? "Generate New Taskset"
              : "Generate Taskset"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setSelectedDifficulty("easy")}
          style={{
            padding: "9px 12px",
            borderRadius: 10,
            border: selectedDifficulty === "easy" ? "2px solid #16a34a" : "1px solid #cbd5e1",
            background: selectedDifficulty === "easy" ? "#ecfdf3" : "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Easy 1-2
        </button>
        <button
          type="button"
          onClick={() => setSelectedDifficulty("medium")}
          style={{
            padding: "9px 12px",
            borderRadius: 10,
            border: selectedDifficulty === "medium" ? "2px solid #d97706" : "1px solid #cbd5e1",
            background: selectedDifficulty === "medium" ? "#fffbeb" : "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Medium 2-4
        </button>
        <button
          type="button"
          onClick={() => setSelectedDifficulty("hard")}
          style={{
            padding: "9px 12px",
            borderRadius: 10,
            border: selectedDifficulty === "hard" ? "2px solid #dc2626" : "1px solid #cbd5e1",
            background: selectedDifficulty === "hard" ? "#fef2f2" : "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Hard 4-5
        </button>
      </div>

      <p style={{ margin: 0, color: "#334155" }}>
        {hasTaskset
          ? `Current puzzle: ${selectedDifficulty.toUpperCase()}${currentPuzzleDifficulty !== null ? ` (${currentPuzzleDifficulty.toFixed(1)}/5)` : ""} | Genetic Algorithm`
          : "No taskset generated yet. Choose options and click Generate Taskset."}
      </p>

      {errorText && <p style={{ margin: 0, color: "#b91c1c" }}>{errorText}</p>}
    </div>
  );
}
