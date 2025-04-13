import React, { useEffect, useState } from 'react';
import MessageBus from '../MessageBus';

import glow_off from '../images/button_off.png';
import glow_green from '../images/button_glow_green.png';
import glow_amber from '../images/button_glow_amber.png';
import glow_red from '../images/button_glow_red.png';
import glow_white from '../images/button_glow_white.png';

import '../css/components/PanelButton.css';


interface ColorButtonProps {
  id: string;
  x: number;  // Screen X coordinate
  y: number;  // Screen Y coordinate
  gridX?: number;  // Grid X coordinate
  gridY?: number;  // Grid Y coordinate
  index?: number;  // Index for the button
  toggleSendEvent: string; // Event type to use for sending a toggle message
  colorMap?: { range: [number, number]; color: string }[]; // Color mapping for temperature ranges
  colorEvent?: { type: string }; 
  litEvent?: { type: string; value: string }; 
  dimEvent?: {type: string; value: string } 
  blinkEvent?: {type: string; value: string } 
}

function getColorFromMap(temp: number, colorMap?: { range: [number, number]; color: string }[]): string {
  if (!colorMap || colorMap.length === 0) {
    console.warn('Color map is undefined or empty. Defaulting to white.');
    return 'white';
  }

  const mapping = colorMap.find(({ range }) => temp >= range[0] && temp <= range[1]);
  if (!mapping) {
    console.warn(`No color mapping found for temperature: ${temp}. Defaulting to white.`);
  }

  return mapping ? mapping.color : 'white'; // Default to white if no mapping found
}

const glowMap: Record<string, string> = {
  off: glow_off,
  green: glow_green,
  amber: glow_amber,
  red: glow_red,
  white: glow_white,
};

const FuelRodButton: React.FC<ColorButtonProps> = ({ id, x, y, gridX, gridY, index, toggleSendEvent, colorMap, colorEvent, litEvent, dimEvent, blinkEvent }) => {
  const [activeColor, setActiveColor] = useState<string>('off');
  const [isTestMode, setIsTestMode] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  // Guard function to filter relevant messages
  const isValidMessage = (msg: Record<string, any>): boolean => {
    const validTypes = ['state_change', 
      'process_begin', 
      colorEvent?.type, 
      litEvent?.type, 
      dimEvent?.type, 
      blinkEvent?.type];
    return validTypes.includes(msg.type) &&
      ((msg.index == null) || msg.index === index) &&
      ((msg.gridX == null) || msg.gridX === gridX) &&
      ((msg.gridY == null) || msg.gridY === gridY);
  };

  // Centralized message handler
  const handleMessage = (msg: Record<string, any>) => {
    if (!isValidMessage(msg)) return; // Guard clause
    if (msg.type === 'state_change') {
      handleStateChange(msg.state);
    } else if (msg.type === 'process_begin') {
      handleProcessBegin(msg);
    } else if (msg.type === colorEvent?.type) {
      handleColorUpdate(msg.value);
    } else if (msg.type === litEvent?.type && msg.value === litEvent?.value) {
      setIsBlinking(false);
      setShowOverlay(false);
    } else if (msg.type === dimEvent?.type && msg.value === dimEvent?.value) {
      setIsBlinking(false);
      setShowOverlay(true);
    } else if (msg.type === blinkEvent?.type && msg.value === blinkEvent?.value) {
      console.log('Blinking event received: ', msg);
      setIsBlinking(true);
    }
  };

  const handleStateChange = (state: string) => {
    if (state === 'off') {
      setActiveColor('off');
      setIsTestMode(false);
      setIsHeld(false);
      setIsBlinking(false);
    } else if (state === 'init') {
      setIsTestMode(false);
    } else if (state === 'shutdown') {
      setActiveColor('off');
      setIsBlinking(false);
    }
  };

  const handleProcessBegin = (cmd: Record<string, any>) => {
    if (cmd.process === 'init') {
      setIsTestMode(false);
      setIsHeld(false);
      setIsBlinking(false);
      MessageBus.emit({
        type: 'acknowledge',
        id,
        process: 'init',
      });
    } else if (cmd.process === 'shutdown') {
      setIsTestMode(false);
      setIsHeld(false);
      setIsBlinking(false);
      MessageBus.emit({
        type: 'acknowledge',
        id,
        process: 'shutdown',
      });
    } else if (cmd.process === 'test') {
      handleTestSequence();
    }
  };

  const handleColorUpdate = (value: number) => {
    if (!isTestMode) {
      setActiveColor(getColorFromMap(value, colorMap));
    }
  };

  const handleTestSequence = () => {
    setIsTestMode(true);
    const sequence: string[] = ['red', 'amber', 'green', 'white', 'off'];
    let i = 0;
    const interval = setInterval(() => {
      setActiveColor(sequence[i]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'test_result',
          id,
          passed: true,
        });
      }
    }, 150);

  };

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
      type: toggleSendEvent,
      id: id,
      gridX: gridX,
      gridY: gridY,
      index: index,
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
        {(showOverlay) && (
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
      </div>
    </div>
  );
};

export default FuelRodButton;