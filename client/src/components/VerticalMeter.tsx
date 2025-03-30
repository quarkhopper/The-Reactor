import React, { useEffect, useState } from 'react';

import '../css/components/VerticalMeter.css';

import bezel from '../images/meter_bezel.png';
import centerOn from '../images/meter_center_on.png';
import centerOff from '../images/meter_center_off.png';

import initRegistry from '../state/initRegistry';
import testRegistry from '../state/testRegistry';

interface VerticalMeterProps {
  id: string;
  x: number;
  y: number;
  value: number; // 0 to 1
}

export default function VerticalMeter({ id, x, y, value }: VerticalMeterProps) {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setCurrentValue(0);
        initRegistry.acknowledge(id);
      }

      if (e.detail.type === 'test') {
        const steps = 30;
        let i = 0;
        const interval = setInterval(() => {
          const phase = i < steps ? i / steps : 2 - i / steps;
          setCurrentValue(phase);
          i++;
          if (i > steps * 2) {
            clearInterval(interval);
            testRegistry.acknowledge(id);
          }
        }, 20);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, [id]);

  const clamped = Math.max(0, Math.min(1, currentValue));

  return (
    <div className="vertical-meter-wrapper" style={{ left: `${x}px`, top: `${y}px` }}>
      <img src={centerOn} className="vertical-meter-img" alt="Meter on" />
      <div className="vertical-meter-cropper" style={{ height: `${(1 - clamped) * 100}%` }}>
        <div className="vertical-meter-off-container">
          <img src={centerOff} className="vertical-meter-img-off" alt="Meter off" />
        </div>
      </div>
      <img src={bezel} className="vertical-meter-img" alt="Meter bezel" />
    </div>
  );
}
