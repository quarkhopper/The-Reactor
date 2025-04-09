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

function handleCircularGaugeMessage(msg: Record<string, any>, id: string, setDisplayValue: (value: number) => void) {
  if (msg.id === id) {
    console.log(`[CircularGauge] Received message:`, msg);
    if (msg.type === 'core_temp_update' || msg.type === 'turbine_rpm_update') {
      setDisplayValue(msg.value);
    }
  }
}

export default function CircularGauge({ id, x, y, value, limit, eventType }: CircularGaugeProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isTestMode, setIsTestMode] = useState(false);

  // Subscribe to MessageBus once when the component mounts
  useEffect(() => {
    const handleMessage = (msg: Record<string, any>) => {
      handleCircularGaugeMessage(msg, id, setDisplayValue);
    };

    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => unsubscribe();
  }, [id]);

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
        setDisplayValue(value);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      } else if (cmd.type === eventType) {
        // Update value when receiving the specified event type
        setDisplayValue(cmd.value);
      }
    });
    
    return () => unsubscribe();
  }, [id, value, eventType]);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        // Reset component state for initialization
        setDisplayValue(0);
        setIsTestMode(false);
        registry.acknowledge(id, () => {
          console.log(`[CircularGauge] Initialization acknowledged for ${id}`);
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        // Reset state during shutdown
        setDisplayValue(0);
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
        
        // Perform test sequence
        let i = 0;
        const steps = 40;

        const interval = setInterval(() => {
          const phase = i < steps ? i / steps : 2 - i / steps;
          setDisplayValue(phase);
          i++;
          
          if (i > steps * 2) {
            clearInterval(interval);
            setIsTestMode(false);
            setDisplayValue(value);
            
            // Emit test result when test sequence completes
            stateMachine.emit({
              type: 'test_result',
              id,
              passed: true
            });
          }
        }, 20);
        
        return () => clearInterval(interval);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id, value]);

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
