import { useState, useEffect } from 'react';
import offImg from '../images/button_off.png';
import amber from '../images/button_glow_amber.png';
import green from '../images/button_glow_green.png';
import red from '../images/button_glow_red.png';
import white from '../images/button_glow_white.png';

export type ButtonColor = 'amber' | 'green' | 'red' | 'white';

interface PanelButtonProps {
  x: number;
  y: number;
  label?: string;
  topLabel?: string;
  color: ButtonColor;
}

export function PanelButton({
  x,
  y,
  label,
  topLabel,
  color,
}: PanelButtonProps) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    console.log('Mounted PanelButton:', { x, y, label, topLabel, color });
  }, []);

  const glowMap: Record<ButtonColor, string> = {
    amber,
    green,
    red,
    white,
  };

  return (
    <div
      className="absolute z-50 border border-red-500 bg-black"
      style={{
        top: `${y}%`,
        left: `${x}%`,
        transform: 'translate(-50%, -50%)',
        width: '60px',
        height: 'auto',
      }}
      onClick={() => setIsOn((prev) => !prev)}
    >
      <div className="text-white text-[10px] font-mono bg-black bg-opacity-60 px-1 text-center absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
        {`x:${x}% y:${y}% on:${isOn}`}
      </div>

      <div className="flex flex-col items-center cursor-pointer">
        {topLabel && (
          <div className="text-black text-[10px] text-center font-mono leading-none mb-1">
            {topLabel}
          </div>
        )}

        <img
          src={isOn ? glowMap[color] : offImg}
          alt="Panel Button"
          style={{ width: '100%', height: 'auto' }}
        />

        {label && (
          <div className="text-black text-[10px] text-center font-mono leading-none mt-1">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
