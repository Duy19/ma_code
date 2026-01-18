import { useState } from "react";
import SchedulerCanvas from "../../components/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateRM, computeWCRT} from "../../logic/simulator";
import { useNavigate } from "react-router-dom";
import FreeSchedulerSidebar from "../../components/FreeSchedulerSidebar";
import { Button } from "@mui/material";


const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 1, T: 4, D: 4, O: 3, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, O: 1, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 12, O: 0, color: "#34d399" },
];

const STORY = [
    { text: "Wir haben im letzten Kapitel schon einige Scheduling-Strategien kennengelernt. Fixed-Priority Scheduling hat dabei den Vorteil, dass es einfacher ist zu implementieren.", highlight: null },
    { text: "Man muss nur am Anfang dem System sagen welche Tasks welche Priorität haben. Da diese sich nicht ändern, ist es einfacher zu planen.", highlight: null },
    { text: "Doch es gibt auch Nachteile. Bei Fixed-Priority Scheduling kann es passieren, dass Aufgaben nicht immer optimal geplant werden, da die Prioritäten nicht dynamisch angepasst werden können.", highlight: null },
    { text: "Daher befassen sich viele Analysen auch oft mit der Frage, ob ein System mit Fixed-Priority Scheduling keine Deadlines verpasst. Die Tasks sollen also unter z.b. RM ein **feasible** Schedule ergeben.", highlight: null },
    { text: "Für FixedPriority Scheduling schaut man sich dafür vorallem die sog. Response Time eines Tasks an. Also die Zeit, die ein Task benötigt, um von seinem Release bis zur fertigen Ausführung zu gelangen.", highlight: null },
    { text: "Im Beispiel unten siehst du ein Schedule mit RM. Wenn du dir nun die Multimedia-Aufgabe anschaust, wirst du sehen, dass die Response Time für den ersten Release Zeitpunkt bei **6** liegt.", highlight: null, highlightExecutions: [{taskId: "media", steps: [5] }]},
    { text: "Frage an dich! Ist das die höchste Response Time, welche die Multimedia-Aufgabe erreicht?", highlight: null },
    { text: "Aufgepasst. Nein ist sie nicht! Aber das hast du dir vielleicht schon gedacht. Was denkst du, wie die höchste Response Time, auch **Worst-Case Response Time (WCRT)**, sein kann?", highlight: null },
    { text: "Schauen wir uns hierfür mal die Task Parameter an. **(Klicken)**", highlight: null },
    { text: "Falls du dich wunderst: Der Release eines Tasks kann durch einen **Offset (O)** um eine gewisse Zeit verschoben werden. Dies kann mehrere Gründe haben, aber welche genau spielt hier erstmal keine wesentliche Rolle.", highlight: null },
    { text: "Versuch herauszufinden wie die WCRT für die Ausführung von Multimedia aussieht. Es dürfen aber **keine Deadlines verpasst werden**!", highlight: null },
    { text: "Na schau mal! Du hast den schlimmsten Fall für Multimedia entdeckt! Wenn alle vorherigen Task zeitgleich mit Multimedia anfangen, dann steigt die RT an. In diesem Falle ist die WCRT bei 10 statt 6!", highlight: "media", highlightExecutions: [{ taskId: "media", steps: [9] }] },
    { text: "Zu diesem Phänomen wirst du dann im nächsten Teil des Kapitels erfahren", highlight: null },
];

function renderRMSchedule(inputTasks: Task[], schedule: ScheduleEntry[], hyperperiod: number, currentStep: any) {
    return (
    <div style={{ flex: 1, padding: "0 24px 20px" }}>
        <SchedulerCanvas
          tasks={inputTasks}
          hyperperiod={hyperperiod}
          schedule={schedule}
          pxPerStep={28}
          leftLabelWidth={140}
          visibility={{
            showTaskLabels: true,
            showXAxis: true,
            showYAxis: false,
            showTimeTicks: true,
            showExecutionBlocks: true,
            showReleaseMarkers: true,
            showDeadlineMarkers: true,
          }}
          highlightExecutions={currentStep.highlightExecutions}
          highlight={currentStep.highlight}
        />
      </div>
    );
}


