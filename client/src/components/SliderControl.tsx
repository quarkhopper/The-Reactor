import React, { useEffect, useState, useRef, useCallback } from 'react';
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

  // Handle test sequence completion
  const handleTestComplete = useCallback(() => {
    // Emit test result when test sequence is complete
    stateMachine.emit({
      type: 'test_result',
      id,
      passed: true
    });
  }, [id]);

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
      value: newValue
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

  // Test mode animation
  useEffect(() => {
    if (isTestMode) {
      // Reset to bottom position
      setValue(0);
      
      // Use a single continuous animation instead of steps
      let startTime = Date.now();
      const totalDuration = 2000; // Total duration for one complete cycle
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        
        if (progress >= 1) {
          // Animation complete
          setValue(0); // Ensure we end at the bottom
          stateMachine.emit({
            type: 'rod_position_update',
            id: `rod_${rodIndex}`,
            value: 0
          });
          handleTestComplete();
          return;
        }
        
        // Use a custom easing function that starts and ends at 0
        // This ensures the slider starts at 0, goes to 1, and back to 0
        let currentValue;
        if (progress < 0.5) {
          // First half: go from 0 to 1
          const p = progress * 2; // Scale to [0, 1]
          currentValue = p;
        } else {
          // Second half: go from 1 to 0
          const p = (progress - 0.5) * 2; // Scale to [0, 1]
          currentValue = 1 - p;
        }
        
        // Update value and emit
        setValue(currentValue);
        stateMachine.emit({
          type: 'rod_position_update',
          id: `rod_${rodIndex}`,
          value: currentValue
        });
        
        // Continue animation
        requestAnimationFrame(animate);
      };
      
      // Start animation
      const animationFrame = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }
  }, [isTestMode, rodIndex, handleTestComplete]);

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
