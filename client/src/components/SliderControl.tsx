import React, { useRef, useState, useEffect } from 'react';
import baseImg from '../images/slider_base.png';
import knobImg from '../images/slider_knob.png';
import '../css/components/SliderControl.css';

interface SliderControlProps {
  x: number;
  y: number;
  onChange?: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ x, y, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState(0);

  const knobTravelRatio = 0.68; // Knob moves over 90% of the slider height

  const updateValue = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = clientY - rect.top;
    const travelHeight = rect.height * knobTravelRatio;
    const clamped = Math.min(Math.max(relY, 0), travelHeight);
    const newValue = 1 - clamped / travelHeight;
    setValue(newValue);
    if (onChange) onChange(newValue);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (dragging) updateValue(e.clientY);
  };

  const onMouseUp = () => setDragging(false);

  useEffect(() => {
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
        <img
        src={baseImg}
        className="slider-base"
        alt="Slider base"
        draggable={false}
        />
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
