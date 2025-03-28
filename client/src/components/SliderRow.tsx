// client/src/components/SliderRow.tsx
import React from 'react';
import SliderControl from './SliderControl';

interface SliderRowProps {
  x: number;
  y: number;
  columns: number;
  spacingX: number;
  height?: number;
  onChange?: (index: number, value: number) => void;
}

export default function SliderRow({
  x,
  y,
  columns,
  spacingX,
  height,
  onChange,
}: SliderRowProps) {
  const totalWidth = spacingX * columns;

  return (
    <>
      {Array.from({ length: columns }).map((_, i) => {
        const cx = x - totalWidth / 2 + spacingX * (i + 0.5);
        return (
          <SliderControl
            key={i}
            x={cx}
            y={y}
            height={height}
            onChange={(val) => onChange?.(i, val)}
          />
        );
      })}
    </>
  );
}
