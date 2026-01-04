import { useEffect, useState } from "react";
import carImg from "../../assets/car.png";

interface Props {
  step: number;
  totalSteps: number;
  stopBeforeObstacle?: boolean;
  crash?: boolean;
}

export default function TutorialCar({
  step,
  totalSteps,
  stopBeforeObstacle = false,
  crash = false,
}: Props) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (step === totalSteps - 1) {
      if (stopBeforeObstacle) {
        setLeft(170); 
      } else if (crash) {
        setLeft(240); 
      } else {
        setLeft(360);
      }
    }
  }, [step, totalSteps, stopBeforeObstacle, crash]);

  return (
    <img
      src={carImg}
      alt="Car"
      style={{
        position: "absolute",
        bottom: 20,
        left,
        width: 120,
        height: "auto",
        transition: "left 0.4s ease-in",
        pointerEvents: "none",
      }}
    />
  );
}
