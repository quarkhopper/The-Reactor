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

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  const isValidMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' ||
        msg.type === 'process_begin' ||
        msg.type === 'control_rod_position_update')
    );
  }

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return;

    if (msg.type === 'state_change') {
      if (msg.state === 'startup' || msg.state === 'on') {
        setIsTestMode(false);
      }
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        setValue(0);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setValue(0);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
        handleTest();
      }
    } else if (msg.type === 'control_rod_position_update' && 
      target === 'rod' && 
      index === msg.index) {
      setValue(msg.value);
    }
  } 


  // Handle test sequence
  function handleTest()   {
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
