import React, { useEffect, useState, useRef } from 'react';
import MessageBus from '../MessageBus';

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
    const handleStateChange = (state: string) => {
      if (state === 'startup' || state === 'on') {
        setIsTestMode(false);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'state_change' && msg.id === id) {
        handleStateChange(msg.state);
      } else if (msg.type === 'position_update' && msg.id === `${target}_${index}`) {
        setValue(msg.value);
      }
    });

    return () => {
      subscription();
    };
  }, [id, target, index]);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Record<string, any>) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        setValue(0);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        setValue(0);
        setIsTestMode(false);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'process_begin' && msg.id === id) {
        handleCommand(msg);
      }
    });

    return () => {
      subscription();
    };
  }, [id]);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Record<string, any>) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'test') {
        setIsTestMode(true);
        setValue(0);

        let startTime = Date.now();
        const totalDuration = 2000;

        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / totalDuration, 1);

          if (progress >= 1) {
            setValue(0);
            MessageBus.emit({
              type: 'position_update',
              id: `${target}_${index}`,
              value: 0,
            });
            setIsTestMode(false);
            MessageBus.emit({
              type: 'test_result',
              id,
              passed: true,
            });
            return;
          }

          let currentValue;
          if (progress < 0.5) {
            const p = progress * 2;
            currentValue = p;
          } else {
            const p = (progress - 0.5) * 2;
            currentValue = 1 - p;
          }

          setValue(currentValue);
          MessageBus.emit({
            type: 'position_update',
            id: `${target}_${index}`,
            value: currentValue,
          });

          requestAnimationFrame(animate);
        };

        const animationFrame = requestAnimationFrame(animate);

        return () => {
          cancelAnimationFrame(animationFrame);
        };
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'process_begin' && msg.id === id) {
        handleCommand(msg);
      }
    });

    return () => {
      subscription();
    };
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
    MessageBus.emit({
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
