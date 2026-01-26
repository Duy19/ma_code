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
        position: "relative",
      }}
    >
      {/* Mr. Tau */}
      <div style={{ width: 80, height: 80, flexShrink: 0 }}>
        <TutorialCharacter />
      </div>

      {/* Speechbubble container */}
      <div style={{ position: "relative" }}>
        {/* Speechbubble */}
        <div
          onClick={onNext}
          style={{
            background: "rgba(223, 224, 201, 0.95)",
            borderRadius: "20px",
            width: 380,
            padding: "16px 18px",
            minHeight: 120,
            maxHeight: 120,
            overflowY: "auto",
            cursor: "pointer",
            userSelect: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <TypewriterText text={text} />
        </div>

        {/* Speech bubble tail - positioned outside at bottom left */}
        <svg
          style={{
            position: "absolute",
            bottom: "-32px",
            left: "-14.5px",
            width: "40px",
            height: "28px",
            pointerEvents: "none",
            transform: "rotate(40deg)",
            transformOrigin: "top right",
          }}
        >
          <path
            d="M 30,3 Q 24,4 18,4 Q 13,4 7,0 Q 10,8 14,22 L 16,22 Q 20,10 30,3 Z"
            fill="rgba(223, 224, 201, 0.95)"
          />
        </svg>
      </div>
    </div>
  );
}
