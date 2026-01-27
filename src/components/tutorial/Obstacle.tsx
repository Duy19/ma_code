import rockImg from "../../assets/overlay/rock.png";

export default function TutorialObstacle() {
  return (
    <img
      src={rockImg}
      alt="Obstacle"
      style={{
        position: "absolute",
        bottom: 20,
        left: 240,
        width: 80,
        height: 100,
        pointerEvents: "none",
      }}
    />
  );
}
