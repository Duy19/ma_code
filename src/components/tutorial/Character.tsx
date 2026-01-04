import mrTau from "../../assets/mrtau.png";

export default function TutorialCharacter() {
  return (
    <img
      src={mrTau}
      alt="Mr. Tau"
      style={{
        width: 100,
        height: "auto",
        marginBottom: 0,
        animation: "float 3s ease-in-out infinite",
      }}
    />
  );
}
