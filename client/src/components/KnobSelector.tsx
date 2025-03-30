import { useEffect, useState } from 'react';

import knobImg from '../images/knob_selector.png';
import '../css/components/KnobSelector.css';

import initRegistry from '../state/initRegistry';
import testRegistry from '../state/testRegistry';

interface KnobSelectorProps {
  id: string;
  x: number;
  y: number;
  leftLabel: string;
  rightLabel: string;
}

export default function KnobSelector({ id, x, y, leftLabel, rightLabel }: KnobSelectorProps) {
  const [toggled, setToggled] = useState(false);
  const rotation = toggled ? 45 : -45;

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        initRegistry.acknowledge(id);
      }

      if (e.detail.type === 'test') {
        // No visual test yet, but must acknowledge
        testRegistry.acknowledge(id);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, [id]);

  return (
    <div className="knob-selector-wrapper" style={{ top: y, left: x }}>
      <div className="knob-label left">{leftLabel}</div>
      <div className="knob-label right">{rightLabel}</div>
      <img
        src={knobImg}
        className="knob-selector-img"
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={() => setToggled(!toggled)}
        draggable={false}
      />
    </div>
  );
}
