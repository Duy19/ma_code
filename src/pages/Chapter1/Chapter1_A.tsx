import type { Task } from "../../core/task";
import type { StoryStep } from "../ModularTutorialTemplate";
import { simulateEDF, simulateRM, simulateDM } from "../../logic/simulator";
import { ModularTutorialTemplate } from "../ModularTutorialTemplate";

const BASE_TASKS: Task[] = [
  { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY: StoryStep[] = [
    {
    text: "By now you should have completed the tutorial and have an intuitive understanding of task scheduling in real-time systems. Let's summarize what we've learned so far.",
    showSummary: true,
    showCanvas: false,
    summaryIds: ["model"],
    },
    { 
    text: "Try to keep these in mind going forward. Also you might have noticed in the tutorial, that tasks can be planned in multiple ways. Lets look at the example from before. **(click)**", 
    },
    { 
    text: "This time you can also see Release (green) and Deadline (red) Markers for each task. In this case the **Earliest Deadline First (EDF)** algorithm is used.", 
    showSummary: false,
    showCanvas: true,
    showSidebar: true,
    },
    { 
    text: "At each timestep EDF choses the task with the **earliest deadline** from the **remaining** active tasks. If multiple tasks have the same remaining time, a tie is broken by choosing any policy. For our tutorials we choose them by **task order** e.g. Brakes over Sensor or Multimedia.", 
    },
    { 
    text: "Lets have a look at **timestep 9**. Instead of executing the brake task, the algorithm choses the sensor task, because it is now active (new release) and has the earlier deadline. ", 
    highlightExecutions: [{ taskId: "brake", steps: [9] }, {taskId: "sensor", steps: [9]}],
    showDefinitions: true,
    },
    {
    text: "Multimedia would be an example for an **inactive task** at this point, as it has already **finished** its execution and the next release is at **timestep 12**.",
    highlightExecutions: [{ taskId: "media", steps: [4, 12] }, { taskId: "brake", steps: [9] }, {taskId: "sensor", steps: [9]}],
    },
    { 
    text: "As you can see, the priority of tasks can change **dynamically** based on the deadline of the active tasks. ", 
    },
    {
    text: "But there are algorithms, which assign fixed priorities to each task, called Fixed-Priority Scheduling."
    },
    { 
    text: "Lets look at those in the next step. **(Click)**", 
    navigateTo: "/Chapter1_B",
    },         
];



const DEFINITIONS = [
  {
    term: "EDF",
    definition: "Earliest Deadline First - dynamic priority scheduling that always executes the task with the closest deadline.",
  },
];

export default function Chapter1_A() {
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
        showSidebar={false}
        showButtons={false}
        showDefinitions={false}
        definitions={DEFINITIONS}
        hintConfig={[]}
      />
    </div>
  );
}
