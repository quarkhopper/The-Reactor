import PowerButton from '../components/PowerButton';
import SliderControl from '../components/SliderControl';
import VerticalMeter from '../components/VerticalMeter';
import CircularGauge from '../components/CircularGauge';
import DigitalDisplay from '../components/DigitalDisplay';
import KnobSelector from '../components/KnobSelector';

export default function LeftBlock() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 90 }}>
        <DigitalDisplay
            id='power_demand_1'
            x={0}
            y={400}
            valueEvent='grid_load_update'
            index={0}
        /> 
        <DigitalDisplay
            id='power_cap_1'
            x={0}
            y={620}
            valueEvent='capacitor_charge_update'
            index={0}

        /> 
        <DigitalDisplay
            id='power_demand_2'
            x={0}
            y={840}
            valueEvent='grid_load_update'
            index={1}
        /> 
      <PowerButton x={180} y={400} />
      <KnobSelector
        id='control_rod_group_a_sel'
        x={110}
        y={565}
        leftLabel='OFF'
        rightLabel='ON'
        selectEvent={{ type: 'use_control_rod_group', index: 0 }}
      />
      <KnobSelector
        id='control_rod_group_b_sel'
        x={110}
        y={680}
        leftLabel='OFF'
        rightLabel='ON'
        selectEvent={{ type: 'use_control_rod_group', index: 1 }}
      />
      <SliderControl
        id='target_power'
        x={240}
        y={625}
        moveEvent='target_temp_update'
        initvalue={0.0}
      />
      <VerticalMeter
            id='thermal_peak'
            x={180}
            y={620}
            event='thermal_peak'
          />
      <CircularGauge
        id="core_temp_gauge"
        x={180}
        y={840}
        value={0}
        limit={0.8}
        valueEvent='core_temp_update'
      />
    </div>
  )
}
