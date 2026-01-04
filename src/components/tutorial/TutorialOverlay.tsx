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
        position: "fixed",
        bottom: 40,
        left: 50,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 16,
          pointerEvents: "auto",
        }}
      >
        {/* Mr. Tau */}
        <div
          style={{
            width: 80,
            height: 80,
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <TutorialCharacter />
        </div>

        {/* Speechbubble */}
        <div
          onClick={onNext}
          style={{
            background: "rgba(180,180,180,0.85)",
            borderRadius: 12,
            width: 380,
            padding: 14,
            maxHeight: 120,
            overflowY: "auto",
            cursor: "pointer",
            userSelect: "none",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <TypewriterText text={text} />
        </div>
      </div>
    </div>
  );
}
