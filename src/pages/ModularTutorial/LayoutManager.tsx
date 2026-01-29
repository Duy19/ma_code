// @ts-nocheck
import { Button } from "@mui/material";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import HintCheckboxes from "../../components/General/HintCheckboxes";
import DefinitionsBox, { type Definition } from "../../components/General/DefinitionsBox";
import { SummaryContent } from "../../components/Summary/summary";
import type { StoryState, StoryStep, OverlayRenderProps, CanvasRenderProps, SidebarRenderProps, ButtonsRenderProps, DefinitionsRenderProps } from "./types";
import type { Hint } from "../../logic/HintManager";
import { CanvasRenderer } from "./CanvasRenderer";
import { SidebarRenderer } from "./SidebarRenderer";
import { ButtonsRenderer } from "./ButtonsRenderer";
import { QuizRenderer } from "./QuizRenderer";
import { DropGameRenderer } from "./DropGameRenderer";

/**
 * Layout manager for the tutorial template
 * Handles standard and interactive layout modes
 */

interface LayoutManagerProps {
  // State
  cumulativeState: StoryState;
  currentStep: StoryStep;
  step: number;
  storyLength: number;
  
  // Handlers
  onPreviousStep: () => void;
  onNextStep: (overrideQuizCompleted?: boolean, overrideDropGameCompleted?: boolean) => void;
  
  // Render props
  canvasRenderProps: CanvasRenderProps;
  sidebarRenderProps: SidebarRenderProps;
  buttonsRenderProps: ButtonsRenderProps;
  
  // Custom renderers (optional)
  renderOverlay?: (props: OverlayRenderProps) => React.ReactNode;
  renderCanvas?: (props: CanvasRenderProps) => React.ReactNode;
  renderSidebar?: (props: SidebarRenderProps) => React.ReactNode;
  renderButtons?: (props: ButtonsRenderProps) => React.ReactNode;
  renderDefinitions?: (props: DefinitionsRenderProps) => React.ReactNode;
  
  // Additional props
  hints: Hint[];
  isHintAllowed: (hintId: string) => boolean;
  onToggleHint: (hintId: string, enabled: boolean) => void;
  definitions?: Definition[];
  definitionsTitle?: string;
  onDefinitionsCollapsedChange: (collapsed: boolean) => void;
  summaryDescriptionVariant: 'body1' | 'body2' | 'h6' | 'h5' | 'h4';
  summaryContentVariant: 'body1' | 'body2' | 'h6' | 'h5' | 'h4';
  
  // Sidebar specific
  currentTasks: any[];
  effectiveSidebarVisibleFields: string[];
  effectiveSidebarEditableFields: string[];
  onTasksChange: (tasks: any[]) => void;
  onAlgorithmChange: (algorithm: string) => void;
  
  // Quiz specific
  currentQuizQuestion: number;
  onQuizQuestionChange: (index: number) => void;
  onQuizComplete: () => void;
  quizRendererProps: any;
  
  // Drop game specific
  onDropGameComplete: () => void;
  
  // Canvas visibility
  visibilityDefaultCanvas: {
    showReleaseMarkersDefault: boolean;
    showDeadlineMarkersDefault: boolean;
  };
}

