import { ModularTutorialTemplate, type StoryStep } from "../ModularTutorialTemplate";
import type { Task } from "../../core/task";
import { simulateRM } from "../../logic/simulator";
import taskutilimg from "../../assets/formulas/taskutil.png";
import llbound from "../../assets/formulas/llboundonly.png";
import hyperboundimg from "../../assets/formulas/hyperboundonly.png";

const tasks: Task[] = [  
    { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
    { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
    { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY: StoryStep[] = [
  {
    text: "So you already know about Time Demand Analysis (TDA) from before right?. But that is not the only way to analyze the schedulability of a taskset!",
    showOverlay: true,
    showCanvas: false,
  },
  {
    text: "There exist different utilization bounds which can help us to quickly determine if a taskset is schedulable. You might think we alreay can do that with TDA!",
    showOverlay: true,
  },
  {
    text: "But TDA can be quite time consuming to calculate, especially for larger tasksets. Utilization bounds are a quick way to check schedulability.",
    showOverlay: true,
  },
  {
    text: "First of all what is this utilization I'm talking about? The utilization of a task is the fraction of a tasks execution time and its period. For example a task with C=2 and T=8 has a utilization of 2/8 = 0.25.",
    showOverlay: true,
    renderCompanion: () => (<img src={taskutilimg} alt="TDA Formula" style={{ maxWidth: "100%", marginTop: "1rem" }} />),
  },

  {
    text: "Basically it tells us how much of the CPU a task is using. The total utilization of a taskset is simply the sum of the utilizations of all its tasks.",
  },
  {
    text: "With that we can now look at utilization bounds. Generally utilization bounds tell you that if the total utilization of a taskset is below a certain threshold, the taskset is guaranteed to be schedulable under given algorithm. The most famous one is the Liu & Layland bound for RM scheduling. ",
  },
  {
    text: "Here you can see the Liu & Layland bound. It looks complicated but its actually quite simple to use! As long as the total utilization of your taskset is below $n \\cdot (2^{1/n} - 1)$ (n = number of tasks), your taskset is guaranteed to be schedulable under RM.",
    renderCompanion: () => (<img src={llbound} alt="Liu & Layland Bound" style={{ maxWidth: "100%", marginTop: "1rem" }} />),
  },
  {
    text: "Lets look at an example below.",
    showSummary: true,
    summaryIds: ["llboundExample"],
  },
  {
    text: "Well now you know about the Liu & Layland bound! But other utilization bounds exist as well. The Hyperbolic Bound is one of them. It also provides a higher utilization threshold for schedulability.",
    renderCompanion: () => null,
    showSummary: false,
  },
  {
    text: "The Hyperbolic Bound looks like this. Basically you just have to calculate the product of $U_i + 1$ for all tasks $i$.",
    renderCompanion: () => (<img src={hyperboundimg} alt="Hyperbolic Bound" style={{ maxWidth: "100%", marginTop: "1rem" }} />),
  },
  {
    text: "Lets look at an example below.",
    showSummary: true,
    summaryIds: ["hyperboundExample"],
  },
  {
    text: "Super! Now you know two different utilization bounds to quickly check the schedulability of a taskset under RM scheduling. But here is one more special case!",
    showSummary: false,
    renderCompanion: () => null,
  },
  {
    text: "If a taskset is harmonic (all task periods are integer multiples of each other), it is always schedulable under RM, as long as the total utilization $\\leq 1$!",
  },
  {
    text: "For example a taskset with 3 tasks having periods 5, 10, and 20 is harmonic. If their total utilization is below 1, the taskset is guaranteed to be schedulable under RM.",
  },
  {
    text: "Thats it for methods to analyze Schedulability! I hope this chapter helped you understand the various approaches and their uses! But don't worry here is a small summary of what we learned so far about the topic!",
    showSummary: true,
    summaryIds: ["chapter2"],
    navigateTo: "/chapter2_Quiz",
  },
];

export default function Chapter2_C() {
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
