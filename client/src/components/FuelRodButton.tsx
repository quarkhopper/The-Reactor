import React, { useEffect, useState } from 'react';
import MessageBus from '../MessageBus';

import glow_off from '../images/button_off.png';
import glow_green from '../images/button_glow_green.png';
import glow_amber from '../images/button_glow_amber.png';
import glow_red from '../images/button_glow_red.png';
import glow_white from '../images/button_glow_white.png';

import '../css/components/PanelButton.css';

interface FuelRodButtonProps {
  id: string;
  x: number;  // Screen X coordinate
  y: number;  // Screen Y coordinate
  gridX: number;  // Grid X coordinate
  gridY: number;  // Grid Y coordinate
  label?: string;
}

type ButtonColor = 'off' | 'green' | 'amber' | 'red' | 'white';
type FuelRodState = 'engaged' | 'withdrawn' | 'transitioning';

// Helper function to map temperature to color
function getColorFromTemperature(temp: number): ButtonColor {
  if (temp <= 0) return 'off';
  if (temp < 0.2) return 'green';
  if (temp < 0.5) return 'amber';
  if (temp < 0.8) return 'red';
  return 'white';
}

const glowMap: Record<ButtonColor, string> = {
  off: glow_off,
  green: glow_green,
  amber: glow_amber,
  red: glow_red,
  white: glow_white,
};

const FuelRodButton: React.FC<FuelRodButtonProps> = ({ id, x, y, gridX, gridY, label }) => {
  const [state, setState] = useState<FuelRodState>('engaged');
  const [activeColor, setActiveColor] = useState<ButtonColor>('off');
  const [isTestMode, setIsTestMode] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Guard function to filter relevant messages
  const isComponentMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'process_begin' || msg.type === 'temperature_update' || msg.type === 'fuel_rod_state_update') &&
      msg.id === id
    );
  };

  // Centralized message handler
  const handleMessage = (msg: Record<string, any>) => {
    if (msg.type === 'state_change') {
      handleStateChange(msg.state);
    } else if (msg.type === 'process_begin') {
      handleProcessBegin(msg);
    } else if (msg.type === 'temperature_update') {
      handleTemperatureUpdate(msg.value);
    } else if (msg.type === 'fuel_rod_state_update') {
      handleFuelRodStateUpdate(msg.state);
    }
  };

  const handleStateChange = (state: string) => {
    if (state === 'off') {
      setActiveColor('off');
      setIsTestMode(false);
      setIsHeld(false);
      setIsBlinking(false);
      setIsPulsing(false);
    } else if (state === 'init') {
      setIsTestMode(false);
    } else if (state === 'shutdown') {
      setActiveColor('off');
      setIsBlinking(false);
      setIsPulsing(false);
    }
  };

  const handleProcessBegin = (cmd: Record<string, any>) => {
    if (cmd.process === 'init') {
      setState('engaged');
      setIsTestMode(false);
      setIsHeld(false);
      setIsBlinking(false);
      setIsPulsing(false);
      MessageBus.emit({
        type: 'acknowledge',
        id,
        process: 'init',
      });
    } else if (cmd.process === 'shutdown') {
      setState('engaged');
      setIsTestMode(false);
      setIsHeld(false);
      setIsBlinking(false);
      setIsPulsing(false);
    } else if (cmd.process === 'test') {
      handleTestSequence();
    }
  };

  const handleTemperatureUpdate = (temp: number) => {
    if (!isTestMode && state !== 'withdrawn') {
      setActiveColor(getColorFromTemperature(temp));
    }
  };

  const handleFuelRodStateUpdate = (newState: FuelRodState) => {
    setState(newState);
    if (newState === 'transitioning') {
      setIsBlinking(true);
      setIsPulsing(false);
    } else if (newState === 'withdrawn') {
      setIsBlinking(false);
      setIsPulsing(true);
    } else {
      setIsBlinking(false);
      setIsPulsing(false);
    }
  };

  const handleTestSequence = () => {
    setIsTestMode(true);
    const sequence: ButtonColor[] = ['red', 'amber', 'green', 'white', 'off'];
    let i = 0;
    const interval = setInterval(() => {
      setActiveColor(sequence[i]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setIsTestMode(false);
      }
    }, 150);
    MessageBus.emit({
      type: 'test_result',
      id,
      passed: true,
    });
  };

  useEffect(() => {
    const subscription = MessageBus.subscribe((msg) => {
      if (isComponentMessage(msg)) {
        handleMessage(msg);
      }
    });

    // Return a cleanup function that unsubscribes from MessageBus
    return () => {
      subscription();
    };
  }, [id]);

  useEffect(() => {
    if (!isBlinking) return;
    const interval = setInterval(() => {
      setShowOverlay((prev) => !prev);
    }, 200);
    return () => clearInterval(interval);
  }, [isBlinking]);

  const handleMouseDown = () => {
    setIsHeld(true);
  };

  const handleMouseUp = () => {
    if (!isHeld) return;
    setIsHeld(false);
    MessageBus.emit({
      type: 'fuel_rod_state_toggle',
      id,
      x: gridX,
      y: gridY,
    });
  };

  const handleMouseLeave = () => {
    setIsHeld(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="panel-button-wrapper"
        style={{ top: `${y}px`, left: `${x}px` }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={glowMap[activeColor]}
          className={`panel-button-img ${isHeld ? 'pressed' : ''} ${isTestMode ? 'test-mode' : ''}`}
          draggable={false}
          alt=""
          style={{ position: 'absolute' }}
        />
        {(isPulsing || (isBlinking && showOverlay)) && (
          <img
            src={glow_off}
            className={`panel-button-img ${isHeld ? 'pressed' : ''} ${isTestMode ? 'test-mode' : ''}`}
            draggable={false}
            alt=""
            style={{ 
              position: 'absolute', 
              opacity: 0.7
            }}
          />
        )}
        {label && <div className="panel-button-label">{label}</div>}
      </div>
    </div>
  );
};

export default FuelRodButton;