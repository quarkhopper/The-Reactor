import React, { useState, useEffect } from 'react';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';
import type { Command, AppState } from '../state/types';

import '../css/components/ScramButton.css';

import bezel from '../images/e-stop_bezel.png';
import buttonOut from '../images/e-stop_out.png';
import buttonIn from '../images/e-stop_in.png';

interface ScramButtonProps {
  id: string;
  x: number;
  y: number;
}

export default function ScramButton({ id, x, y }: ScramButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
        setPressed(false);
      } else if (state === 'scram') {
        // Button stays pressed during scram
        setPressed(true);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  // Handle initialization
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id) {
        if (cmd.process === 'init') {
          // Reset component state
          setPressed(false);
          setIsTestMode(false);
          // Acknowledge initialization
          registry.acknowledge(id);
        } else if (cmd.process === 'shutdown') {
          // Return to unpressed state during shutdown
          setPressed(false);
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
        
        // Press the button during test
        setPressed(true);
        
        // After a short delay, release and complete test
        setTimeout(() => {
          setPressed(false);
          setIsTestMode(false);
          
          // Emit test result when test sequence completes
          stateMachine.emit({
            type: 'test_result',
            id,
            passed: true
          });
        }, 500);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);

  // Handle button press
  const handleClick = () => {
    if (!isTestMode && stateMachine.getState() === 'on') {
      stateMachine.emit({
        type: 'scram_button_press',
        id
      });
    }
  };

  return (
    <div
      className="scram-button-wrapper"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={handleClick}
      tabIndex={-1}
    >
      <img src={bezel} className="scram-button-img" alt="Scram bezel" />
      <img
        src={pressed ? buttonIn : buttonOut}
        className="scram-button-overlay"
        alt={pressed ? 'Pressed in' : 'Raised'}
      />
    </div>
  );
}
