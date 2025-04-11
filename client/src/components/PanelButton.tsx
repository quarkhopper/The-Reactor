import React, { useState, useEffect } from 'react';
import MessageBus from '../MessageBus';

import glow_off from '../images/button_off.png';
import glow_green from '../images/button_glow_green.png';
import glow_amber from '../images/button_glow_amber.png';
import glow_red from '../images/button_glow_red.png';
import glow_white from '../images/button_glow_white.png';

import '../css/components/PanelButton.css';

type ButtonColor = 'off' | 'green' | 'amber' | 'red' | 'white';

const glowMap: Record<ButtonColor, string> = {
  off: glow_off,
  green: glow_green,
  amber: glow_amber,
  red: glow_red,
  white: glow_white,
};

interface PanelButtonProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  isActive?: boolean;
  displayColor?: ButtonColor;
  disabled?: boolean;
}

const PanelButton: React.FC<PanelButtonProps> = ({ 
  id, 
  x, 
  y, 
  label,
  isActive = false,
  displayColor = 'off',
  disabled = false
}) => {
  const [isHeld, setIsHeld] = useState(false);
  const [currentColor, setCurrentColor] = useState<ButtonColor>(displayColor);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  const isValidMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' ||
        msg.type === 'process_begin' ||
        msg.type === 'button_press')
    );
  };

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return; // Guard clause

    if (msg.type === 'state_change') {
      const state = msg.state;
      if (state === 'startup' || state === 'on') {
        setIsTestMode(false);
        setCurrentColor('off');
      } else if (state === 'off') {
        setCurrentColor('off');
      }
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        setCurrentColor('off');
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setCurrentColor('off');
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
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
    }
  }

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
      MessageBus.emit({
        type: 'button_press',
        id,
      });
    }
    setIsHeld(false);
  }

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
