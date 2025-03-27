// client/src/components/ConditionPanel.tsx
import React from 'react';
import ConditionLight from './ConditionLight';
import '../css/components/ConditionPanel.css';

type ConditionColor = 'off' | 'green' | 'red' | 'amber' | 'white';

interface ConditionPanelProps {
  x: number;             // center x in px
  y: number;             // center y in px
  width: number;         // total width of the grid in px
  rows: number;
  columns: number;
  values?: ConditionColor[]; // length = rows * columns
}

export default function ConditionPanel({
    x,
    y,
    width,
    rows,
    columns,
    values = [],
  }: ConditionPanelProps) {
    const lightWidth = width / columns;
    const aspectRatio = 707 / 274; // or 2.58
    const lightHeight = lightWidth / aspectRatio;
    const totalHeight = lightHeight * rows;
  
    const lights = [];
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const color = values[index] ?? 'off';
  
        const cx = x - width / 2 + lightWidth * (col + 0.5);
        const cy = y - totalHeight / 2 + lightHeight * (row + 0.5);
  
        lights.push(
          <ConditionLight
            key={index}
            x={cx}
            y={cy}
            width={lightWidth}
            color={color}
          />
        );
      }
    }
  
    return <>{lights}</>;
  }
  
