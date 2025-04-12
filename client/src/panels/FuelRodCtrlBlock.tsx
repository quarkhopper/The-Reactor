// import FuelRodButton from '../components/FuelRodButton';
import ColorButton from '../components/ColorButton';

export default function FuelRodButtonBlock() {
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
        <ColorButton
          key={`fuel-${x}-${y}`}
          id={`fuel_rod_button_${x}_${y}`}
          x={posX}
          y={posY}
          gridX={x}
          gridY={y}
          toggleSendEvent='fuel_rod_state_toggle'
          colorMap={[
            { range: [-Infinity, 0], color: 'off' },
            { range: [0, 0.2], color: 'green' },
            { range: [0.2, 0.5], color: 'amber' },
            { range: [0.5, 0.8], color: 'red' },
            { range: [0.8, Infinity], color: 'white' },
          ]}
          colorEvent={{ type: 'temperature_update'}}
          litEvent={{ type: 'fuel_rod_state_update', value: 'engaged' }}
          dimEvent={{ type: 'fuel_rod_state_update', value: 'withdrawn' }}
          blinkEvent={{ type: 'fuel_rod_state_update', value: 'transitioning' }}
        />
      );
    }
  }
  return <>{buttons}</>;
}
