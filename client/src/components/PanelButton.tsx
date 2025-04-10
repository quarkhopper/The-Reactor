import React, { useState, useEffect } from 'react';
import MessageBus from '../MessageBus';

import glow_off from '../images/button_off.png';
import glow_green from '../images/button_glow_green.png';
import glow_amber from '../images/button_glow_amber.png';
import glow_red from '../images/button_glow_red.png';
import glow_white from '../images/button_glow_white.png';

import '../css/components/PanelButton.css';

type ButtonColor = 'off' | 'green' | 'amber' | 'red' | 'white';

interface PanelButtonProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  onClick?: () => void;
  isActive?: boolean;
  displayColor?: ButtonColor;
  disabled?: boolean;
}

const glowMap: Record<ButtonColor, string> = {
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
  const [currentColor, setCurrentColor] = useState<ButtonColor>(displayColor);
  const [isTestMode, setIsTestMode] = useState(false);

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: string) => {
      if (state === 'startup' || state === 'on') {
        setIsTestMode(false);
        setCurrentColor(displayColor);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'state_change' && msg.id === id) {
        handleStateChange(msg.state);
      }
    });

    return () => {
      subscription();
    };
  }, [id, displayColor]);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Record<string, any>) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        setIsHeld(false);
        setCurrentColor('off');
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        setIsHeld(false);
        setCurrentColor('off');
        setIsTestMode(false);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'process_begin' && msg.id === id) {
        handleCommand(msg);
      }
    });

    return () => {
      subscription();
    };
  }, [id]);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Record<string, any>) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'test') {
        setIsTestMode(true);

        const sequence: ButtonColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;

        const interval = setInterval(() => {
          setCurrentColor(sequence[i]);
          i++;

          if (i >= sequence.length) {
            clearInterval(interval);
            setIsTestMode(false);
            setCurrentColor(displayColor);

            MessageBus.emit({
              type: 'test_result',
              id,
              passed: true,
            });
          }
        }, 150);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'process_begin' && msg.id === id) {
        handleCommand(msg);
      }
    });

    return () => {
      subscription();
    };
  }, [id, displayColor]);

  // Update color when displayColor prop changes (but not during test mode)
  useEffect(() => {
    if (!isTestMode) {
      setCurrentColor(displayColor);
    }
  }, [displayColor, isTestMode]);

  const handleMouseDown = () => {
    if (!disabled && !isTestMode) setIsHeld(true);
  };

  const handleMouseUp = () => {
    if (!disabled && !isTestMode && isHeld) {
      if (onClick) {
        onClick();
      } else {
        MessageBus.emit({
          type: 'button_press',
          id,
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
        src={glowMap[currentColor]}
        className={`panel-button-img ${isHeld || isActive ? 'pressed' : ''} ${isTestMode ? 'test-mode' : ''}`}
        draggable={false}
        alt=""
      />
      {label && <div className="panel-button-label">{label}</div>}
    </div>
  );
};

export default PanelButton;
