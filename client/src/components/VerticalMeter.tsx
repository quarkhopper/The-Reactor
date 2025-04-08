import React, { useEffect, useState } from 'react';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';
import type { Command, AppState } from '../state/types';

import '../css/components/VerticalMeter.css';

import bezel from '../images/meter_bezel.png';
import centerOn from '../images/meter_center_on.png';
import centerOff from '../images/meter_center_off.png';

interface VerticalMeterProps {
  id: string;
  x: number;
  y: number;
}

export default function VerticalMeter({ id, x, y }: VerticalMeterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);
  const [displayColor, setDisplayColor] = useState<'off' | 'green' | 'amber' | 'red' | 'white'>('off');

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      } else if (cmd.type === 'set_indicator' && cmd.id === id) {
        // Update value when receiving indicator update
        setCurrentValue(cmd.value);
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        // Reset component state for initialization
        setCurrentValue(0);
        setIsTestMode(false);
        setDisplayColor('off');
        registry.acknowledge(id, () => {
          console.log(`[VerticalMeter] Initialization acknowledged for ${id}`);
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        // Reset state during shutdown
        setCurrentValue(0);
        setIsTestMode(false);
        setDisplayColor('off');
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
        const sequence: Array<'off' | 'green' | 'amber' | 'red' | 'white'> = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;
        
        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          // Set value based on color
          switch (sequence[i]) {
            case 'off':
              setCurrentValue(0);
              break;
            case 'green':
              setCurrentValue(0.25);
              break;
            case 'amber':
              setCurrentValue(0.5);
              break;
            case 'red':
              setCurrentValue(0.75);
              break;
            case 'white':
              setCurrentValue(1);
              break;
          }
          i++;
          
          if (i >= sequence.length) {
            clearInterval(interval);
            setIsTestMode(false);
            setDisplayColor('off');
            setCurrentValue(0);
            
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

  const clamped = Math.max(0, Math.min(1, currentValue));

  return (
    <div className="vertical-meter-wrapper" style={{ left: `${x}px`, top: `${y}px` }}>
      <img src={centerOn} className="vertical-meter-img" alt="Meter on" />
      <div className="vertical-meter-cropper" style={{ height: `${(1 - clamped) * 100}%` }}>
        <div className="vertical-meter-off-container">
          <img src={centerOff} className="vertical-meter-img-off" alt="Meter off" />
        </div>
      </div>
      <img src={bezel} className="vertical-meter-img" alt="Meter bezel" />
    </div>
  );
}
