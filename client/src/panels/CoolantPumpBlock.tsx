import SliderControl from '../components/SliderControl';
import VerticalMeter from '../components/VerticalMeter';

interface CoolantPumpBlockProps {
  x: number;
  y: number;
}

export default function CoolantPumpBlock({ x, y }: CoolantPumpBlockProps) {
  return (
    <div style={{ position: 'absolute', top: y, left: x }}>
      <SliderControl 
        id="pump_speed" 
        x={0} 
        y={90} 
        target="cooling" 
      />
      <VerticalMeter
            key={`pump-temp-meter`}
            id={`pump_temp_meter`}
            x={60}
            y={90}
          />
      <VerticalMeter
            key={`pump-pres-meter`}
            id={`pump_pres_meter`}
            x={120}
            y={90}
          />
    </div>
  );
} 