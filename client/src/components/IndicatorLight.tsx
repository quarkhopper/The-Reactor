import { useEffect, useState } from 'react';

import off from '../images/indicator_off.png';
import amber from '../images/indicator_amber.png';
import green from '../images/indicator_green.png';
import red from '../images/indicator_red.png';
import white from '../images/indicator_white.png';

import '../css/components/IndicatorLight.css';

import initRegistry from '../state/initRegistry';
import testRegistry from '../state/testRegistry';

export type IndicatorColor = 'amber' | 'green' | 'red' | 'white' | 'off';

interface IndicatorLightProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  topLabel?: string;
}

export default function IndicatorLight({
  id,
  x,
  y,
  label,
  topLabel,
}: IndicatorLightProps) {
  const [displayColor, setDisplayColor] = useState<IndicatorColor>('off');

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setDisplayColor('off');
        initRegistry.acknowledge(id);
      }

      if (e.detail.type === 'test') {
        const sequence: IndicatorColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;

        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;

          if (i >= sequence.length) {
            clearInterval(interval);
            testRegistry.acknowledge(id);
          }
        }, 150);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, [id]);

  const colorMap: Record<IndicatorColor, string> = {
    amber,
    green,
    red,
    white,
    off,
  };

  return (
    <div className="indicator-light-wrapper" style={{ top: y, left: x }}>
      {topLabel && <div className="indicator-light-top-label">{topLabel}</div>}
      <img src={colorMap[displayColor]} className="indicator-light-img" />
      {label && <div className="indicator-light-label">{label}</div>}
    </div>
  );
}
