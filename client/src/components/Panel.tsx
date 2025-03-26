import emptyPanel from "/src/images/empty_panel.png";
import { ReactNode } from "react";
import "../css/components/Panel.css";

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
      </div>
    </div>
  );
}
