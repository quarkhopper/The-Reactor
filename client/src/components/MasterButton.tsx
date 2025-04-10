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

function handleMasterButtonMessage(
  msg: Record<string, any>,
  setLit: (value: boolean) => void,
  setBlinking: (value: boolean) => void,
  setVisible: (value: boolean) => void
) {
  if (msg.type === 'state_change') {
    const state = msg.state;
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
  } else if (msg.type === 'process_begin') {
    if (msg.process === 'init') {
      setLit(false);
      setBlinking(false);
      setVisible(false);
      MessageBus.emit({
        type: 'acknowledge',
        id: 'master',
        process: 'init',
      });
      console.log(`[MasterButton] Initialization acknowledged for master`);
    } else if (msg.process === 'shutdown') {
      setLit(false);
      setBlinking(false);
      setVisible(false);
      MessageBus.emit({
        type: 'acknowledge',
        id: 'master',
        process: 'shutdown',
      });
      console.log(`[MasterButton] Shutdown acknowledged for master`);
    } else if (msg.process === 'test' && msg.id === 'master') {
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

function isMasterButtonMessage(msg: Record<string, any>): boolean {
  return (
    typeof msg.type === 'string' &&
    (msg.type === 'state_change' ||
     msg.type === 'process_begin' ||
     msg.type === 'power_button_press') &&
    (msg.id === 'master' || msg.type === 'state_change') // Allow state_change without specific id
  );
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [lit, setLit] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [visible, setVisible] = useState(false);

  // Consolidate subscriptions into a single useEffect
  useEffect(() => {
    const handleMessage = (msg: Record<string, any>) => {
      if (isMasterButtonMessage(msg)) {
        handleMasterButtonMessage(msg, setLit, setBlinking, setVisible);
      }
    };

    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
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
        src={visible ? glowOn : glowOff}
        className="master-button-overlay"
        alt={visible ? 'On glow' : 'Off glow'}
        draggable={false}
      />
    </div>
  );
}
