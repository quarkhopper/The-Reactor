import { ReactNode } from "react";
import emptyPanel from "/src/images/empty_panel.png";
import "../css/components/Panel.css";
import MasterSwitch from "./MasterSwitch";

interface PanelProps {
  children?: ReactNode;
}

export default function Panel({ children }: PanelProps) {
  return (
    <div className="panel">
      <img
        src={emptyPanel}
        alt="Empty Panel"
        className="panel-background"
      />
      <div className="panel-content">
        {children}
        <MasterSwitch />
      </div>
    </div>
  );
}
