import React, { useState, useEffect } from 'react';
import { useTestable } from '../hooks/useTestable';
import { registry } from '../state/registry';
import '../css/components/MasterButton.css';
import bezel from '../images/master_button_bezel.png';
import glowOff from '../images/master_button_off.png';
import glowOn from '../images/master_button_on.png';

import stateMachine from '../state/StateMachine';
import { handleMasterPower } from '../state/handlers/masterPower';

interface MasterButtonProps {
  x: number;
  y: number;
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [lit, setLit] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [visible, setVisible] = useState(false);
  const { isTestMode } = useTestable('master');

  // Watch app state and respond accordingly
  useEffect(() => {
    const unsubscribe = stateMachine.subscribeToAppState((state) => {
      if (state === 'on') {
        setLit(true);
        setBlinking(false);
        setVisible(true);
      } else if (state === 'startup' || state === 'shutdown') {
        setLit(true);
        setBlinking(true);
      } else {
        setLit(false);
        setBlinking(false);
        setVisible(false);
      }
    });

    return unsubscribe;
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

  // Self-initialization
  useEffect(() => {
    if (!isTestMode) {
      setLit(false);
      setBlinking(false);
      setVisible(false);
    }
    registry.acknowledge('master');
    
    // If in test mode, complete the test after a short delay
    if (isTestMode) {
      const timer = setTimeout(() => {
        stateMachine.emit({
          type: 'test_result',
          id: 'master',
          passed: true
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTestMode]);

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
