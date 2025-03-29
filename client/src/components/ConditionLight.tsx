import React, { useEffect, useState } from 'react';
import '../css/components/ConditionLight.css';

import off from '../images/condition_off.png';
import red from '../images/condition_red.png';
import green from '../images/condition_green.png';
import amber from '../images/condition_amber.png';
import white from '../images/condition_white.png';
import shine from '../images/condition_shine.png';

import initRegistry from '../state/initRegistry';

type ConditionColor = 'off' | 'red' | 'green' | 'amber' | 'white';

interface ConditionLightProps {
  id: string;
  x: number;
  y: number;
  color?: ConditionColor;
  width?: number;
  label?: string;
}

const conditionImages: Record<ConditionColor, string> = {
  off,
  red,
  green,
  amber,
  white,
};

export default function ConditionLight({
  id,
  x,
  y,
  color = 'off',
  width = 100,
  label,
}: ConditionLightProps) {
  const [displayColor, setDisplayColor] = useState<ConditionColor>(color);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setDisplayColor('off');
        initRegistry.acknowledge(id);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => {
      window.removeEventListener('ui-event', handler as EventListener);
    };
  }, [id]);

  return (
    <div
      className="condition-light-wrapper"
      style={{ left: `${x}px`, top: `${y}px`, width: `${width}px` }}
    >
      <img
        src={conditionImages[displayColor]}
        alt={`Condition light ${displayColor}`}
        className="condition-light-img"
      />
      {label && <div className="condition-light-label">{label}</div>}
      <img
        src={shine}
        alt="shine overlay"
        className="condition-light-shine"
      />
    </div>
  );
}
