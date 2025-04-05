import KnobSelector from '../components/KnobSelector';

export default function KnobSelectorBlock() {
  const originX = 990;
  const originY = 440;
  const columns = 5;
  const spacingX = 107.5;
  const spacingY = 80;

  const knobValues = [
    { leftLabel: 'OFF', rightLabel: 'ON' },
    { leftLabel: 'LOW', rightLabel: 'HIGH' },
    { leftLabel: 'COOL', rightLabel: 'HEAT' },
    { leftLabel: 'MAN', rightLabel: 'AUTO' },
  ];

  while (knobValues.length < 15) {
    knobValues.push({ leftLabel: '', rightLabel: '' });
  }

  // Turbine controls
  const individualKnobs = [
    <KnobSelector
      key="knob_ind_0"
      id="knob_ind_0"
      x={620}
      y={625}
      leftLabel="PZ"
      rightLabel="RZ"
    />,
    <KnobSelector
      key="knob_ind_1"
      id="knob_ind_1"
      x={880}
      y={625}
      leftLabel="X^2"
      rightLabel="DIV"
    />,
  ];

  return <>{[...individualKnobs]}</>;
}
