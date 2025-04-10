import { useState, useEffect } from 'react';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';
import type { Command, AppState } from '../state/types';

import '../css/components/MasterButton.css';
import bezel from '../images/master_button_bezel.png';
import glowOff from '../images/master_button_off.png';
import glowOn from '../images/master_button_on.png';

interface MasterButtonProps {
  x: number;
  y: number;
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [lit, setLit] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'on' || state === 'scram') {
        setLit(true);
        setBlinking(false);
        setVisible(true);
      } else if (state === 'startup') {
        setLit(true);
        setBlinking(true);
      } else if (state === 'shutdown') {
        setLit(false);
        setBlinking(false);
        setVisible(false);
      } else {
        setLit(false);
        setBlinking(false);
        setVisible(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        // Reset component state for initialization
        setLit(false);
        setBlinking(false);
        setVisible(false);
        registry.acknowledge('master', () => {
          console.log(`[MasterButton] Initialization acknowledged for master`);
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        // Reset state during shutdown
        setLit(false);
        setBlinking(false);
        setVisible(false);
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, []);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === 'master' && cmd.process === 'test') {
        // Complete the test after a short delay
        const timer = setTimeout(() => {
          stateMachine.emit({
            type: 'test_result',
            id: 'master',
            passed: true
          });
        }, 500);
        
        return () => clearTimeout(timer);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, []);

  // Blinking animation loop
  useEffect(() => {
    if (!blinking) {
      setVisible(lit);
      return;
    }

    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 200);

    return () => clearInterval(interval);
  }, [blinking, lit]);

  const handlePress = () => {
    // Emit power button press directly
    stateMachine.emit({
      type: 'power_button_press',
      id: 'master'
    });
  };

  return (
    <div
      className="master-button-wrapper"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={handlePress}
      tabIndex={-1}
    >
      <img src={bezel} className="master-button-img" alt="Bezel" draggable={false} />
      <img
        src={visible ? glowOn : glowOff}
        className="master-button-overlay"
        alt={visible ? 'On glow' : 'Off glow'}
        draggable={false}
      />
    </div>
  );
}
