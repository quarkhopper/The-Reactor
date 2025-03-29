import IndicatorLight from '../components/IndicatorLight';
import type { IndicatorColor } from '../components/IndicatorLight';

export default function IndicatorLightBlock() {
  const lights: React.ReactElement[] = [];

  // Individual OPR lights
  lights.push(
    <IndicatorLight key="opr-left" x={630} y={750} color="red" label="OPR" />,
    <IndicatorLight key="opr-right" x={870} y={750} color="red" label="OPR" />
  );

  // Light grid (formerly LightPanel)
  const baseX = 1075;
  const baseY = 740;
  const columns = 6;
  const rows = 3;
  const xSpacing = 70;
  const ySpacing = 80;

  const gridValues: { color: IndicatorColor; label?: string }[] = [
    { color: 'red', label: 'A1' },
    { color: 'green', label: 'A2' },
    { color: 'amber', label: 'A3' },
    { color: 'white', label: 'A4' },
    { color: 'green', label: 'B1' },
    { color: 'off', label: 'B2' },
    { color: 'red', label: 'B3' },
    { color: 'amber', label: 'B4' },
    { color: 'white', label: 'C1' },
  ];

  const total = rows * columns;
  const filledGrid = Array.from({ length: total }, (_, i) =>
    gridValues[i] ?? { color: 'off' }
  );

  filledGrid.forEach((entry, i) => {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const x = baseX + col * xSpacing;
    const y = baseY + row * ySpacing;

    lights.push(
      <IndicatorLight
        key={`grid-${i}`}
        x={x}
        y={y}
        color={entry.color}
        label={entry.label}
      />
    );
  });

  return <>{lights}</>;
}
