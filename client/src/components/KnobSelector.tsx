import { useEffect, useState } from 'react';
import { useTestable } from '../hooks/useTestable';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';

import knobImg from '../images/knob_selector.png';
import '../css/components/KnobSelector.css';

interface KnobSelectorProps {
  id: string;
  x: number;
  y: number;
  leftLabel: string;
  rightLabel: string;
}

export default function KnobSelector({ id, x, y, leftLabel, rightLabel }: KnobSelectorProps) {
  const [toggled, setToggled] = useState(false);
  const { isTestMode } = useTestable(id);
  const rotation = toggled ? 45 : -45;

  // Self-initialization
  useEffect(() => {
    registry.acknowledge(id);
  }, [id]);

  const handleClick = () => {
    if (!isTestMode) {
      const newToggled = !toggled;
      setToggled(newToggled);
      
      // Emit knob state change
      stateMachine.emit({
        type: 'knob_change',
        id,
        value: newToggled ? 'right' : 'left'
      });
    }
  };

  return (
    <div className="knob-selector-wrapper" style={{ top: y, left: x }}>
      <div className="knob-label left">{leftLabel}</div>
      <div className="knob-label right">{rightLabel}</div>
      <img
        src={knobImg}
        className="knob-selector-img"
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={handleClick}
        draggable={false}
      />
    </div>
  );
}
