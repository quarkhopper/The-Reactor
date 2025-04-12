import React, { useState, useEffect } from 'react';

import '../css/components/ConditionLight.css';

import off from '../images/condition_off.png';
import red from '../images/condition_red.png';
import green from '../images/condition_green.png';
import amber from '../images/condition_amber.png';
import white from '../images/condition_white.png';
import shine from '../images/condition_shine.png';

const conditionImages: Record<ConditionColor, string> = {
  off,
  red,
  green,
  amber,
  white,
};

import MessageBus from '../MessageBus';

type ConditionColor = 'off' | 'red' | 'green' | 'amber' | 'white';

interface ConditionLightProps {
  id: string;
  x: number;
  y: number;
  width?: number;
  label?: string;
  stateEvent?: Record<string, string[]>;
  conditionEvent?: {type: string, value: string, color: string}[];
}

const ConditionLight: React.FC<ConditionLightProps> = ({
  id,
  x,
  y,
  width = 100,
  label,
  stateEvent,
  conditionEvent,
}) => {
  const [displayColor, setDisplayColor] = useState<ConditionColor>("off");
  const [isTestMode, setIsTestMode] = useState(false);

  function getStateEventColor(state: string): ConditionColor {
    if (stateEvent) {
      for (const [color, states] of Object.entries(stateEvent)) {
        if (states.includes(state)) {
          return color as ConditionColor;
        }
      }
    }
    return 'off'; // Default color if no match found
  }

  function getConditionEventColor(type: string, value: string): ConditionColor {
    if (conditionEvent) {
      for (const event of conditionEvent) {
        if (event.type === type && event.value === value) {
          return event.color as ConditionColor;
        }
      }
    }
    return 'off'; // Default color if no match found
  }

  const conditionTypes = conditionEvent ? conditionEvent.map(event => event.type) : [];

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  // Guard function to filter relevant messages
  const isValidMessage = (msg: Record<string, any>): boolean => {
    const validTypes = ['state_change', 'process_begin', ...conditionTypes]; 
    return validTypes.includes(msg.type)
   };

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return; // Guard clause
    if (msg.type === 'state_change') {
      setDisplayColor(getStateEventColor(msg.state));
    } else if(conditionTypes.includes(msg.type)) {
      setDisplayColor(getConditionEventColor(msg.type, msg.value));
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        setDisplayColor('off');
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setDisplayColor('off');
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
        setIsTestMode(true);

        const sequence: ConditionColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;

        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;

          if (i >= sequence.length) {
            clearInterval(interval);
            setIsTestMode(false);
            setDisplayColor('off');
            // Emit test_result message
            MessageBus.emit({
              type: 'test_result',
              id,
              passed: true, // Assuming the test passes; adjust logic as needed
            });
          }
        }, 150);
      }
    }
  }

  // Update display color when color prop changes (but not during test mode)
  useEffect(() => {
    if (!isTestMode) {
      setDisplayColor('off');
    }
  }, [isTestMode]);

  return (
    <div
      className="condition-light-wrapper"
      style={{ left: `${x}px`, top: `${y}px`, width: `${width}px` }}
    >
      <img
        src={conditionImages[displayColor]}
        alt={`Condition light ${displayColor}`}
        className="condition-light-img"
      />
      {label && <div className="condition-light-label">{label}</div>}
      <img
        src={shine}
        alt="shine overlay"
        className="condition-light-shine"
      />
    </div>
  );
};

export default ConditionLight;
