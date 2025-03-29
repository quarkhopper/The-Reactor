import React from 'react';
import ConditionLight from '../components/ConditionLight';
import type { ConditionColor } from '../state/types';
import initRegistry from '../state/initRegistry';

export default function ConditionLightBlock() {
  const x = 750;
  const y = 170;
  const width = 1450;
  const columns = 5;
  const rows = 2;

  const values: { id: string; color: ConditionColor; label: string }[] = [
    { id: 'cond_SCRAM', color: 'off', label: 'SCRAM' },
    { id: 'cond_POWER', color: 'off', label: 'POWER' },
    { id: 'cond_FAULT', color: 'off', label: 'FAULT' },
    { id: 'cond_TEST', color: 'off', label: 'TEST' },
    { id: 'cond_STANDBY', color: 'off', label: 'STANDBY' },
    { id: 'cond_RUN', color: 'off', label: 'RUN' },
    { id: 'cond_WARN', color: 'off', label: 'WARN' },
    { id: 'cond_LOCKED', color: 'off', label: 'LOCKED' },
    { id: 'cond_AUX', color: 'off', label: 'AUX' },
    { id: 'cond_COOL', color: 'off', label: 'COOL' },
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
            id={entry.id}
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
