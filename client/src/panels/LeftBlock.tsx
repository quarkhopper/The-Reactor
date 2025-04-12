import MasterButton from '../components/MasterButton';
import SliderControl from '../components/SliderControl';
import VerticalMeter from '../components/VerticalMeter';
import CircularGauge from '../components/CircularGauge';
import DigitalDisplay from '../components/DigitalDisplay';

export default function LeftBlock() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 90 }}>
        <DigitalDisplay
            id='power_demand_4'
            x={0}
            y={400}
        /> 
        <DigitalDisplay
            id='power_demand_5'
            x={0}
            y={620}
        /> 
        <DigitalDisplay
            id='power_demand_6'
            x={0}
            y={840}
        /> 
      <MasterButton x={180} y={400} />
      <SliderControl
        id='target_power'
        x={240}
        y={625}
        moveEvent='target_power_update'
      />
      <VerticalMeter
            id='target_temp_meter'
            x={120}
            y={620}
            event='target_power_update'
          />
      <VerticalMeter
            id='core_reactivity_meter'
            x={180}
            y={620}
            event='core_avg_reactivity_update'
          />
      <CircularGauge
        id="core_temp_gauge"
        x={180}
        y={840}
        value={0}
        limit={0.8}
      />
    </div>
  )
}
