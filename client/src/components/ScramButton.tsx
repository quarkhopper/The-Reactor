import React, { useState, useEffect } from 'react';
import { useTestable } from '../hooks/useTestable';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';

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
  const { isTestMode } = useTestable(id);

  // Self-initialization
  useEffect(() => {
    registry.acknowledge(id);
  }, [id]);

  // Test mode sequence
  useEffect(() => {
    if (isTestMode) {
      setPressed(true);
      const timer = setTimeout(() => {
        setPressed(false);
        registry.acknowledge(id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTestMode, id]);

  const handleClick = () => {
    const newPressed = !pressed;
    setPressed(newPressed);
    
    if (newPressed) {
      // Emit SCRAM command
      stateMachine.emit({
        type: 'button_press',
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
