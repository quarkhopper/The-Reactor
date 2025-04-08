import CircularGauge from '../components/CircularGauge';

export default function CircularGaugeBlock() {
  return (
    <div>
    <CircularGauge
      id="turbine_rpm_gauge"
      x={750}
      y={480}
      value={0}
      limit={0.8}
      eventType="turbine_rpm_update"
    />
    <CircularGauge
      id="core_temp_gauge"
      x={750}
      y={830}
      value={0}
      limit={0.8}
      eventType="core_temp_update"
    />
    </div>
  );
}
