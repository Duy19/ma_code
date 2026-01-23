import type { Task } from "../../core/task";
import type { StoryStep } from "../ModularTutorialTemplate";
import { simulateEDF, simulateRM, simulateDM } from "../../logic/simulator";
import { ModularTutorialTemplate } from "../ModularTutorialTemplate";

const BASE_TASKS2: Task[] = [
  { id: "brake", name: "Brakes", C: 1, T: 6, D: 5, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 12, D: 6, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 4, color: "#34d399" },
];

const STORY: StoryStep[] = [
    { 
    text: "Now lets look at a new example, but this time with a **Fixed-Priority Scheduling**. ", 
    },

    { 
    text: "With Fixed-Priority Scheduling, tasks are scheduled with given fixed priorities. These remain unchanged over the entire period.", 
    },
    { 
    text: "I will introduce both **Rate-Monotonic (RM)** and **Deadline-Monotonic (DM)** to you as strategies.", 
    },
    { 
    text: "With Rate-Monotonic, tasks with shorter periods are given higher priority. Feel free to take a look at the schedule below.", 
    },
    { 
    text: "With Deadline-Monotonic, on the other hand, tasks with shorter deadlines are given higher priority. Let’s now look at the schedule using DM. **(Click)**.", 
    },
    { 
    text: "Did you notice the difference?", 
    selectedAlgorithm: "DM",
    },
    { 
    text: "In the last example with RM, the multimedia task even missed its deadline at time step 4!", 
    highlightExecutions: [{ taskId: "media", steps: [3, 4, 5] }],
    },
    {
    text: "The priorities were also quite different this time. In **this case**, DM is better suited to avoid missing deadlines.", 
    },
        {
    text: "In the next step, let’s take another look at an example using all the algorithms we have learned so far.", 
    navigateTo: "/Chapter1_C"
    },        
];



const DEFINITIONS = [
  {
    term: "RM",
    definition: "Rate Monotonic - fixed priority based on task period. Shorter periods get higher priority.",
  },
  {
    term: "DM",
    definition: "Deadline Monotonic - fixed priority based on task deadline. Shorter deadlines get higher priority.",
  },
];

export default function Chapter1_B() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ModularTutorialTemplate
        story={STORY}
        baseTasks={BASE_TASKS2}
        hyperperiod={24}
        algorithms={{
          RM: simulateRM,
          EDF: simulateEDF,
          DM: simulateDM,
        }}
        defaultAlgorithm="RM"
        canvasMode="default"
        layoutStyle="standard"
        showOverlay={true}
        showHintCheckboxes={true}
        showSidebar={false}
        showButtons={false}
        showDefinitions={true}
        definitions={DEFINITIONS}
        hintConfig={[]}
      />
    </div>
  );
}
