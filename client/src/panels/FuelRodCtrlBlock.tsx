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
  return <>{buttons}</>;
}
