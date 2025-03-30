import PanelButton from '../components/PanelButton';

export default function PanelButtonBlock() {
  const buttons: React.ReactElement[] = [];

  // 6x6 Grid
  const gridX = 280;
  const gridY = 570;
  const gridCols = 6;
  const gridRows = 6;
  const spacingX = 90;
  const spacingY = 60;
  const gridValues = [
    { label: 'A1' },
    { label: 'A2' },
    { label: 'A3' },
    { label: 'B1' },
    { label: 'B2' },
    { label: 'B3' },
  ];

  for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridCols; j++) {
      const index = i * gridCols + j;
      const def = gridValues[index % gridValues.length];
      const x = gridX - (gridCols * spacingX) / 2 + spacingX * (j + 0.5);
      const y = gridY - (gridRows * spacingY) / 2 + spacingY * (i + 0.5);
      buttons.push(
        <PanelButton
          key={`grid-${index}`}
          id={`panel_btn_grid_${index}`}
          x={x}
          y={y}
          label={def.label}
        />
      );
    }
  }

  // 1x6 Horizontal Strip
  const stripX = 1205;
  const stripY = 670;
  const stripCols = 6;
  const stripSpacing = 87;
  const stripValues = [
    { label: 'A1' },
    { label: 'A2' },
    { label: 'A3' },
    { label: 'B1' },
    { label: 'B2' },
    { label: 'B3' },
  ];

  for (let i = 0; i < stripCols; i++) {
    const def = stripValues[i % stripValues.length];
    const x = stripX - (stripCols * stripSpacing) / 2 + stripSpacing * (i + 0.5);
    const y = stripY;
    buttons.push(
      <PanelButton
        key={`strip-${i}`}
        id={`panel_btn_strip_${i}`}
        x={x}
        y={y}
        label={def.label}
      />
    );
  }

  return <>{buttons}</>;
}
