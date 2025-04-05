import CircularGauge from '../components/CircularGauge';

export default function CircularGaugeBlock() {
  return (
    <div>
    <CircularGauge
      id="turbine_rpm_gauge"
      x={750}
      y={460}
      value={0}
      limit={0.8}
    />
    <CircularGauge
      id="core_temp_gauge"
      x={750}
      y={690}
      value={0}
      limit={0.8}
    />
    </div>
  );
}
