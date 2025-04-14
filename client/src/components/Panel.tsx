import { ReactNode } from "react";
import emptyPanel from "/src/images/empty_panel.png";
import "../css/components/Panel.css";

interface PanelProps {
  children?: ReactNode;
  labels?: { text: string; x: number; y: number; size: number; width: number; }[] 
 
}

export default function Panel({ children, labels }: PanelProps) {
  return (
    <div className="panel">
      <img
        src={emptyPanel}
        alt="Empty Panel"
        className="panel-background"
      />
      {labels && labels.map((label, index) => (
        <div
          key={index}
          className="panel-label"
          style={{ position: "absolute", lineHeight: '1', top: label.y, left: label.x, color: "black", fontSize: label.size, fontWeight: "bold", textAlign: "center", width: label.width }}
        >
          {label.text}
        </div>
      ))}
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
}
