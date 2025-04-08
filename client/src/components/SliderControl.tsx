import React, { useEffect, useState, useRef, useCallback } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

import baseImg from '../images/slider_base.png';
import knobImg from '../images/slider_knob.png';

import '../css/components/SliderControl.css';

interface SliderControlProps {
  id: string;
  x: number;
  y: number;
  target: string;  // e.g., 'cooling', 'rod'
  index: number;   // meaningful index within the target system
  onChange?: (value: number, target: string, index: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ id, x, y, target, index, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);
  const knobTravelRatio = 0.68;

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      } else if (cmd.type === 'position_update' && cmd.id === `${target}_${index}`) {
        // Update slider position when receiving position update
        setValue(cmd.value);
      }
    });
    
    return () => unsubscribe();
  }, [id, target, index]);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        // Reset component state for initialization
        setValue(0);
        setIsTestMode(false);
        registry.acknowledge(id, () => {
          console.log(`[SliderControl] Initialization acknowledged for ${id}`);
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        // Reset state during shutdown
        setValue(0);
        setIsTestMode(false);
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, []);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'test') {
        setIsTestMode(true);
        
        // Reset to bottom position (fully inserted)
        setValue(0);
        
        // Use a single continuous animation instead of steps
        let startTime = Date.now();
        const totalDuration = 2000; // Total duration for one complete cycle
        
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / totalDuration, 1);
          
          if (progress >= 1) {
            // Animation complete - ensure fully inserted
            setValue(0);
            stateMachine.emit({
              type: 'position_update',
              id: `${target}_${index}`,
              value: 0
            });
            setIsTestMode(false);
            // Emit test result when test sequence completes
            stateMachine.emit({
              type: 'test_result',
              id,
              passed: true
            });
            return;
          }
          
          // Use a custom easing function that starts and ends at 0
          // This ensures the slider starts at 0 (inserted), goes to 1 (withdrawn), and back to 0 (inserted)
          let currentValue;
          if (progress < 0.5) {
            // First half: go from 0 (inserted) to 1 (withdrawn)
            const p = progress * 2; // Scale to [0, 1]
            currentValue = p;
          } else {
            // Second half: go from 1 (withdrawn) to 0 (inserted)
            const p = (progress - 0.5) * 2; // Scale to [0, 1]
            currentValue = 1 - p;
          }
          
          // Update value and emit
          setValue(currentValue);
          stateMachine.emit({
            type: 'position_update',
            id: `${target}_${index}`,
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
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id, target, index]);

  const updateValue = (clientY: number) => {
    if (!containerRef.current || isTestMode) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = clientY - rect.top;
    const travelHeight = rect.height * knobTravelRatio;
    const clamped = Math.min(Math.max(relY, 0), travelHeight);
    // Value mapping: 0 = fully inserted (bottom), 1 = fully withdrawn (top)
    const newValue = 1 - clamped / travelHeight;
    setValue(newValue);

    if (onChange) {
      onChange(newValue, target, index);
    }

    // Emit position update with new target-based ID format
    stateMachine.emit({
      type: 'position_update',
      id: `${target}_${index}`,
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
