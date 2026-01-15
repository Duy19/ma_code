import { useMemo, useState } from "react";
import SchedulerCanvas from "../../components/SchedulerCanvas";
import TutorialOverlay from "../../components/tutorial/TutorialOverlay";
import type { Task } from "../../core/task";
import type { ScheduleEntry } from "../../logic/simulator";
import { simulateRM, simulateEDF, simulateDM } from "../../logic/simulator";
import { useNavigate } from "react-router-dom";
import FreeSchedulerSidebar from "../../components/FreeSchedulerSidebar";


const tutorialTasks: Task[] = [
  { id: "brake", name: "Bremsen", C: 4, T: 8, D: 8, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 6, D: 6, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
];

const STORY = [
    { text: "Ist dir der unterschied aufgefallen?", highlight: null, highlightExecutions: [] },
    { text: "Falls es dir zu schnell ging, kannst du rechts in der Sidebar den Algorithmus umschalten. Teste dich gerne durch!", highlight: null, highlightExecutions: [] },
    { text: "Beim **Zeitpunkt 8** hat das RM Verfahren die **Bremsenaufgabe** dem Multimedia vorgezogen, da das Multimedia eine größere Periode hat.", highlight: "brake", highlightExecutions: [{ taskId: "brake", steps: [8,9] }] },
    { text: "Dadurch konnte Multimedia ihre Deadline bei 12 nicht einhalten. Sollte nicht ganz so kritisch sein aber auch doof", highlight: "media", highlightExecutions: [{ taskId: "media", steps: [8, 9, 14] }] },
    { text: "Wie du siehst können sich Verfahren je nach Aufgabenparametern unterschiedlich verhalten.", highlight: null, highlightExecutions: [] },   
];

export default function TutorialStep1() {
  const hyperperiod = 24;
  const [algorithm, setAlgorithm] = useState<"EDF" | "RM" | "DM">("RM");
  
  const schedule: ScheduleEntry[] = useMemo(() => {
    if (algorithm === "EDF") {
      return simulateEDF(tutorialTasks, hyperperiod);
    } else if (algorithm === "DM") {
      return simulateDM(tutorialTasks, hyperperiod);
    } else if (algorithm === "RM") {
      return simulateRM(tutorialTasks, hyperperiod);
    }
    else {
      return simulateRM(tutorialTasks, hyperperiod);
    }
  }, [algorithm]);

  const [step, setStep] = useState(0);
  const currentStep = STORY[step];
  const navigate = useNavigate();
  const totalSteps = STORY.length;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      navigate("/chapter1_5");
    }
  };

 return (
    <div style={{ display: "flex", overflow: "hidden", flex: 1 , height: "100vh" }}>
        <div style={{ flex: "0 0 80%", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
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
            </div>

            {/* Schedulercanvas */}
            <div style={{ flex: 1, padding: "0 24px 20px", overflow: "hidden" }}>
                <SchedulerCanvas
                tasks={tutorialTasks}
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
                highlight={currentStep.highlight}
                highlightExecutions={currentStep.highlightExecutions}
                />
            </div>
        </div>  

    <div style={{ flex: "0 0 20%", display: "flex", flexDirection: "column", boxSizing: "border-box" , overflow: "hidden", height: "100%"}}>
      {/* Sidebar */}
      <div style={{ flex: 1, overflowY: "auto"}}>
          <FreeSchedulerSidebar
              tasks={tutorialTasks}
              onTasksChange={() => {}}
              algorithm={algorithm}
              onAlgorithmChange={ (alg) => setAlgorithm(alg as "RM" | "EDF" | "DM")}
              onClose={() => {}}
              visibility={{
              showExecutionTime: true,
              showPeriods: true,
              showSuspension: false,
              showOffsets: false,
              showDeadlines: true,
              showTaskControls: false,
              showTaskNames: true,
              showAlgorithmSelection: true,
              }}
              isFieldEditable={(task, field) => {
                  if (field === "algorithm") return true;
                  return false;
              }}
          />
          </div>
      </div>
    </div>
  );
}
