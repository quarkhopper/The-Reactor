import React, { useState, useEffect } from 'react';
import '../css/components/MasterButton.css';
import bezel from '../images/master_button_bezel.png';
import glowOff from '../images/master_button_off.png';
import glowOn from '../images/master_button_on.png';

import stateMachine from '../state/StateMachine';
import { handleMasterPower } from '../state/handlers/masterPower';
import initRegistry from '../state/initRegistry';

interface MasterButtonProps {
  x: number;
  y: number;
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [lit, setLit] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [visible, setVisible] = useState(false);

  // Subscribe to state machine messages
  useEffect(() => {
    const unsubscribe = stateMachine.subscribe((cmd) => {
      if (cmd.id !== 'master') return;

      console.log('[RECV]', cmd);

      if (cmd.type === 'set_button_light') {
        setLit(cmd.on);
        setBlinking(false);
        setVisible(cmd.on);
      }

      if (cmd.type === 'start_blinking') {
        setBlinking(true);
      }

      if (cmd.type === 'stop_blinking') {
        setBlinking(false);
      }
    });

    return unsubscribe;
  }, []);

  // Blinking animation
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

  // Register with init system
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setLit(false);
        setBlinking(false);
        setVisible(false);
        initRegistry.acknowledge('master');
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, []);

  const handlePress = () => {
    handleMasterPower();
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
