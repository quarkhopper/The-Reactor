// client/src/components/VerticalMeter.tsx
import React from 'react';
import '../css/components/VerticalMeter.css';

import bezel from '../images/meter_bezel.png';
import centerOn from '../images/meter_center_on.png';
import centerOff from '../images/meter_center_off.png';

interface VerticalMeterProps {
  x: number;
  y: number;
  value: number; // 0 to 1
}

export default function VerticalMeter({ x, y, value }: VerticalMeterProps) {
    const clamped = Math.max(0, Math.min(1, value));
  
    return (
      <div
        className="vertical-meter-wrapper"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <img src={centerOn} className="vertical-meter-img" alt="Meter on" />
  
        <div
          className="vertical-meter-cropper"
          style={{ height: `${(1 - clamped) * 100}%` }}
        >
          <div className="vertical-meter-off-container">
          <img
            src={centerOff}
            className="vertical-meter-img-off"
            alt="Meter off"
            />
          </div>
        </div>
  
        <img src={bezel} className="vertical-meter-img" alt="Meter bezel" />
      </div>
    );
  }
  
  
