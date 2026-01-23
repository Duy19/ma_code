import { ModularTutorialTemplate, type StoryStep } from "../ModularTutorialTemplate";
import type { Task } from "../../core/task";
import { simulateRM } from "../../logic/simulator";
import taskUtilImg from "../../assets/taskutil.png";

const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 1, T: 4, D: 4, O: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, O: 1, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 12, O: 0, color: "#34d399" },
];

/**
 * Example showing how to use the WCRT (Worst-Case Response Time) checking feature
 * in the ModularTutorialTemplate.
 * 
 * The user will be asked to adjust task offsets to find the worst-case response time
 * for the Multimedia task. The WCRT check will:
 * 1. Calculate the actual WCRT based on current task offsets
 * 2. Compare with the expected WCRT (computed from base tasks)
 * 3. Pass only when the user achieves the correct WCRT
 */
const STORY: StoryStep[] = [
  {
    text: "Lets look at bounds, but for that first look at this picture.",
    showOverlay: true,
    showSidebar: false,
    showButtons: false,
    renderCompanion: () => (
      <img src={taskUtilImg} alt="Task Utilization Formula" style={{ width: 400, height: "auto" }} />
    ),
  },
  {
    text: "You only need to tell the system at the beginning which tasks have which priority. Since these do not change, it is easier to plan.",
    showOverlay: true,
    showSidebar: false,
    showButtons: false,
    renderCompanion: undefined, // Remove the image on this step
  },
  {
    text: "For Fixed-Priority Scheduling, we mainly look at the so-called response time of a task.",
    showOverlay: true,
    showSidebar: false,
    showButtons: false,
    showCanvas: false,
    showQuiz: true,
    quizQuestionIds: ["q1", "q2"],
  },
  {
    text: "In the example below, you see a schedule with RM. If you look at the Multimedia task, you will see that the response time for the first release is 6.",
    showOverlay: true,
    showSidebar: false,
    showButtons: false,
    showQuiz: false,
    highlight: null,
    highlightExecutions: [{ taskId: "media", steps: [5] }],
  },
  {
    text: "But that is not the highest response time! What do you think the Worst-Case Response Time (WCRT) could be?",
    showOverlay: true,
    showSidebar: false,
    showButtons: false,
  },
  {
    text: "The release of a task can be shifted by an offset (O) by a certain amount of time. Try to find out what the WCRT for Multimedia could be! Edit the offsets of Brake and Sensor until the WCRT is reached.",
    showOverlay: true,
    showSidebar: true,
    showButtons: true,
    highlightExecutions:[],
    sidebarVisibleFields: ["executionTime", "periods", "deadlines", "offsets"],
    sidebarEditableFields: ["offsets"],
    editableTasks: ["brake", "sensor"],
    maxFieldValues: {
      offsets: 12,
    },
    wcrtTaskId: "media",
    waitFor: ({ allCorrect }) => allCorrect,
  },
  {
    text: "Perfect! You found the WCRT! This happens when all higher priority tasks start at the same time as Multimedia (the task to inspect).",
    showOverlay: true,
    showSidebar: false,
    showButtons: false,
    navigateTo: "/chapter2_B",
  },
];

export default function Chapter2_A() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tutorialTasks}
      hyperperiod={24}
      defaultAlgorithm="RM"
      algorithms={{
        RM: simulateRM,
      }}
      showOverlay={true}
      showSidebar={false}
      showButtons={false}
      canvasMode="default"
      layoutStyle="standard"
      sidebarVisibleFields={["executionTime", "periods", "deadlines", "algorithmSelection"]}
      sidebarEditableFields={[]}
    />
  );
}
