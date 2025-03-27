// client/src/components/MeterRow.tsx
import React from 'react';
import VerticalMeter from './VerticalMeter';

interface MeterDefinition {
  value: number;
}

interface MeterRowProps {
  x: number; // center x
  y: number; // center y
  columns: number;
  spacingX: number;
  meters?: MeterDefinition[];
}

export default function MeterRow({
  x,
  y,
  columns,
  spacingX,
  meters = [],
}: MeterRowProps) {
  const totalWidth = spacingX * columns;
  const rowY = y; // single row, so just centered vertically

  return (
    <>
      {Array.from({ length: columns }).map((_, col) => {
        const index = col;
        const { value } = meters[index] ?? { value: 0 };
        const cx = x - totalWidth / 2 + spacingX * (col + 0.5);

        return <VerticalMeter key={index} x={cx} y={rowY} value={value} />;
      })}
    </>
  );
}
