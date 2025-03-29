import DigitalDisplay from '../components/DigitalDisplay';

export default function DigitalDisplayBlock() {
  const displays = [];

  // Top row (1x12)
  const topStartX = 58;
  const topY = 340;
  const topSpacingX = 126;
  const topLabels = [
    'PWR', 'TMP', 'FLX', 'RDN', 'ALT', 'AMP',
    'PWR', 'TMP', 'FLX', 'RDN', 'ALT', 'AMP'
  ];

  for (let i = 0; i < topLabels.length; i++) {
    displays.push(
      <DigitalDisplay
        key={`digi_${i}`}
        id={`digi_${i}`}
        x={topStartX + i * topSpacingX}
        y={topY}
        value={0}
        label={topLabels[i]}
      />
    );
  }

  // Side stack (3x1)
  const sideX = 988;
  const sideStartY = 750;
  const sideSpacingY = 80;
  const sideLabels = ['PWR', 'TMP', 'FLX'];

  for (let i = 0; i < sideLabels.length; i++) {
    const index = topLabels.length + i;
    displays.push(
      <DigitalDisplay
        key={`digi_${index}`}
        id={`digi_${index}`}
        x={sideX}
        y={sideStartY + i * sideSpacingY}
        value={0}
        label={sideLabels[i]}
      />
    );
  }

  return <>{displays}</>;
}
