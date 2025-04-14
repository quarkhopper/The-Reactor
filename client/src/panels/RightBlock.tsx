import ScramButton from '../components/ScramButton';
import SliderControl from '../components/SliderControl';
import VerticalMeter from '../components/VerticalMeter';
import CircularGauge from '../components/CircularGauge';
import DigitalDisplay from '../components/DigitalDisplay';
import KnobSelector from '../components/KnobSelector';

export default function RightBlock() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 1170 }}>
       <DigitalDisplay
            id='power_demand_3'
            x={240}
            y={400}
            valueEvent='grid_load_update'
            index={2}
        /> 
        <DigitalDisplay
            id='power_cap_2'
            x={240}
            y={620}
            valueEvent='capacitor_charge_update'
            index={1}
        /> 
       <DigitalDisplay
            id='power_demand_4'
            x={240}
            y={840}
            valueEvent='grid_load_update'
            index={3}
        /> 
      <ScramButton x={60} y={400} />
      <KnobSelector
        id='use_capacitor_a'
        x={130}
        y={565}
        leftLabel='OFF'
        rightLabel='ON'
        selectEvent={{ type: 'use_capacitor', index: 0 }}
      />
      <KnobSelector
        id='use_capacitor_b'
        x={130}
        y={680}
        leftLabel='OFF'
        rightLabel='ON'
        selectEvent={{ type: 'use_capacitor', index: 1 }}
      />
      <SliderControl 
        id="pump_speed" 
        x={0} 
        y={620} 
        moveEvent='pump_speed_adjust'
        initvalue={0.0}
      />
      <VerticalMeter
            id='target_turbine_rpm'
            x={60}
            y={620}
            event='target_turbine_rpm'
          />
      {/* <VerticalMeter
            id='steam_pressure_meter'
            x={120}
            y={620}
            event='steam_pressure_update'
          /> */}
      <CircularGauge
        id="turbine_rpm_gauge"
        x={60}
        y={840}
        value={0}
        limit={0.8}
        valueEvent='turbine_rpm_update'
        />
    </div>
  );
}