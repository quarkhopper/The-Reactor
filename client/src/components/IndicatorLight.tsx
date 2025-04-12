import React, { useState, useEffect } from 'react';

import off from '../images/indicator_off.png';
import amber from '../images/indicator_amber.png';
import green from '../images/indicator_green.png';
import red from '../images/indicator_red.png';
import white from '../images/indicator_white.png';

import '../css/components/IndicatorLight.css';
import MessageBus from '../MessageBus';

const colorImageMap: Record<string, string> = {
  'off': off,
  'amber': amber,
  'green': green,
  'red': red,
  'white': white,
};


interface IndicatorLightProps {
  id: string;
  x: number;
  y: number;
  gridX?: number;
  gridY?: number;
  index?: number;
  colorMap?: { range: [number, number]; color: string }[]; // Color mapping for temperature ranges
  colorEvent?: { type: string }; 
}

const IndicatorLight: React.FC<IndicatorLightProps> = ({
  id,
  x,
  y,
  gridX,
  gridY,
  index,
  colorMap,
  colorEvent,
}) => {
  const [displayColor, setDisplayColor] = useState<string>('off');
  
  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);


  // Guard function to filter relevant messages
  const isValidMessage = (msg: Record<string, any>): boolean => {
    const validTypes = ['state_change', 'process_begin', colorEvent?.type];
    return validTypes.includes(msg.type) &&
      (!msg.index || msg.index === index) &&
      (!msg.gridX || msg.gridX === gridX) &&
      (!msg.gridY || msg.gridY === gridY);
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
        const sequence: string[] = ['red', 'amber', 'green', 'white', 'off'];
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
      <img src={colorImageMap[displayColor]} className="indicator-light-img" />
    </div>
  );
};

export default IndicatorLight;
