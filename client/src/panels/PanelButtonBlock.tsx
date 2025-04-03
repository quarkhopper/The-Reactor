import PanelButton from '../components/PanelButton';
import FuelRodButton from '../components/FuelRodButton';

export default function PanelButtonBlock() {
  const buttons: React.ReactElement[] = [];

  // 6x6 Fuel Rod Grid
  const gridX = 280;
  const gridY = 570;
  const gridCols = 6;
  const gridRows = 6;
  const spacingX = 90;
  const spacingY = 60;

  for (let y = 0; y < gridRows; y++) {
    for (let x = 0; x < gridCols; x++) {
      const posX = gridX - (gridCols * spacingX) / 2 + spacingX * (x + 0.5);
      const posY = gridY - (gridRows * spacingY) / 2 + spacingY * (y + 0.5);

      buttons.push(
        <FuelRodButton
          key={`fuel-${x}-${y}`}
          id={`fuel_rod_button_${x}_${y}`}
          x={posX}
          y={posY}
          gridX={x}
          gridY={y}
          label=""
        />
      );
    }
  }

  // 1x6 Horizontal Aux Strip
  const stripX = 1205;
  const stripY = 670;
  const stripCols = 6;
  const stripSpacing = 87;

  for (let i = 0; i < stripCols; i++) {
    const x = stripX - (stripCols * stripSpacing) / 2 + stripSpacing * (i + 0.5);
    const y = stripY;

    buttons.push(
      <PanelButton
        key={`aux-${i}`}
        id={`aux_button_${i}`}
        x={x}
        y={y}
        label=""
      />
    );
  }

  return <>{buttons}</>;
}
