import { useEffect, useState } from 'react';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';
import type { Command } from '../state/types';

import knobImg from '../images/knob_selector.png';
import '../css/components/KnobSelector.css';

interface KnobSelectorProps {
  id: string;
  x: number;
  y: number;
  leftLabel: string;
  rightLabel: string;
}

export default function KnobSelector({ id, x, y, leftLabel, rightLabel }: KnobSelectorProps) {
  const [toggled, setToggled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const rotation = toggled ? 45 : -45;

  // Handle state changes
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.id === 'system') {
        if (cmd.state === 'test') {
          setIsTestMode(true);
        } else if (cmd.state === 'startup') {
          setIsTestMode(false);
          setToggled(false);
        }
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        // Reset component state for initialization
        setToggled(false);
        setIsTestMode(false);
        registry.acknowledge(id, () => {
          console.log(`[KnobSelector] Initialization acknowledged for ${id}`);
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        // Reset state during shutdown
        setToggled(false);
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
        
        // Simple test - just acknowledge
        setTimeout(() => {
          stateMachine.emit({
            type: 'test_result',
            id,
            passed: true
          });
          setIsTestMode(false);
        }, 500);
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);

  const handleClick = () => {
    if (!isTestMode) {
      const newToggled = !toggled;
      setToggled(newToggled);
      
      // Emit knob state change
      stateMachine.emit({
        type: 'knob_change',
        id,
        value: newToggled ? 'right' : 'left'
      });
    }
  };

  return (
    <div className="knob-selector-wrapper" style={{ top: y, left: x }}>
      <div className="knob-label left">{leftLabel}</div>
      <div className="knob-label right">{rightLabel}</div>
      <img
        src={knobImg}
        className="knob-selector-img"
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={handleClick}
        draggable={false}
      />
    </div>
  );
}
