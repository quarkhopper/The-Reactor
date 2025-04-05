import React from 'react';
import KnobSelector from '../components/KnobSelector';
import SliderControl from '../components/SliderControl';
import DigitalDisplay from '../components/DigitalDisplay';
import IndicatorLight from '../components/IndicatorLight';

interface CoolantPumpBlockProps {
  idPrefix: string;  // 'primary' or 'secondary'
  x: number;
  y: number;
}

export default function CoolantPumpBlock({ idPrefix, x, y }: CoolantPumpBlockProps) {
  return (
    <div style={{ position: 'absolute', top: y, left: x }}>
      {/* Pump Temperature Display */}
      <DigitalDisplay id={`${idPrefix}_temp`} x={0} y={0} value={88} />
      {/* Pump Pressure Display */}
      <DigitalDisplay id={`${idPrefix}_pressure`} x={0} y={50} value={88} />
      {/* Pump Speed Control (Slider) */}
      <SliderControl 
        id={`${idPrefix}_speed`} 
        x={100} 
        y={25} 
        target="cooling" 
        index={idPrefix === 'primary' ? 0 : 1} 
      />
      {/* Status Indicator Light */}
      <IndicatorLight id={`${idPrefix}_status`} x={200} y={0} />
      {/* Pump On/Off Control (Knob) */}
      <KnobSelector id={`${idPrefix}_control`} x={200} y={50} leftLabel="Off" rightLabel="On" />
    </div>
  );
} 