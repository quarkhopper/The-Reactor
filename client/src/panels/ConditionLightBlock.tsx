import React from 'react';
import ConditionLight from '../components/ConditionLight';
import type { ConditionColor } from '../state/types';


export default function ConditionLightBlock() {
  const x = 750;
  const y = 170;
  const width = 1450;
  const columns = 5;
  const rows = 2;

  const values: { color: ConditionColor; label: string }[] = [
    { color: 'off', label: 'SCRAM' },
    { color: 'off', label: 'POWER' },
    { color: 'off', label: 'FAULT' },
    { color: 'off', label: 'TEST' },
    { color: 'off', label: 'STANDBY' },
    { color: 'off', label: 'RUN' },
    { color: 'off', label: 'WARN' },
    { color: 'off', label: 'LOCKED' },
    { color: 'off', label: 'AUX' },
    { color: 'off', label: 'COOL' },
  ];

  const lightWidth = width / columns;
  const lightHeight = lightWidth / (707 / 274);
  const totalHeight = lightHeight * rows;
  const startX = x - width / 2 + lightWidth / 2;
  const startY = y - totalHeight / 2 + lightHeight / 2;

  return (
    <>
      {values.map((entry, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const cx = startX + col * lightWidth;
        const cy = startY + row * lightHeight;

        return (
          <ConditionLight
            key={index}
            x={cx}
            y={cy}
            width={lightWidth}
            color={entry.color}
            label={entry.label}
          />
        );
      })}
    </>
  );
}
