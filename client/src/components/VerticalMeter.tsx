import React, { useEffect, useState } from 'react';
import { useTestable } from '../hooks/useTestable';
import { registry } from '../state/registry';

import '../css/components/VerticalMeter.css';

import bezel from '../images/meter_bezel.png';
import centerOn from '../images/meter_center_on.png';
import centerOff from '../images/meter_center_off.png';

interface VerticalMeterProps {
  id: string;
  x: number;
  y: number;
  value: number; // 0 to 1
}

export default function VerticalMeter({ id, x, y, value }: VerticalMeterProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const { isTestMode } = useTestable(id);

  useEffect(() => {
    if (!isTestMode) {
      setCurrentValue(value);
    }
  }, [value, isTestMode]);

  // Self-initialization
  useEffect(() => {
    registry.acknowledge(id);
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
