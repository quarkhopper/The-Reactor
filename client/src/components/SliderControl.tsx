import React, { useRef, useState, useEffect } from 'react';
import eventBus from '../state/eventBus';

import baseImg from '../images/slider_base.png';
import knobImg from '../images/slider_knob.png';

import '../css/components/SliderControl.css';

import initRegistry from '../state/initRegistry';
import testRegistry from '../state/testRegistry';

interface SliderControlProps {
  id: string;
  x: number;
  y: number;
  rodIndex: number; // Add rodIndex prop
  onChange?: (value: number, rodIndex: number) => void; // Pass rodIndex in onChange
}

const SliderControl: React.FC<SliderControlProps> = ({ id, x, y, rodIndex, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState(0);
  const knobTravelRatio = 0.68;

  const updateValue = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = clientY - rect.top;
    const travelHeight = rect.height * knobTravelRatio;
    const clamped = Math.min(Math.max(relY, 0), travelHeight);
    const newValue = 1 - clamped / travelHeight;
    setValue(newValue);
    if (onChange) onChange(newValue, rodIndex); // Pass rodIndex with the value
    
    // Emit event on the event bus
    eventBus.publish({
      type: 'slider-change',
      source: 'SliderControl',
      payload: { rodIndex, value: newValue }
    });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging) updateValue(e.clientY);
    };
    const onMouseUp = () => setDragging(false);

    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setValue(0); // Reset to 0 on init
        initRegistry.acknowledge(id);
      }

      if (e.detail.type === 'test') {
        // Sweep animation
        const steps = 20;
        let i = 0;
        const interval = setInterval(() => {
          const phase = i < steps ? i / steps : 2 - i / steps;
          setValue(phase);
          if (onChange) onChange(phase, rodIndex); // Pass rodIndex with the value
          
          // Emit event on the event bus during test sweep
          eventBus.publish({
            type: 'slider-change',
            source: 'SliderControl',
            payload: { rodIndex, value: phase }
          });
          
          i++;
          if (i > steps * 2) {
            clearInterval(interval);
            testRegistry.acknowledge(id);
          }
        }, 30);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, [id, onChange, rodIndex]);

  const travelHeight = containerRef.current
    ? containerRef.current.clientHeight * knobTravelRatio
    : 0;

  const knobOffset = -value * travelHeight;

  return (
    <div
      ref={containerRef}
      className="slider-control-wrapper"
      style={{ top: y, left: x }}
      onMouseDown={(e) => {
        setDragging(true);
        updateValue(e.clientY);
      }}
    >
      <img src={baseImg} className="slider-base" alt="Slider base" draggable={false} />
      <img
        src={knobImg}
        className="slider-knob"
        alt="Slider knob"
        draggable={false}
        style={{ top: `${knobOffset}px` }}
      />
    </div>
  );
};

export default SliderControl;
