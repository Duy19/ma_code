import type { Task } from "../../core/task";
import type { StoryStep } from "../ModularTutorialTemplate";
import { simulateEDF, simulateRM, simulateDM } from "../../logic/simulator";
import { ModularTutorialTemplate } from "../ModularTutorialTemplate";

const BASE_TASKS: Task[] = [
  { id: "brake", name: "Bremsen", C: 2, T: 4, D: 4, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 6, D: 6, color: "#34d399" },
];

const STORY: StoryStep[] = [
  {
    text: "Now its your time to shine! Try to create the schedule yourself by drawing the tasks onto the canvas. Click each task and drag it to the correct time slots. If you have problems use the hints next to the canvas.",
    waitFor: ({ scheduleCorrect }) => scheduleCorrect === true,
  },
  {
    text: "Very good! Now try it again but this time with a different algorithm.",
    selectedAlgorithm: "EDF",
    waitFor: ({ scheduleCorrect }) => scheduleCorrect === true,
  },
  {
    text: "Excellent! You have successfully completed all scheduling tasks! You now understand how to apply both RM and EDF scheduling algorithms. See you in the next chapter! **Click**.",
    showHintCheckboxes: false,
    showSidebar: false,
    showButtons: false,
    showCanvas: false,
    showDefinitions: false,
    navigateTo: "/",
  },
];

const DEFINITIONS = [
  {
    term: "EDF",
    definition:
      "Earliest Deadline First - dynamic priority scheduling that always executes the task with the closest deadline.",
  },
  {
    term: "RM",
    definition:
      "Rate Monotonic - static priority scheduling where tasks with shorter periods get higher priority.",
  },
];

export default function TestChapter1_D() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ModularTutorialTemplate
        story={STORY}
        baseTasks={BASE_TASKS}
        hyperperiod={12}
        algorithms={{
          RM: simulateRM,
          EDF: simulateEDF,
          DM: simulateDM,
        }}
        defaultAlgorithm="RM"
        canvasMode="interactive"
        layoutStyle="standard"
        showOverlay={true}
        showHintCheckboxes={true}
        showSidebar={true}
        showButtons={true}
        showDefinitions={true}
        definitions={DEFINITIONS}
        sidebarVisibleFields={["executionTime", "periods", "deadlines", "algorithmSelection"]}
        sidebarEditableFields={[]}
        hintConfig={[          
          { type: "fullExecution", unlockAt: 0 },
          { type: "releaseMarker", unlockAt: 0 },
          { type: "deadlineMarker", unlockAt: 0 },]}
      />
    </div>
  );
}
