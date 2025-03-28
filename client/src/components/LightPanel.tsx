import IndicatorLight, { IndicatorColor } from './IndicatorLight';

interface LightEntry {
  color: IndicatorColor;
  label?: string;
  topLabel?: string;
}

interface LightPanelProps {
  x: number;
  y: number;
  rows: number;
  columns: number;
  xSpacing?: number;
  ySpacing?: number;
  values: LightEntry[];
}

export default function LightPanel({
  x,
  y,
  rows,
  columns,
  xSpacing = 60,
  ySpacing = 60,
  values,
}: LightPanelProps) {
  const total = rows * columns;

  const filledValues = Array.from({ length: total }, (_, i) =>
    values[i] ?? { color: 'off' }
  );

  return (
    <>
      {filledValues.map((entry, i) => {
        const row = Math.floor(i / columns);
        const col = i % columns;
        return (
          <IndicatorLight
            key={i}
            x={x + col * xSpacing}
            y={y + row * ySpacing}
            color={entry.color}
            label={entry.label}
            topLabel={entry.topLabel}
          />
        );
      })}
    </>
  );
}
