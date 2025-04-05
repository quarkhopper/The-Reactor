import CircularGauge from '../components/CircularGauge';

export default function CircularGaugeBlock() {
  return (
    <CircularGauge
      id="circular_gauge"
      x={750}
      y={690}
      value={0}
      limit={0.8}
    />
  );
}
