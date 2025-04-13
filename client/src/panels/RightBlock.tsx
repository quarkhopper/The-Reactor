import ScramButton from '../components/ScramButton';
import SliderControl from '../components/SliderControl';
import VerticalMeter from '../components/VerticalMeter';
import CircularGauge from '../components/CircularGauge';
import DigitalDisplay from '../components/DigitalDisplay';

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
      <SliderControl 
        id="pump_speed" 
        x={0} 
        y={620} 
        moveEvent='pump_speed_adjust'
        initvalue={0.0}
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
        valueEvent='turbine_rpm_update'
        />
    </div>
  );
} 