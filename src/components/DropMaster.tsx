import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { DropMasterVault, type Vault, type DraggableObject, type DropSlot } from "../assets/dropGame";
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Drag&Drop Game Component using dnd-kit (https://dndkit.com/)

// Function to define Draggable Card Component
function DraggableCard({ item, isAssigned }: { item: DraggableObject; isAssigned: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { type: item.type },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    border: "1px solid #cbd5e1",
    background: isAssigned ? "#f1f5f9" : "#ffffff",
    color: "#0f172a",
    padding: "10px 12px",
    borderRadius: 8,
    boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,0.15)" : "0 2px 6px rgba(0,0,0,0.08)",
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isAssigned ? 0.65 : 1,
    transition: "box-shadow 150ms ease, transform 150ms ease",
    minWidth: 120,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} aria-label={`Drag ${item.label}`}>
      <div style={{ fontWeight: 700 }}><InlineMath math={item.label} /></div>
      {item.detail && <div style={{ fontSize: 12, color: "#475569" }}><InlineMath math={item.detail} /></div>}
    </div>
  );
}


// Function to define Drop Zones for the Drag&Drop Game
function DropZone({ slot, placed }: { slot: DropSlot; placed?: DraggableObject }) {
  const { isOver, setNodeRef } = useDroppable({
    id: slot.id,
    data: { accepts: slot.accepts },
  });

  const style: CSSProperties = {
    border: "3px dashed #94a3b8",
    background: isOver ? "#e0f2fe" : "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    minHeight: 50,
    maxHeight: 60,
    minWidth: 140,
    borderRadius: 12,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    transition: "background 120ms ease, border-color 120ms ease",
  };

  return (
    <div ref={setNodeRef} style={style} aria-label={`Drop zone for ${slot.label}`}>
      <div style={{ fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase", color: "#cbd5e1" }}><InlineMath math={slot.label} /></div>
      <div style={{ fontWeight: 700, color: placed ? "#0f172a" : "#94a3b8", background: placed ? "#e2e8f0" : "transparent", padding: placed ? "4px 10px" : 0, borderRadius: placed ? 8 : 0 }}>
        {placed ? <InlineMath math={placed.label} /> : "Drop here"}
      </div>
      {!placed && slot.helper && <div style={{ fontSize: 12, color: "#94a3b8" }}><InlineMath math={slot.helper} /></div>}
    </div>
  );
}

interface DropMasterProps {
  vaultIds?: string[];
}


// Main DropMaster Component which accepts optional vault IDs to choose specific options from dropGame.ts
export default function DropMaster({ vaultIds = [] }: DropMasterProps) {
  // Checking which vaults are available based on provided IDs
  const availableVaults = useMemo(() => {
    if (vaultIds.length === 0) {
      return DropMasterVault;
    }
    return DropMasterVault.filter(vault => vaultIds.includes(vault.id));
  }, [vaultIds]);

  // State to track current scenario, active dragged item, and assignments
  const [scenarioId, setScenarioId] = useState<string>(availableVaults[0]?.id ?? DropMasterVault[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);

  const scenario = useMemo(() => availableVaults.find(s => s.id === scenarioId) ?? availableVaults[0], [scenarioId, availableVaults]);

  // State to track assignments of draggable items to drop slots
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    scenario.slots.forEach(slot => {
      initial[slot.id] = null;
    });
    return initial;
  });

  useEffect(() => {
    const next: Record<string, string | null> = {};
    scenario.slots.forEach(slot => {
      next[slot.id] = null;
    });
    setAssignments(next);
    setActiveId(null);
  }, [scenario]);

  // Function to reset the board
  const resetBoard = () => {
    const next: Record<string, string | null> = {};
    scenario.slots.forEach(slot => {
      next[slot.id] = null;
    });
    setAssignments(next);
    setActiveId(null);
  };

  // Function to get the placed item for a specific slot
  const placedItemForSlot = (slotId: string) => scenario.items.find(item => assignments[slotId] === item.id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };


  // Function to handle the end of a drag event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeType = active.data.current?.type as string | undefined;
    const slot = scenario.slots.find(s => s.id === over.id);
    if (!slot || !activeType || !slot.accepts.includes(activeType)) return;

    const draggedId = active.id as string;
    setAssignments(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key] === draggedId) next[key] = null;
      });
      next[slot.id] = draggedId;
      return next;
    });
  };

  // Memoized values for assignment checks
  const assignmentValues = useMemo(() => Object.values(assignments), [assignments]);
  const assignedIds = useMemo(
    () => new Set(assignmentValues.filter(Boolean) as string[]),
    [assignmentValues],
  );

  // Check if all slots are filled
  const isComplete = scenario.slots.every(slot => assignments[slot.id]);

  const activeItem = scenario.items.find(i => i.id === activeId);

  const body = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 20 }}>
        {scenario.segments.map((segment, idx) => {
          if (segment.kind === "text") {
            return (
              <div key={`${segment.value}-${idx}`} style={{ color: "#0f172a", fontWeight: 700 }}>
                <InlineMath math={segment.value} />
              </div>
            );
          }
          const slot = scenario.slots.find(s => s.id === segment.slotId)!;
          return <DropZone key={slot.id} slot={slot} placed={placedItemForSlot(slot.id)} />;
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {availableVaults.map(s => (
          <button
            key={s.id}
            onClick={() => setScenarioId(s.id)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: s.id === scenario.id ? "2px solid #2563eb" : "1px solid #cbd5e1",
              background: s.id === scenario.id ? "#eff6ff" : "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {s.title}
          </button>
        ))}
        <button
          onClick={resetBoard}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            cursor: "pointer",
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{scenario.title}</div>
        <div style={{ color: "#475569" }}>{scenario.prompt}</div>
        {isComplete && <div style={{ color: "#16a34a", fontWeight: 700 }}>All slots are filled. Great job!</div>}
      </div>

      {/* Drag and Drop Context */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {body}

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Available pieces</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {scenario.items.map(item => (
              <DraggableCard key={item.id} item={item} isAssigned={assignedIds.has(item.id)} />
            ))}
            {isComplete && <div style={{ color: "#16a34a", fontWeight: 600 }}>Every slot has a match.</div>}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem ? <DraggableCard item={activeItem} isAssigned={false} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}