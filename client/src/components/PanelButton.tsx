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

export default function PanelButton({
  x,
  y,
  label,
  topLabel,
  color,
}: PanelButtonProps) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    console.log('Mounted PanelButton:', { x, y, label, topLabel, color });
  
    const el = document.getElementById('test-button');
    const parent = el?.parentElement;
  
    if (parent) {
      const parentBox = parent.getBoundingClientRect();
      console.log('PARENT BOUNDS:', parentBox);
    } else {
      console.warn('No parent found for PanelButton!');
    }
  }, []);

  const glowMap: Record<ButtonColor, string> = {
    amber,
    green,
    red,
    white,
  };

  return (
    <div
      id="test-button"
      className="absolute z-50 border border-red-500 bg-black"
      style={{
        top: `${y}%`,
        left: `${x}%`,
        width: '60px',
        height: 'auto',
        outline: '2px solid lime',
        background: 'black',
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
