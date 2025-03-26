import React from "react";
import { PanelButton } from "./PanelButton";
import emptyPanel from "/src/images/empty_panel.png";
import type { ButtonColor } from "./PanelButton";

const Panel = () => {
  const buttons = [
    { x: 20, y: 20, color: "amber" as ButtonColor, label: "ENGAGE" },
    { x: 40, y: 40, color: "green" as ButtonColor, label: "PUMP", topLabel: "MAIN" },
    { x: 60, y: 60, color: "red" as ButtonColor, label: "COOL", topLabel: "EMERG" },
    { x: 80, y: 80, color: "white" as ButtonColor, label: "STOP", topLabel: "MODE" },
    { x: 50, y: 50, color: "white" as ButtonColor, label: "OVRD" },
  ];

  return (
    <div className="relative w-[900px] aspect-[3/2] mx-auto mt-10 bg-black">
      {/* Panel background */}
      <img
        src={emptyPanel}
        alt="Empty Panel"
        className="absolute inset-0 object-cover w-full h-full z-0"
      />

      {/* Buttons are direct children of the relative container */}
      {buttons.map((btn, idx) => (
        <PanelButton key={idx} {...btn} />
      ))}
    </div>
  );
};

export default Panel;
