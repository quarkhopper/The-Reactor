// client/src/components/DigitalDisplayPanel.tsx
import React from 'react';
import DigitalDisplay from './DigitalDisplay';

interface DigitalDisplayPanelProps {
  x: number;
  y: number;
  columns: number;
  rows: number;
  spacingX: number;
  spacingY: number;
  values: { value: number; label?: string }[];
}

export default function DigitalDisplayPanel({
  x,
  y,
  columns,
  rows,
  spacingX,
  spacingY,
  values,
}: DigitalDisplayPanelProps) {
  return (
    <>
      {values.map((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        if (row >= rows) return null;

        const xpos = x + col * spacingX;
        const ypos = y + row * spacingY;

        return (
          <DigitalDisplay
            key={index}
            x={xpos}
            y={ypos}
            value={item.value}
            label={item.label}
          />
        );
      })}
    </>
  );
}
