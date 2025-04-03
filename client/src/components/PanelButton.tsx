import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import { useTestable } from '../hooks/useTestable';
import type { Command } from '../state/types';

import glow_off from '../images/button_off.png';
import glow_green from '../images/button_glow_green.png';
import glow_amber from '../images/button_glow_amber.png';
import glow_red from '../images/button_glow_red.png';
import glow_white from '../images/button_glow_white.png';

import '../css/components/PanelButton.css';

interface PanelButtonProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  onClick?: () => void;
  isActive?: boolean;
  displayColor?: string;
  disabled?: boolean;
}

const glowMap: Record<string, string> = {
  off: glow_off,
  green: glow_green,
  amber: glow_amber,
  red: glow_red,
  white: glow_white,
};

const PanelButton: React.FC<PanelButtonProps> = ({ 
  id, 
  x, 
  y, 
  label,
  onClick,
  isActive = false,
  displayColor = 'off',
  disabled = false
}) => {
  const [isHeld, setIsHeld] = useState(false);
  const { displayColor: testColor } = useTestable(id);

  // Self-initialization
  useEffect(() => {
    // Acknowledge initialization as if this was a physical component
    registry.acknowledge(id);
  }, [id]);

  const handleMouseDown = () => {
    if (!disabled) setIsHeld(true);
  };

  const handleMouseUp = () => {
    if (!disabled && isHeld) {
      if (onClick) {
        onClick();
      } else {
        // Emit button press command
        stateMachine.emit({
          type: 'button_press',
          id
        });
      }
    }
    setIsHeld(false);
  };

  const handleMouseLeave = () => setIsHeld(false);

  return (
    <div
      className="panel-button-wrapper"
      style={{ top: `${y}px`, left: `${x}px` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={glowMap[testColor || displayColor] || glow_off}
        className={`panel-button-img ${isHeld || isActive ? 'pressed' : ''}`}
        draggable={false}
        alt=""
      />
      {label && <div className="panel-button-label">{label}</div>}
    </div>
  );
};

export default PanelButton;
