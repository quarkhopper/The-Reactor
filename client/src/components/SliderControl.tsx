import React, { useEffect, useState, useRef } from 'react';
import MessageBus from '../MessageBus';
import baseImg from '../images/slider_base.png';
import knobImg from '../images/slider_knob.png';
import '../css/components/SliderControl.css';

interface SliderControlProps {
  id: string;
  x: number;
  y: number;
  moveEvent: string; // event type to send on move
  index?: number;   // meaningful index within the target system
  initvalue?: number; // initial value of the slider
}

const SliderControl: React.FC<SliderControlProps> = ({ id, x, y, moveEvent, index, initvalue }) => {
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
    const validTypes = ['state_change', 'process_begin'];
    return validTypes.includes(msg.type)
    && ((msg.index == null) || msg.index === index)
  }

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return;

    if (msg.type === 'state_change') {
      if (msg.state === 'startup') {
        setValue(initvalue || 0);
        setIsTestMode(false);
      }
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
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
    } else if (msg.type === 'control_rod_position_update' || msg.type === 'pump_speed_update') {
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

    // Emit the new value to the message bus
    MessageBus.emit({
      type: moveEvent,
      id: id,
      index: index,
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
