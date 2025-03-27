// client/src/components/ButtonPanel.tsx
import React from 'react';
import PanelButton, { ButtonColor } from './PanelButton';

interface ButtonDefinition {
  label?: string;
  topLabel?: string;
  color: ButtonColor;
}

interface ButtonPanelProps {
  x: number; // center x in px
  y: number; // center y in px
  rows: number;
  columns: number;
  spacingX: number; // px between button centers horizontally
  spacingY: number; // px between button centers vertically
  values?: ButtonDefinition[];
}

export default function ButtonPanel({
  x,
  y,
  rows,
  columns,
  spacingX,
  spacingY,
  values = [],
}: ButtonPanelProps) {
  const totalWidth = spacingX * columns;
  const totalHeight = spacingY * rows;
  const buttons = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      const { label, topLabel, color } = values[index] ?? { color: 'white' };

      const cx = x - totalWidth / 2 + spacingX * (col + 0.5);
      const cy = y - totalHeight / 2 + spacingY * (row + 0.5);

      buttons.push(
        <PanelButton
          key={index}
          x={cx}
          y={cy}
          color={color}
          label={label}
          topLabel={topLabel}
        />
      );
    }
  }

  return <>{buttons}</>;
}