function renderSidebar(inputTasks: Task[], maxOffset: number, editable: boolean, setInputTasks: React.Dispatch<React.SetStateAction<Task[]>>) {

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
        <FreeSchedulerSidebar
        tasks={inputTasks}
        onTasksChange= {setInputTasks}
        algorithm="RM"
        onClose={() => {}}
        visibility={{
          showExecutionTime: true,
          showPeriods: true,
          showDeadlines: true,
          showOffsets: true,
          showSuspension: false,
          showTaskControls: false,
          showTaskNames: true,
          showAlgorithmSelection: true,
        }}
        maxOffset={maxOffset}
        isFieldEditable={(task, field) =>
          editable && field === "O" && (task.id === "brake" || task.id === "sensor") }
        />
      </div>);
}

function computeCurrentResponseTime(mediaTask: Task, tasks: Task[]): number {
  const higherPrioTasks = tasks.filter(t => t.T < mediaTask.T);

  // erster Job: Release = Offset
  const release = mediaTask.O ?? 0;

  let R_prev = 0;
  let R = mediaTask.C;

  while (R !== R_prev) {
    R_prev = R;
    const interference = higherPrioTasks.reduce((sum, t) => {
      // wie oft stören die HP-Tasks im Zeitraum R_prev
      const jobRelease = t.O ?? 0;
      const nJobs = Math.ceil((R_prev + release - jobRelease) / t.T);
      return sum + nJobs * t.C;
    }, 0);

    R = mediaTask.C + interference;
  }

  return R;
}



export default function TutorialStep1() {
  const hyperperiod = 24;
  const [inputTasks, setInputTasks] = useState<Task[]>(structuredClone(tutorialTasks));
  const [step, setStep] = useState(0);
  const currentStep = STORY[step];
  const navigate = useNavigate();
  const totalSteps = STORY.length;
  const maxOffset = 4;
  const mediaTask = inputTasks.find(t => t.id === "media")!;
  const higherPrioTasks = inputTasks.filter(t => t.T < mediaTask.T);
  const [offsetTestPassed, setOffsetTestPassed] = useState(false);
  const handleNext = () => {

    if (step === 10 && !offsetTestPassed) {
      return;
    }

    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    }else {
      navigate("/");
    }
  };

  const handleCheckOffsets = () => {
    const mediaWCRT = computeWCRT(mediaTask, higherPrioTasks);
    const observedWCRT = computeCurrentResponseTime(mediaTask, inputTasks);
    const success = observedWCRT === mediaWCRT

    if (success) {
      alert("✅ Super! Du hast die WCRT herausgefunden!");
      setOffsetTestPassed(true);
      setStep(s => s + 1);
    } else {
      alert(`❌ Nicht ganz. Finde die WCRT vom Media Task! \nAktuelle RT: ${observedWCRT}\nWCRT: ${mediaWCRT}`);
    }
  };


 return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Mr. Tau + Schedulercanvas*/}
      <div style={{ flex: "0 0 80%", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mr.Tau explaining stuff*/}
        <div
          style={{
            flex: "0 0 25%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "20px 40px",
            gap: 40,
          }}
        >
          <TutorialOverlay
            visible
            text={currentStep.text}
            onNext={handleNext}
          />
          {step >= 9 && step < 11 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckOffsets}
            >
              Überprüfen
            </Button>
          )}
        </div>

      {/* Schedulercanvas */}
      {step > 4 ? renderRMSchedule(inputTasks, simulateRM(inputTasks, hyperperiod), hyperperiod, currentStep) : null}
      </div>

      {/* Sidebar + Buttons on the right */}
      <div
        style={{
          flex: "0 0 20%",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          padding: 8,
          height: "100%",
          overflow: "hidden",
        }}
      >
      {step > 8 ? renderSidebar(inputTasks, maxOffset, !offsetTestPassed, setInputTasks, ) : null}
      </div>
    </div>
  );
}
