import { useEffect, useState } from 'react';
import MessageBus from '../MessageBus';

import '../css/components/CircularGauge.css';

import bezel from '../images/gauge_bezel.png';
import card from '../images/gauge_card.png';
import needle from '../images/gauge_needle.png';
import lightOff from '../images/gauge_light_off.png';
import lightOn from '../images/gauge_light_on.png';

interface CircularGaugeProps {
  id: string;
  x: number;
  y: number;
  value: number; // 0–1
  limit: number; // Light turns on above this
}

export default function CircularGauge({ id, x, y, value, limit }: CircularGaugeProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe(); // Ensure this does not return a value
    };
  }, []);

  // Guard function to filter relevant messages
  const isValidMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || 
        msg.type === 'process_begin' || 
        (msg.type === 'core_temp_update' && id === 'core_temp_gauge') ||
        (msg.type === 'turbine_rpm_update' && id === 'turbine_rpm_gauge'))
    );
  };

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return; // Guard clause

    if ((msg.type === 'core_temp_update' || msg.type === 'turbine_rpm_update') && !isTestMode) {
      setDisplayValue(msg.value);
    } else if (msg.type === 'state_change') {
      const state = msg.state;
      if (state === 'startup' || state === 'on') {
        setIsTestMode(false);
        setDisplayValue(0); // Reset display value on state change
      } else if (state === 'shutdown') {
        setIsTestMode(false);
        setDisplayValue(0); // Reset display value during shutdown
      }
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        setDisplayValue(0);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setDisplayValue(0);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
        setIsTestMode(true);
                  let i = 0;
        const steps = 40;

        const interval = setInterval(() => {
          const phase = i < steps ? i / steps : 2 - i / steps;
          setDisplayValue(phase);
          i++;

          if (i > steps * 2) {
            clearInterval(interval);
            setIsTestMode(false);
            setDisplayValue(0);
            MessageBus.emit({
              type: 'test_result',
              id,
              passed: true
            });
          }
        }, 20);
      }
    }
  }

  const clampedValue = Math.min(Math.max(displayValue, 0), 1);
  const angle = clampedValue * 180 - 90; // -90° to +90°
  const showLight = clampedValue > limit;

  return (
    <div className="circular-gauge-wrapper" style={{ left: `${x}px`, top: `${y}px` }}>
      <div className="circular-gauge">
        <img src={card} className="gauge-card" />
        <img src={needle} className="gauge-needle" style={{ transform: `rotate(${angle}deg)` }} />
        <img src={showLight ? lightOn : lightOff} className="gauge-light" />
        <img src={bezel} className="gauge-bezel" />
      </div>
    </div>
  );
}
