import React from 'react';
import ConditionLight from './ConditionLight';

export interface ConditionPanelProps {
  x: number;
  y: number;
  width: number;
  rows: number;
  columns: number;
  values: {
    color: 'red' | 'green' | 'amber' | 'white' | 'off';
    label?: string;
  }[];
}

export default function ConditionPanel({
  x,
  y,
  width,
  rows,
  columns,
  values,
}: ConditionPanelProps) {
  const lightWidth = width / columns;
  const lightHeight = lightWidth / (707 / 274); // Maintain aspect ratio
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
