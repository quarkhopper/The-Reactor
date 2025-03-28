import KnobSelector from './KnobSelector';

interface KnobSpec {
  leftLabel: string;
  rightLabel: string;
}

interface KnobPanelProps {
  x: number;
  y: number;
  width: number;
  rows: number;
  columns: number;
  values: KnobSpec[];
}

export default function KnobPanel({
  x,
  y,
  width,
  rows,
  columns,
  values,
}: KnobPanelProps) {
  const spacingX = width / (columns - 1);
  const spacingY = 80;
  const total = rows * columns;

  const filledValues = Array.from({ length: total }, (_, i) =>
    values[i] ?? { leftLabel: '', rightLabel: '' }
  );

  return (
    <>
      {filledValues.map((val, idx) => {
        const col = idx % columns;
        const row = Math.floor(idx / columns);
        const px = x + col * spacingX;
        const py = y + row * spacingY;
        return (
          <KnobSelector
            key={idx}
            x={px}
            y={py}
            leftLabel={val.leftLabel}
            rightLabel={val.rightLabel}
          />
        );
      })}
    </>
  );
}
