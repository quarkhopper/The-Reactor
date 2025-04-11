import React, { useState, useEffect } from 'react';

import '../css/components/ConditionLight.css';

import off from '../images/condition_off.png';
import red from '../images/condition_red.png';
import green from '../images/condition_green.png';
import amber from '../images/condition_amber.png';
import white from '../images/condition_white.png';
import shine from '../images/condition_shine.png';

import MessageBus from '../MessageBus';

type ConditionColor = 'off' | 'red' | 'green' | 'amber' | 'white';

interface ConditionLightProps {
  id: string;
  x: number;
  y: number;
  color?: ConditionColor;
  width?: number;
  label?: string;
}

const conditionImages: Record<ConditionColor, string> = {
  off,
  red,
  green,
  amber,
  white,
};

const ConditionLight: React.FC<ConditionLightProps> = ({
  id,
  x,
  y,
  color = 'off',
  width = 100,
  label,
}) => {
  const [displayColor, setDisplayColor] = useState<ConditionColor>(color);
  const [isTestMode, setIsTestMode] = useState(false);

  function handleConditionLightMessage(msg: Record<string, any>) {
    if (msg.type === 'state_change') {

      if (msg.state === 'startup' || msg.state === 'on') {
        setIsTestMode(false);
      }

      if (id.includes('POWER')) {
        switch (msg.state) {
          case 'off':
          case 'shutdown':
            setDisplayColor('off');
            break;
          case 'init':
          case 'startup':
            setDisplayColor('amber');
            break;
          case 'scram':
            setDisplayColor('red');
            break;
          case 'on':
            setDisplayColor('green');
            break;
        }
      } else if (id.includes('TRANS')) {
        switch (msg.state) {
          case 'init':
          case 'startup':
            setDisplayColor('amber');
            break;
          case 'shutdown':
          case 'off':
            setDisplayColor('off');
            break;
          default:
            setDisplayColor('off');
            break;
        }
      } else if (id.includes('FAULT')) {
        switch (msg.state) {
          case 'fault':
            setDisplayColor('red');
            break;
          default:
            setDisplayColor('off');
            break;
        }
      }
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
            setDisplayColor(color);
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

  // Consolidate subscriptions into a single useEffect
  useEffect(() => {
    const handleMessage = (msg: Record<string, any>) => {
      handleConditionLightMessage(msg);
    };

    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, [id, color]);

  // Update display color when color prop changes (but not during test mode)
  useEffect(() => {
    if (!isTestMode) {
      setDisplayColor(color);
    }
  }, [color, isTestMode]);

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
