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
  eventType: 'core_temp_update' | 'turbine_rpm_update'; // Specify which event to listen for
}

export default function CircularGauge({ id, x, y, value, limit, eventType }: CircularGaugeProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isTestMode, setIsTestMode] = useState(false);

  function handleCircularGaugeMessage(msg: Record<string, any>) {
    if (msg.id === id) {
      console.log(`[CircularGauge] Received message:`, msg);
  
      if (msg.type === eventType) {
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
          console.log(`[CircularGauge] Initialization acknowledged for ${id}`);
        } else if (msg.process === 'shutdown') {
          setDisplayValue(0);
          setIsTestMode(false);
          MessageBus.emit({
            type: 'acknowledge',
            id,
            process: 'shutdown',
          });
          console.log(`[CircularGauge] Shutdown acknowledged for ${id}`);
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
  }

  // Consolidate subscriptions into a single useEffect
  useEffect(() => {
    const handleMessage = (msg: Record<string, any>) => {
      handleCircularGaugeMessage(msg);
    };

    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe(); // Ensure this does not return a value
    };
  }, [id]);

  // Update value when not in test mode
  useEffect(() => {
    if (!isTestMode) {
      setDisplayValue(value);
    }
  }, [value, isTestMode]);

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