export function LayoutManager({
  cumulativeState,
  currentStep,
  step,
  storyLength,
  onPreviousStep,
  onNextStep,
  canvasRenderProps,
  sidebarRenderProps,
  buttonsRenderProps,
  renderOverlay,
  renderCanvas,
  renderSidebar,
  renderButtons,
  renderDefinitions,
  hints,
  isHintAllowed,
  onToggleHint,
  definitions,
  definitionsTitle,
  onDefinitionsCollapsedChange,
  summaryDescriptionVariant,
  summaryContentVariant,
  currentTasks,
  effectiveSidebarVisibleFields,
  effectiveSidebarEditableFields,
  onTasksChange,
  onAlgorithmChange,
  currentQuizQuestion,
  onQuizQuestionChange,
  onQuizComplete,
  quizRendererProps,
  onDropGameComplete,
  visibilityDefaultCanvas,
}: LayoutManagerProps) {
  
  if (cumulativeState.layoutStyle === "standard") {
    return (
      <div style={{ display: "flex", height: "100%", flexDirection: "row", position: "relative" }}>
        {/* Navigation buttons - hidden for now but functionality in place */}
        <div style={{ position: "absolute", top: 20, left: 40, zIndex: 10, display: "none", gap: 6 }}>
          <Button
            onClick={onPreviousStep}
            disabled={step === 0}
            sx={{
              backgroundColor: "#622da8",
              color: "#fff",
              padding: "4px 6px",
              minWidth: "24px",
              minHeight: "24px",
              fontSize: "14px",
              textTransform: "none",
              borderRadius: "4px",
              transition: "all 0.2s ease",
              "&:hover:not(:disabled)": {
                backgroundColor: "#78194a",
                boxShadow: "0 2px 8px rgba(98, 45, 168, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#999",
              },
            }}
          >
            &lt;
          </Button>
          <Button
            onClick={() => onNextStep()}
            sx={{
              backgroundColor: "#622da8",
              color: "#fff",
              padding: "4px 6px",
              minWidth: "24px",
              minHeight: "24px",
              fontSize: "14px",
              textTransform: "none",
              borderRadius: "4px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#78194a",
                boxShadow: "0 2px 8px rgba(98, 45, 168, 0.3)",
              },
            }}
          >
            &gt;
          </Button>
        </div>

        {/* Left side: Canvas + Overlay + Definitions (80% width) */}
        <div style={{ flex: "0 0 80%", display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Overlay section */}
          {cumulativeState.showOverlay && (
            <div
              style={{
                flex: "0 0 25%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                paddingLeft: 40,
                paddingRight: 40,
                paddingTop: 20,
                gap: 40,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                {renderOverlay ? (
                  renderOverlay({
                    text: currentStep?.text || "",
                    onNext: onNextStep,
                    step,
                    totalSteps: storyLength,
                  })
                ) : (
                  <>
                    <TutorialOverlay
                      visible
                      text={currentStep?.text || ""}
                      onNext={onNextStep}
                    />
                    {cumulativeState.renderCompanion && cumulativeState.renderCompanion({
                      text: currentStep?.text || "",
                      onNext: onNextStep,
                      step,
                      totalSteps: storyLength,
                    })}
                  </>
                )}

                {/* Hint checkboxes */}
                {cumulativeState.showHintCheckboxes && (
                  <HintCheckboxes
                    hints={hints}
                    isHintAllowed={isHintAllowed}
                    onToggle={onToggleHint}
                  />
                )}
              </div>

              {/* Definitions box - positioned on the right */}
              {cumulativeState.showDefinitions && (
                renderDefinitions ? (
                  renderDefinitions({ definitions })
                ) : (
                  <DefinitionsBox
                    definitions={definitions}
                    title={definitionsTitle}
                    onCollapsedChange={onDefinitionsCollapsedChange}
                  />
                )
              )}
            </div>
          )}

          {/* Canvas section */}
          {cumulativeState.showCanvas && (
            <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20, paddingRight: 8 }}>
              {renderCanvas ? 
                renderCanvas(canvasRenderProps) : 
                <CanvasRenderer canvasRenderProps={canvasRenderProps} visibilityDefaultCanvas={visibilityDefaultCanvas} />
              }
            </div>
          )}

          {/* Quiz section */}
          {cumulativeState.showQuiz && cumulativeState.quizQuestionIds.length > 0 && (
            <div style={{ flex: 1, paddingLeft: 150, paddingBottom: 20, paddingRight: 40, marginTop: -60 }}>
              <QuizRenderer
                {...quizRendererProps}
                cumulativeState={cumulativeState}
                currentQuizQuestion={currentQuizQuestion}
                onQuizQuestionChange={onQuizQuestionChange}
                onQuizComplete={onQuizComplete}
                onNextStep={onNextStep}
                visibilityDefaultCanvas={visibilityDefaultCanvas}
              />
            </div>
          )}

          {/* DropMaster section */}
          {cumulativeState.showDropGame && cumulativeState.dropGameVaultIds.length > 0 && (
            <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20, paddingRight: 8 }}>
              <DropGameRenderer
                cumulativeState={cumulativeState}
                onDropGameComplete={onDropGameComplete}
              />
            </div>
          )}

          {/* Summary box */}
          {cumulativeState.showSummary && cumulativeState.summaryIds.length > 0 && (
            <div style={{ flex: 1, paddingLeft: 24, paddingBottom: 20, paddingRight: 8, paddingTop: 20 }}>
              <SummaryContent
                ids={cumulativeState.summaryIds}
                descriptionVariant={summaryDescriptionVariant}
                contentVariant={summaryContentVariant}
              />
            </div>
          )}
        </div>

        {/* Right side: Buttons (sticky) + Sidebar (20% width) */}
        <div
          style={{
            flex: "0 0 20%",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            padding: 8,
            height: "100%",
            borderLeft: "1px solid #e0e0e0",
          }}
        >
          {/* Buttons section - sticky at top */}
          {cumulativeState.showButtons && (
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                borderBottom: "1px solid #e0e0e0",
                paddingBottom: 8,
                background: "#ffffff",
              }}
            >
              {renderButtons ? 
                renderButtons(buttonsRenderProps) : 
                <ButtonsRenderer {...buttonsRenderProps} />
              }
            </div>
          )}

          {/* Sidebar section - scrollable */}
          {cumulativeState.showSidebar && (
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, marginTop: 12 }}>
              {renderSidebar ? 
                renderSidebar(sidebarRenderProps) : 
                <SidebarRenderer
                  sidebarRenderProps={sidebarRenderProps}
                  currentTasks={currentTasks}
                  cumulativeState={cumulativeState}
                  effectiveSidebarVisibleFields={effectiveSidebarVisibleFields}
                  effectiveSidebarEditableFields={effectiveSidebarEditableFields}
                  onTasksChange={onTasksChange}
                  onAlgorithmChange={onAlgorithmChange}
                />
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interactive layout (minimal UI)
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          {renderCanvas ? 
            renderCanvas(canvasRenderProps) : 
            <CanvasRenderer canvasRenderProps={canvasRenderProps} visibilityDefaultCanvas={visibilityDefaultCanvas} />
          }
        </div>
      </div>

      {cumulativeState.canvasMode === "interactive" && cumulativeState.showButtons && (
        <div style={{ flex: "0 0 auto", padding: 16 }}>
          {renderButtons ? 
            renderButtons(buttonsRenderProps) : 
            <ButtonsRenderer {...buttonsRenderProps} />
          }
        </div>
      )}
    </div>
  );
}
