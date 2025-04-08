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
  return <>{displays}</>;
}
