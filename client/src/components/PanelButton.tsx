import { useEffect, useState } from 'react';
import offImg from '../images/button_off.png';
import amber from '../images/button_glow_amber.png';
import green from '../images/button_glow_green.png';
import red from '../images/button_glow_red.png';
import white from '../images/button_glow_white.png';
import '../css/components/PanelButton.css';
import initRegistry from '../state/initRegistry';

export type ButtonColor = 'amber' | 'green' | 'red' | 'white';

interface PanelButtonProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  topLabel?: string;
  color: ButtonColor;
}

export default function PanelButton({
  id,
  x,
  y,
  label,
  topLabel,
  color,
}: PanelButtonProps) {
  const [isOn, setIsOn] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'init') {
        setIsOn(false);
        setIsPressed(false);
        initRegistry.acknowledge(id);
      }
    };

    window.addEventListener('ui-event', handler as EventListener);
    return () => window.removeEventListener('ui-event', handler as EventListener);
  }, [id]);

  const glowMap: Record<ButtonColor, string> = {
    amber,
    green,
    red,
    white,
  };

  return (
    <div
      className="panel-button-wrapper"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      {topLabel && <div className="panel-button-top-label">{topLabel}</div>}
      <img
        src={isOn ? glowMap[color] : offImg}
        alt="Panel Button"
        className={`panel-button-img ${isPressed ? 'pressed' : ''}`}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => {
          setIsPressed(false);
          setIsOn((prev) => !prev);
        }}
        onMouseLeave={() => setIsPressed(false)}
        draggable={false}
      />
      {label && <div className="panel-button-label">{label}</div>}
    </div>
  );
}
