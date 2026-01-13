import TypewriterText from "./Writer";
import TutorialCharacter from "./Character";

interface Props {
  visible: boolean;
  text: string;
  onNext: () => void;
}

export default function TutorialOverlay({ visible, text, onNext }: Props) {
  if (!visible) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 24,
        pointerEvents: "auto",
      }}
    >
      {/* Mr. Tau */}
      <div style={{ width: 80, height: 80 }}>
        <TutorialCharacter />
      </div>

      {/* Speechbubble */}
      <div
        onClick={onNext}
        style={{
          position: "relative",
          background: "rgba(223, 224, 201, 0.85)",
          borderRadius: 12,
          width: 380,
          padding: 14,
          maxHeight: 120,
          overflowY: "auto",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <TypewriterText text={text} />
      </div>
    </div>
  );
}
