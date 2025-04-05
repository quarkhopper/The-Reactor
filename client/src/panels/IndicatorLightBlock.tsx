import IndicatorLight from '../components/IndicatorLight';

export default function IndicatorLightBlock() {
  const lights: React.ReactElement[] = [];

  // Individual OPR lights
  /* lights.push(
    <IndicatorLight key="opr-left" id="blink_opr_left" x={630} y={750} label="OPR" />,
    <IndicatorLight key="opr-right" id="blink_opr_right" x={870} y={750} label="OPR" />
  ); */

  // Light grid (formerly LightPanel)
  const baseX = 1075;
  const baseY = 740;
  const columns = 6;
  const rows = 3;
  const xSpacing = 70;
  const ySpacing = 80;

  const gridValues: { label?: string }[] = [
    { label: 'A1' },
    { label: 'A2' },
    { label: 'A3' },
    { label: 'A4' },
    { label: 'B1' },
    { label: 'B2' },
    { label: 'B3' },
    { label: 'B4' },
    { label: 'C1' },
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
        id={`blink_grid_${i}`}
        x={x}
        y={y}
        label={entry.label}
      />
    );
  });

  return <>{lights}</>;
}
