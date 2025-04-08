import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

import off from '../images/indicator_off.png';
import amber from '../images/indicator_amber.png';
import green from '../images/indicator_green.png';
import red from '../images/indicator_red.png';
import white from '../images/indicator_white.png';

import '../css/components/IndicatorLight.css';

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
  
  // Color mapping for the indicator images
  const colorMap: Record<IndicatorColor, string> = {
    amber,
    green,
    red,
    white,
    off,
  };
  
  // Handle state changes
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);
  
  // Handle process_begin:init and process_begin:shutdown commands
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        registry.acknowledge(id, () => {
          console.log(`[IndicatorLight] Initialization acknowledged for ${id}`);
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        // Turn off during shutdown
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, []);
  
  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'test') {
        
        // Perform test sequence
        const sequence: IndicatorColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;
        
        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;
          
          if (i >= sequence.length) {
            clearInterval(interval);
            
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
  }, [id]);
  
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
