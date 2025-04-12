import ScramButton from '../components/ScramButton';
import SliderControl from '../components/SliderControl';
import VerticalMeter from '../components/VerticalMeter';
import CircularGauge from '../components/CircularGauge';

export default function RightBlock() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 1250 }}>
      <ScramButton x={60} y={400} />
      <SliderControl 
        id="pump_speed" 
        x={0} 
        y={620} 
        moveEvent='pump_speed_adjust'
      />
      <VerticalMeter
            id='pump_temp_meter'
            x={60}
            y={620}
            event='coolant-temp-update'
          />
      <VerticalMeter
            id='pump_pres_meter'
            x={120}
            y={620}
            event='coolant-pressure-update'
          />
      <CircularGauge
        id="turbine_rpm_gauge"
        x={60}
        y={840}
        value={0}
        limit={0.8}
        />
    </div>
  );
} 