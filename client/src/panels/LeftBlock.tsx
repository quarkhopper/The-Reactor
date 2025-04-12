import MasterButton from '../components/MasterButton';
import SliderControl from '../components/SliderControl';
import VerticalMeter from '../components/VerticalMeter';
import CircularGauge from '../components/CircularGauge';

export default function LeftBlock() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 120 }}>
      <MasterButton x={80} y={400} />
      <SliderControl
        id='target_power'
        x={140}
        y={625}
        moveEvent='target_power_update'
      />
      <VerticalMeter
            id='core_reactivity_meter'
            x={80}
            y={620}
            event='core_avg_reactivity_update'
          />
      <VerticalMeter
            id='target_temp_meter'
            x={20}
            y={620}
            event='target_power_update'
          />
      <CircularGauge
        id="core_temp_gauge"
        x={80}
        y={840}
        value={0}
        limit={0.8}
      />
    </div>
  )
}
