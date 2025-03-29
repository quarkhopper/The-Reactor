// client/src/blocks/KnobSelectorBlock.tsx

import KnobSelector from '../components/KnobSelector';

export default function KnobSelectorBlock() {
  // Panel origin and layout
  const originX = 990;
  const originY = 440;
  const columns = 5;
  const spacingX = 107.5; // 430 / (5 - 1)
  const spacingY = 80;

  // Original values from App.tsx
  const knobValues = [
    { leftLabel: 'OFF', rightLabel: 'ON' },
    { leftLabel: 'LOW', rightLabel: 'HIGH' },
    { leftLabel: 'COOL', rightLabel: 'HEAT' },
    { leftLabel: 'MAN', rightLabel: 'AUTO' },
  ];

  // Fill the rest with blanks up to 15
  while (knobValues.length < 15) {
    knobValues.push({ leftLabel: '', rightLabel: '' });
  }

  const gridKnobs = knobValues.map((val, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = originX + col * spacingX;
    const y = originY + row * spacingY;
    return (
      <KnobSelector
        key={`grid-${index}`}
        x={x}
        y={y}
        leftLabel={val.leftLabel}
        rightLabel={val.rightLabel}
      />
    );
  });

  // The two independent knobs from App.tsx
  const individualKnobs = [
    <KnobSelector
      key="independent-1"
      x={620}
      y={625}
      leftLabel="PZ"
      rightLabel="RZ"
    />,
    <KnobSelector
      key="independent-2"
      x={880}
      y={625}
      leftLabel="X^2"
      rightLabel="DIV"
    />,
  ];

  return <>{[...gridKnobs, ...individualKnobs]}</>;
}
