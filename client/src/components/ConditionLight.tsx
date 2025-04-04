import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

import '../css/components/ConditionLight.css';

import off from '../images/condition_off.png';
import red from '../images/condition_red.png';
import green from '../images/condition_green.png';
import amber from '../images/condition_amber.png';
import white from '../images/condition_white.png';
import shine from '../images/condition_shine.png';

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

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
      }

      // Handle power light colors
      if (id.includes('POWER')) {
        switch (state) {
          case 'off':
            setDisplayColor('off');
            break;
          case 'init':
          case 'test':
          case 'startup':
          case 'shutdown':
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
        // Handle TRANS light colors
        switch (state) {
          case 'init':
          case 'test':
          case 'startup':
          case 'shutdown':
          case 'scram':
            setDisplayColor('amber');
            break;
          default:
            setDisplayColor('off');
            break;
        }
      } else {
        // For other lights, use the color prop
        setDisplayColor(color);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id, color]); // Keep color in dependencies for visual updates

  // Handle initialization
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id) {
        if (cmd.process === 'init') {
          // Reset component state
          setDisplayColor('off');
          setIsTestMode(false);
          // Acknowledge initialization
          registry.acknowledge(id);
        } else if (cmd.process === 'shutdown') {
          // Turn off during shutdown
          setDisplayColor('off');
          setIsTestMode(false);
          // Acknowledge shutdown
          registry.acknowledge(id);
        }
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'test') {
        setIsTestMode(true);
        
        // Perform test sequence
        const sequence: ConditionColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;
        
        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;
          
          if (i >= sequence.length) {
            clearInterval(interval);
            setIsTestMode(false);
            setDisplayColor(color);
            
            // Emit test result when test sequence completes
            stateMachine.emit({
              type: 'test_result',
              id,
              passed: true
            });
          }
        }, 150);
        
        return () => clearInterval(interval);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
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
