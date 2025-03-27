import { useState } from "react";
import knobSelector from "../images/knob_selector.png";
import "../css/components/MasterSwitch.css";

export default function MasterSwitch() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="master-switch-wrapper" onClick={() => setIsOnline(!isOnline)}>
      <span className="label-offline">OFFLINE</span>
      <img
        src={knobSelector}
        alt="Master Switch"
        className={`master-switch ${isOnline ? "online" : ""}`}
      />
      <span className="label-online">ONLINE</span>
    </div>
  );
}
