import { ModularTutorialTemplate, type StoryStep } from "../ModularTutorialTemplate";
import type { Task } from "../../core/task";
import { simulateRM } from "../../logic/simulator";

const tasks: Task[] = [  
    { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
    { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
    { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY: StoryStep[] = [
  {
    text: "Hey there! This is a small quiz to recap what you have learned so far about the Models and Scheduling Strategies in Chapter 1.",
    showOverlay: true,
    showCanvas: false,
  },
  {
    text: "Then without further ado, let's get started! Try to answer all questions at least once. If you answer them incorrectly, don't worry about it. This is just to help you learn! Try as many times as you want.",
    showOverlay: true,
    showQuiz: true,
    quizQuestionIds: ["c1_q1", "c1_q2", "c1_q3", "c1_q4", "c1_q5"],
    waitFor: ({ quizCompleted }) => quizCompleted === true,
    navigateTo: "/chapter2_A",
  },
  {
    text: "Hopefully this helped you understand Models and Scheduling Strategies better. In the next chapter we will learn some interesting analysis techniques. See you there!",
    showOverlay: false,
    showQuiz: false,
    navigateTo: "/chapter2_A",
  },
];

export default function Chapter1_Quiz() {
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
