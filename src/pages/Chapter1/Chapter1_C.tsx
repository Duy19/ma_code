import type { Task } from "../../core/task";
import type { StoryStep } from "../ModularTutorialTemplate";
import { simulateEDF, simulateRM, simulateDM } from "../../logic/simulator";
import { ModularTutorialTemplate } from "../ModularTutorialTemplate";

const BASE_TASKS: Task[] = [
  { id: "brake", name: "Bremsen", C: 4, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];


const STORY: StoryStep[] = [
    { 
    text: "So another example. Hopefully you kept everything in mind if not thats also fine as you can look up the definitions down below if you scroll a bit for each algorithm.", 
    sidebarEditableFields: [],
    },
    { 
    text: "First of all the EDF Schedule for the taskset. In the next step I will show you the RM Schedule. Think about it for yourself a second what is going to happen. Ready? (Click)", 
    },
    { 
    text: "Now we have the RM Schedule! Did you see any changes?", 
    },
    { 
    text: "Wait nothing happened? Upsi daisy... Well I will fix it later, but for now you can use this cool feature on the sidebar. Just **change the algorithmm** at the top manually to **RM**.", 
  
    sidebarEditableFields: ["algorithmSelection"],
    waitFor: ({selectedAlgorithm}) => selectedAlgorithm === "RM",
    },
    { 
    text: "Cool feature right? Well lets get back on track, shall we? Now we have the RM Schedule. At **timestep 8** the RM algorithm preferred the **brake task** over multimedia as multimedia has a larger period.",
    sidebarEditableFields: [],
    highlightExecutions: [{ taskId: "brake", steps: [8,9] }],
    },   
    {
    text: "Because of that multimedia could not meet its deadline at 12. Should not be too critical but also kinda sad.", 
    highlightExecutions: [{ taskId: "media", steps: [8, 9, 14] }],  
    },
    {
    text: "As you can see algorithms can behave differently depending on the task parameters. For now lets move on!", 
    highlightExecutions: [],
    navigateTo: "/Chapter1_D",
    },
];


const DEFINITIONS = [
  {
    term: "EDF",
    definition: "Earliest Deadline First - dynamic priority scheduling that always executes the task with the closest deadline.",
  },
  {
    term: "RM",
    definition: "Rate Monotonic - fixed priority based on task period. Shorter periods get higher priority.",
  },
  {
    term: "DM",
    definition: "Deadline Monotonic - fixed priority based on task deadline. Shorter deadlines get higher priority.",
  },
  {
    term: "Note",
    definition: "Ties in priority are broken by task order e.g. Brakes over Sensor or Multimedia.",
  }
];

export default function Chapter1_C() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ModularTutorialTemplate
        story={STORY}
        baseTasks={BASE_TASKS}
        hyperperiod={24}
        algorithms={{
          RM: simulateRM,
          EDF: simulateEDF,
          DM: simulateDM,
        }}
        defaultAlgorithm="EDF"
        canvasMode="default"
        layoutStyle="standard"
        showOverlay={true}
        showHintCheckboxes={true}
        showSidebar={true}
        showButtons={false}
        showDefinitions={true}
        definitions={DEFINITIONS}
        hintConfig={[]}
      />
    </div>
  );
}
