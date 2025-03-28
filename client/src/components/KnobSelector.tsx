import { useState } from 'react';
import knobImg from '../images/knob_selector.png';
import '../css/components/KnobSelector.css';

interface KnobSelectorProps {
  x: number;
  y: number;
  leftLabel: string;
  rightLabel: string;
}

export default function KnobSelector({ x, y, leftLabel, rightLabel }: KnobSelectorProps) {
  const [toggled, setToggled] = useState(false);

  const rotation = toggled ? 45 : -45;

  return (
    <div className="knob-selector-wrapper" style={{ top: y, left: x }}>
      <div className="knob-label left">{leftLabel}</div>
      <div className="knob-label right">{rightLabel}</div>
      <img
        src={knobImg}
        className="knob-selector-img"
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={() => setToggled(!toggled)}
      />
    </div>
  );
}
