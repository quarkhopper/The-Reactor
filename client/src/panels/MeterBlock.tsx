import VerticalMeter from '../components/VerticalMeter';

export default function MeterBlock() {
  const meters = [
    { value: 0.0 },
    { value: 0.25 },
    { value: 0.5 },
    { value: 0.75 },
    { value: 1.0 },
  ];

  const baseX = 750;
  const baseY = 480;
  const columns = 5;
  const spacingX = 55;
  const totalWidth = spacingX * columns;

  return (
    <>
      {meters.map((meter, index) => {
        const cx = baseX - totalWidth / 2 + spacingX * (index + 0.5);
        return (
          <VerticalMeter
            key={`meter-${index}`}
            x={cx}
            y={baseY}
            value={meter.value}
          />
        );
      })}
    </>
  );
}
