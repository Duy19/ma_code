import { useEffect, useState } from "react";
import carImg from "../../assets/car.png";
import rockImg from "../../assets/rock.png";

interface Props {
  step: number;
  totalSteps: number;
  stopBeforeObstacle?: boolean;
  crash?: boolean;
}

const AUTO_WIDTH = 120;
const ROCK_X = 260;
const AUTO_SPEED = 6;

export default function TutorialScenario({ step, totalSteps, stopBeforeObstacle, crash }: Props) {
  const [carX, setCarX] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (step !== totalSteps - 1) return;

    const animation = setInterval(() => {
      setCarX(prev => {
        // Crash
        if (crash) {
          if (prev + AUTO_WIDTH < ROCK_X + 20) return prev + AUTO_SPEED;
          setShowWarning(true);
          return prev;
        }
        // No Crash
        if (stopBeforeObstacle) {
          if (prev + AUTO_WIDTH >= ROCK_X - 10) {
            setShowCheck(true);
            return prev;
          }
          return prev + AUTO_SPEED;
        }

        return prev;
      });
    }, 16);

    return () => clearInterval(animation);
  }, [step, totalSteps, crash, stopBeforeObstacle]);

  return (
    <div style={{ position: "relative", width: 400, height: 120 }}>
      
      <img src={rockImg} alt="Stein" style={{ position: "absolute", bottom: 0, left: ROCK_X, width: 80 }} />
      <img src={carImg} alt="Car" style={{ position: "absolute", bottom: 0, left: carX, width: AUTO_WIDTH }} />

      {showWarning && crash && (
        <div style={{ 
          position: "absolute", 
          left: ROCK_X + 20, 
          bottom: 60, 
          fontSize: 30 }}>
          ❌
        </div>
      )}

      {showCheck && stopBeforeObstacle && (
        <div style={{ 
          position: "absolute", 
          left: carX + AUTO_WIDTH + 10, 
          bottom: 60, 
          fontSize: 30 }}>
          ✔️
        </div>
      )}
    </div>
  );
}
