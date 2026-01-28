import { ModularTutorialTemplate, type StoryStep } from "../ModularTutorialTemplate";
import type { Task } from "../../core/task";
import { simulateRM } from "../../logic/simulator";
import tdaImg from "../../assets/formulas/tda.png";

const tasks: Task[] = [  
    { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
    { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
    { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY: StoryStep[] = [
  {
    text: "After seeing the Critical Instant in chapter 2, how do we even calculate the Worst-Case Response Time (WCRT) of a task? Not everyone has the time to check all possible cases by drawing them. There has to be some kind of formula, right?",
    showOverlay: true,
    showCanvas: false,
  },
  {
    text: "Don't worry, there is a formula for that. The response time $R_i$ of a task $\\tau_i$ can be calculated using the so called Time Demand Analysis (TDA).",
    showOverlay: true,
  },
  {
    text: "But before I show the formula, lets have a little quiz. You can choose an answer and then click confirm. Sometimes you will also get some visual content to help you understand the question better.",
    showOverlay: true,
    showQuiz: true,
    quizQuestionIds: ["c2b_q1", "c2b_q2", "c2b_q3"],
    waitFor: ({ quizCompleted }) => quizCompleted === true,
  },
  {
    text: "Very good! Now that was surely an easy warm-up for you. These questions were basics about interference and demand, which are important to understand. Now let's look at the TDA formula. **(Click)**",
    showOverlay: true,
    showQuiz: false,
    highlight: null,
  },
  {
    text: "Here it is! ... I know, its beautiful, isn't it? Well, until you know what each part means. Let's break it down together!",
    showOverlay: true,
    showSidebar: false,
    showButtons: false,
    showDropGame: false,
    renderCompanion: () => (<img src={tdaImg} alt="TDA Formula" style={{ maxWidth: "100%", marginTop: "1rem" }} />),
  },
  
  {
    text: "Here a break down of the formula. Values are taken from an example taskset. (see Sidebar)", 
    showOverlay: true,
    showSidebar: true,
    showSummary: true,
    summaryIds: ["tda"],
  },
  {
    text: "Hopefully this helps you understand TDA better. In the next chapter we will learn some more interesting analysis techniques. See you there!",
    showOverlay: true,
    navigateTo: "/chapter2_C",
  },
];

export default function Chapter2_B() {
  return (
    <ModularTutorialTemplate
      story={STORY}
      baseTasks={tasks}
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
