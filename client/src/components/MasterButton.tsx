// client/src/components/MasterButton.tsx
import React, { useState, useEffect } from 'react';
import '../css/components/MasterButton.css';

import bezel from '../images/master_button_bezel.png';
import glowOff from '../images/master_button_off.png';
import glowOn from '../images/master_button_on.png';

import stateMachine from '../state/StateMachine';

interface MasterButtonProps {
  x: number;
  y: number;
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [lit, setLit] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    stateMachine.subscribe((cmd) => {
      if (cmd.id !== 'master') return;

      console.log('[RECV]', cmd); // Optional debug

      if (cmd.type === 'set_button_light') {
        setLit(cmd.on);
        setBlinking(false);
        setVisible(cmd.on); // reset visible to the actual lit state
      }

      if (cmd.type === 'start_blinking') {
        setBlinking(true);
      }

      if (cmd.type === 'stop_blinking') {
        setBlinking(false);
        // ✅ no visible change here; let the blinking effect reset it
      }
    });
  }, []);

  useEffect(() => {
    if (!blinking) {
      setVisible(lit); // ✅ Fix: restore true visual state after blinking
      return;
    }

    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 200);

    return () => clearInterval(interval);
  }, [blinking, lit]);

  const handlePress = () => {
    stateMachine.handleEvent({ type: 'button_press', id: 'master' });
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
