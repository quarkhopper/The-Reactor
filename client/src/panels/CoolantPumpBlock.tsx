import React from 'react';
import KnobSelector from '../components/KnobSelector';
import SliderControl from '../components/SliderControl';
import DigitalDisplay from '../components/DigitalDisplay';
import IndicatorLight from '../components/IndicatorLight';
import VerticalMeter from '../components/VerticalMeter';

interface CoolantPumpBlockProps {
  idPrefix: string;  // 'primary' or 'secondary'
  x: number;
  y: number;
}

export default function CoolantPumpBlock({ idPrefix, x, y }: CoolantPumpBlockProps) {
  return (
    <div style={{ position: 'absolute', top: y, left: x }}>
      <SliderControl 
        id={`${idPrefix}_speed`} 
        x={0} 
        y={90} 
        target="cooling" 
        index={idPrefix === 'primary' ? 0 : 1} 
      />
      <VerticalMeter
            key={`pump-temp-meter-${idPrefix}`}
            id={`pump_temp_meter_${idPrefix}`}
            x={60}
            y={90}
          />
      <VerticalMeter
            key={`pump-pres-meter-${idPrefix}`}
            id={`pump_pres_meter_${idPrefix}`}
            x={120}
            y={90}
          />
    </div>
  );
} 