import React, { useEffect, useState, useRef } from 'react';
import { useTestable } from '../hooks/useTestable';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';

import baseImg from '../images/slider_base.png';
import knobImg from '../images/slider_knob.png';

import '../css/components/SliderControl.css';

interface SliderControlProps {
  id: string;
  x: number;
  y: number;
  rodIndex: number;
  onChange?: (value: number, rodIndex: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ id, x, y, rodIndex, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState(0);
  const { isTestMode } = useTestable(id);
  const knobTravelRatio = 0.68;

  const updateValue = (clientY: number) => {
    if (!containerRef.current || isTestMode) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = clientY - rect.top;
    const travelHeight = rect.height * knobTravelRatio;
    const clamped = Math.min(Math.max(relY, 0), travelHeight);
    const newValue = 1 - clamped / travelHeight;
    setValue(newValue);

    if (onChange) {
      onChange(newValue, rodIndex);
    }

    // Emit rod position update
    stateMachine.emit({
      type: 'rod_position_update',
      id: `rod_${rodIndex}`,
      x: rodIndex % 3,
      y: Math.floor(rodIndex / 3),
      isWithdrawn: newValue === 1
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

  // Self-initialization
  useEffect(() => {
    registry.acknowledge(id);
  }, [id]);

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
        if (!isTestMode) {
          setDragging(true);
          updateValue(e.clientY);
        }
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
