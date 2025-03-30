import { useEffect, useState } from 'react';

import offImg from '../images/button_off.png';
import amber from '../images/button_glow_amber.png';
import green from '../images/button_glow_green.png';
import red from '../images/button_glow_red.png';
import white from '../images/button_glow_white.png';

import '../css/components/PanelButton.css';

import initRegistry from '../state/initRegistry';
import testRegistry from '../state/testRegistry';

type TestColor = 'off' | 'red' | 'amber' | 'green' | 'white';

interface PanelButtonProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  topLabel?: string;
}

export default function PanelButton({
  id,
  x,
  y,
  label,
  topLabel,
}: PanelButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [displayColor, setDisplayColor] = useState<TestColor>('off');

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setIsPressed(false);
        setDisplayColor('off');
        initRegistry.acknowledge(id);
      }

      if (e.detail.type === 'test') {
        const sequence: TestColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;

        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;

          if (i >= sequence.length) {
            clearInterval(interval);
            testRegistry.acknowledge(id);
          }
        }, 120);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, [id]);

  const glowMap: Record<TestColor, string> = {
    off: offImg,
    red,
    amber,
    green,
    white,
  };

  return (
    <div className="panel-button-wrapper" style={{ top: `${y}px`, left: `${x}px` }}>
      {topLabel && <div className="panel-button-top-label">{topLabel}</div>}
      <img
        src={glowMap[displayColor]}
        alt={`Panel Button ${displayColor}`}
        className={`panel-button-img ${isPressed ? 'pressed' : ''}`}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        draggable={false}
      />
      {label && <div className="panel-button-label">{label}</div>}
    </div>
  );
}
