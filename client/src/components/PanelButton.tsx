import React, { useEffect, useState } from 'react';
import eventBus from '../state/eventBus';
import initRegistry from '../state/initRegistry';
import testRegistry from '../state/testRegistry';

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
}

const glowMap: Record<string, string> = {
  off: glow_off,
  green: glow_green,
  amber: glow_amber,
  red: glow_red,
  white: glow_white,
};

const PanelButton: React.FC<PanelButtonProps> = ({ id, x, y, label }) => {
  const [isHeld, setIsHeld] = useState(false);
  const [displayColor, setDisplayColor] = useState('off');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setDisplayColor('off');
        initRegistry.acknowledge(id);
      }

      if (e.detail.type === 'test') {
        // Test sequence: off -> green -> amber -> red -> white -> off
        const colors = ['off', 'green', 'amber', 'red', 'white', 'off'];
        let i = 0;
        const interval = setInterval(() => {
          setDisplayColor(colors[i]);
          i++;
          if (i >= colors.length) {
            clearInterval(interval);
            testRegistry.acknowledge(id);
          }
        }, 100);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, [id]);

  const handleMouseDown = () => {
    if (!disabled) {
      setIsHeld(true);
    }
  };

  const handleMouseUp = () => {
    if (!disabled && isHeld) {
      eventBus.publish({ 
        type: 'button_press', 
        source: 'PanelButton',
        payload: { id } 
      });
    }
    setIsHeld(false);
  };

  const handleMouseLeave = () => {
    setIsHeld(false);
  };

  return (
    <div
      className="panel-button-wrapper"
      style={{ top: `${y}px`, left: `${x}px` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={glowMap[displayColor] || glow_off}
        className={`panel-button-img ${isHeld ? 'pressed' : ''}`}
        draggable={false}
        alt=""
      />
      {label && <div className="panel-button-label">{label}</div>}
    </div>
  );
};

export default PanelButton;
