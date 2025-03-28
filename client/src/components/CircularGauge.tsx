import React from 'react';
import '../css/components/CircularGauge.css';
import bezel from '../images/gauge_bezel.png';
import card from '../images/gauge_card.png';
import needle from '../images/gauge_needle.png';
import lightOff from '../images/gauge_light_off.png';
import lightOn from '../images/gauge_light_on.png';

interface CircularGaugeProps {
  x: number;
  y: number;
  value: number;  // 0–1
  limit: number;  // Light turns on above this
}

export default function CircularGauge({ x, y, value, limit }: CircularGaugeProps) {
  const clampedValue = Math.min(Math.max(value, 0), 1);
  const angle = clampedValue * 180 - 90; // -90° to +90°
  const showLight = clampedValue > limit;

  return (
    <div
      className="circular-gauge-wrapper"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="circular-gauge">
        <img src={card} className="gauge-card" />
        <img
          src={needle}
          className="gauge-needle"
          style={{ transform: `rotate(${angle}deg)` }}
        />
        <img src={showLight ? lightOn : lightOff} className="gauge-light" />
        <img src={bezel} className="gauge-bezel" />
      </div>
    </div>
  );
}
