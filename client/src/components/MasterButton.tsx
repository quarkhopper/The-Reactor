import { useState, useEffect } from 'react';
import '../css/components/MasterButton.css';
import bezel from '../images/master_button_bezel.png';
import glowOff from '../images/master_button_off.png';
import glowOn from '../images/master_button_on.png';
import MessageBus from '../MessageBus';

interface MasterButtonProps {
  x: number;
  y: number;
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [lit, setLit] = useState(false);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  function isValidMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' ||
       msg.type === 'process_begin')
    );
  }

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return; // Guard clause
    
    if (msg.type === 'state_change') {
      const state = msg.state;
      if (state === 'on') {
        setBlinking(false);
        setLit(true);
      } else if (state === 'test') {
        setBlinking(true);
        setTimeout(() => {
          MessageBus.emit({
            type: 'test_result',
            id: 'master',
            passed: true
          });
        }, 500);
      } else if (state === 'scram') {
        setBlinking(true);
      } else if (state === 'startup') {
        setBlinking(true);
      } else if (state === 'shutdown') {
        setBlinking(false);
        setLit(false);
      } 
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        MessageBus.emit({
          type: 'acknowledge',
          id: 'master',
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        MessageBus.emit({
          type: 'acknowledge',
          id: 'master',
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
        setTimeout(() => {
        MessageBus.emit({
          type: 'test_result',
          id: 'master',
          passed: true
        });
        }, 500);
      }
    }
  }

  // Blinking animation loop
  useEffect(() => {
    if (!blinking) {
      return;
    }

    const interval = setInterval(() => {
      setLit((l) => !l);
    }, 200);

    return () => clearInterval(interval);
  }, [blinking, lit]);

  const handlePress = () => {
    // Emit power button press directly
    MessageBus.emit({
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
        src={lit ? glowOn : glowOff}
        className="master-button-overlay"
        alt={lit ? 'On glow' : 'Off glow'}
        draggable={false}
      />
    </div>
  );
}
