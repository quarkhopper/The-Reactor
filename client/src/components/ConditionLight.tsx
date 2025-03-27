// client/src/components/ConditionLight.tsx
import React from 'react';
import '../css/components/ConditionLight.css';
import conditionOff from '../images/condition_off.png';
import conditionGreen from '../images/condition_green.png';
import conditionRed from '../images/condition_red.png';
import conditionAmber from '../images/condition_amber.png';
import conditionWhite from '../images/condition_white.png';

type ConditionColor = 'off' | 'green' | 'red' | 'amber' | 'white';

interface ConditionLightProps {
  x: number;
  y: number;
  color?: ConditionColor;
  width?: number; // added
}

const conditionImages: Record<ConditionColor, string> = {
  off: conditionOff,
  green: conditionGreen,
  red: conditionRed,
  amber: conditionAmber,
  white: conditionWhite,
};

export default function ConditionLight({
  x,
  y,
  color = 'off',
  width = 100, // fallback
}: ConditionLightProps) {
  return (
    <div
      className="condition-light-wrapper"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <img
        src={conditionImages[color]}
        alt={`Condition light ${color}`}
        className="condition-light-img"
        style={{ width: `${width}px` }}
      />
    </div>
  );
}
