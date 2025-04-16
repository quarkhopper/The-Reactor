import ColorButton from '../components/ColorButton';
import IndicatorLight from '../components/IndicatorLight';

export default function CoreBlock() {
  const buttons: React.ReactElement[] = [];
  const lights: React.ReactElement[] = [];

  const buttonGridX = 750;
  const buttonGridY = 630;
  const buttonGridCols = 7;
  const buttonGridRows = 7;
  const buttonSpacingX = 100;
  const buttonSpacingY = 85;
  const lightGridX = 750;
  const lightGridY = 625;
  const lightGridCols = 6;
  const lightGridRows = 6;
  const lightSpacingX = 100;
  const lightSpacingY = 85;


  const excludePositions = [
    [0, 0],
    [6, 0],
    [0, 6],
    [6, 6]
  ];


  for (let y = 0; y < buttonGridRows; y++) {
    for (let x = 0; x < buttonGridCols; x++) {
      const posX = buttonGridX - (buttonGridCols * buttonSpacingX) / 2 + buttonSpacingX * (x + 0.5);
      const posY = buttonGridY - (buttonGridRows * buttonSpacingY) / 2 + buttonSpacingY * (y + 0.5);
      if (excludePositions.some(pos => pos[0] === x && pos[1] === y)) {
        continue; // Skip excluded positions
      }
      buttons.push(
        <ColorButton
          key={`fuel_rod_button_${x}_${y}`}
          id={`fuel_rod_button_${x}_${y}`}
          x={posX}
          y={posY}
          gridX={x}
          gridY={y}
          toggleSendEvent='fuel_rod_state_toggle'
          colorMap={[
            { range: [0, 0.2], color: 'green' },
            { range: [0.2, 0.5], color: 'amber' },
            { range: [0.5, 0.8], color: 'red' },
            { range: [0.8, 1.0], color: 'white' },
          ]}
          colorEvent={{ type: 'temperature_update'}}
          litEvent={{ type: 'fuel_rod_state_update', value: 'engaged' }}
          dimEvent={{ type: 'fuel_rod_state_update', value: 'withdrawn' }}
          blinkEvent={{ type: 'fuel_rod_state_update', value: 'transitioning' }}
        />
      );
    }
  }

  for (let y = 0; y < lightGridRows; y++) {
    for (let x = 0; x < lightGridCols; x++) {
      const posX = lightGridX - (lightGridCols * lightSpacingX) / 2 + lightSpacingX * (x + 0.5);
      const posY = lightGridY - (lightGridRows * lightSpacingY) / 2 + lightSpacingY * (y + 0.5);
      lights.push(
        <IndicatorLight
          key={`control_rod_light_${x}_${y}`}
          id={`control_rod_light_${x}_${y}`}
          x={posX}
          y={posY}
          gridX={x}
          gridY={y}
          colorMap={[
            { range: [0, 0.5], color: 'green' },
            { range: [0.5, 0.8], color: 'amber' },
            { range: [0.8, 0.9], color: 'red' },
            { range: [0.9, 1.0], color: 'off' },
          ]}
          colorEvent={{ type: 'control_rod_update'}}
        />
      );
    }
  }

  return <>{buttons}{lights}</>;
}
