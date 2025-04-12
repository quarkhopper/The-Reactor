import ColorButton from '../components/ColorButton';

export default function CoreBlock() {
  const buttons: React.ReactElement[] = [];

  // 6x6 Fuel Rod Grid
  const gridX = 750;
  const gridY = 630;
  const gridCols = 7;
  const gridRows = 7;
  const spacingX = 100;
  const spacingY = 85;

  const excludePositions = [
    [0, 0],
    [6, 0],
    [0, 6],
    [6, 6]
  ];


  for (let y = 0; y < gridRows; y++) {
    for (let x = 0; x < gridCols; x++) {
      const posX = gridX - (gridCols * spacingX) / 2 + spacingX * (x + 0.5);
      const posY = gridY - (gridRows * spacingY) / 2 + spacingY * (y + 0.5);
      if (excludePositions.some(pos => pos[0] === x && pos[1] === y)) {
        continue; // Skip excluded positions
      }
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
