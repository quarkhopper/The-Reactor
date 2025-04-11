import React, { useState, useEffect } from 'react';

import off from '../images/indicator_off.png';
import amber from '../images/indicator_amber.png';
import green from '../images/indicator_green.png';
import red from '../images/indicator_red.png';
import white from '../images/indicator_white.png';

import '../css/components/IndicatorLight.css';
import MessageBus from '../MessageBus';

export type IndicatorColor = 'amber' | 'green' | 'red' | 'white' | 'off';

interface IndicatorLightProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  topLabel?: string;
  initialColor?: IndicatorColor;
}

const IndicatorLight: React.FC<IndicatorLightProps> = ({
  id,
  x,
  y,
  label,
  topLabel,
  initialColor = 'off'
}) => {
  const [displayColor, setDisplayColor] = useState<IndicatorColor>(initialColor);
  
  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  // Color mapping for the indicator images
  const colorMap: Record<IndicatorColor, string> = {
    amber,
    green,
    red,
    white,
    off,
  };
  
  // Guard function to filter relevant messages
  const isValidMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || 
        msg.type === 'process_begin' ||
        (msg.type === 'set_indicator' && msg.id === id))
      );
  };

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return; // Guard clause

    if (msg.type === 'state_change') {
      const state = msg.state;
      if (state === 'startup' || state === 'on') {
        setDisplayColor('off'); // Reset display color on state change
      } else if (state === 'shutdown') {
        setDisplayColor('off'); // Reset display color during shutdown
      }
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        setDisplayColor('off');
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'test') {
        const sequence: IndicatorColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;

        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;

          if (i >= sequence.length) {
            clearInterval(interval);
            MessageBus.emit({
              type: 'test_result',
              id,
              passed: true,
            });
          }
        }, 150);

        return () => clearInterval(interval);
      } else if (msg.process === 'shutdown') {
        setDisplayColor('off');
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'shutdown',
        });
      }
    } else if (msg.type === 'set_indicator') {
      setDisplayColor(msg.color);
    }
  }

  // Render
  return (
    <div className="indicator-light-wrapper" style={{ top: y, left: x }}>
      {topLabel && <div className="indicator-light-top-label">{topLabel}</div>}
      <img src={colorMap[displayColor]} className="indicator-light-img" />
      {label && <div className="indicator-light-label">{label}</div>}
    </div>
  );
};

export default IndicatorLight;
