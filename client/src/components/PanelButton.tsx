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
  const [disabled, setDisabled] = useState(false); // currently unused, reserved for later logic

  const getColorFromTemperature = (temperature: number): string => {
    if (temperature <= 0) return 'off';
    if (temperature < 100) return 'green';
    if (temperature < 300) return 'amber';
    if (temperature < 600) return 'red';
    return 'white';
  };

  useEffect(() => {
    const handleUiEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === 'init') initRegistry.acknowledge(id);
      if (detail.type === 'test') testRegistry.acknowledge(id);
    };

    window.addEventListener('ui-event', handleUiEvent);

    const match = id.match(/^fuel_rod_button_(\d+)_(\d+)$/);
    if (match) {
      const fx = parseInt(match[1]);
      const fy = parseInt(match[2]);

      const listener = (event: any) => {
        if (event.type === 'core_tick_temperature') {
          const { x: tx, y: ty, temperature } = event.payload;
          if (tx === fx && ty === fy) {
            setDisplayColor(getColorFromTemperature(temperature));
          }
        }
      };

      const unsubscribe = eventBus.subscribe(listener);
      return () => {
        unsubscribe();
        window.removeEventListener('ui-event', handleUiEvent);
      };
    }

    return () => window.removeEventListener('ui-event', handleUiEvent);
  }, [id]);

  const handleMouseDown = () => {
    if (!disabled) setIsHeld(true);
  };

  const handleMouseUp = () => {
    if (!disabled && isHeld) {
      eventBus.publish({ type: 'button_press', source: 'user', payload: { id } });
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
        src={glowMap[displayColor] || glow_off}
        className="panel-button-img"
        draggable={false}
        alt=""
      />
      <div className="panel-button-label">{label}</div>
    </div>
  );
};

export default PanelButton;
