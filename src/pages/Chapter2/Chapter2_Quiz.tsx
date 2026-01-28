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
    text: "Hey there! This is a small quiz to recap what you have learned so far about schedulability analysis in Chapter 2.",
    showOverlay: true,
    showCanvas: false,
  },
  {
    text: "Then without further ado, let's get started! Try to answer all questions at least once. If you answer them incorrectly, don't worry about it. This is just to help you learn! Try as many times as you want.",
    showOverlay: true,
    showSidebar: true,
    showQuiz: true,
    quizQuestionIds: ["c2b_q1", "c2b_q2", "c2b_q3"],
    waitFor: ({ quizCompleted }) => quizCompleted === true,
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
