import { useState, type ReactNode } from "react";

export interface Definition {
  term: string;
  definition: string;
}

interface DefinitionsBoxProps {
  definitions?: Definition[];
  customContent?: ReactNode;
  title?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function DefinitionsBox({
  definitions = [],
  customContent,
  title = "Definitions",
  onCollapsedChange,
}: DefinitionsBoxProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <div
      style={{
        flex: "0 0 20%",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column-reverse",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#f5f5f5",
          cursor: "pointer",
          userSelect: "none",
          fontWeight: 600,
          fontSize: "14px",
        }}
        onClick={handleToggle}
      >
        <span>{title}</span>
        <span style={{ fontSize: "12px", color: "#666" }}>
          {collapsed ? "▼" : "▲"}
        </span>
      </div>

      {/* Content - expands from bottom when not collapsed */}
      {!collapsed && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          {customContent ? (
            customContent
          ) : (
            <div>
              {definitions.map((def, index) => (
                <div key={index} style={{ marginBottom: "12px" }}>
                  <strong>{def.term}:</strong>
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                      color: "#555",
                    }}
                  >
                    {def.definition}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
