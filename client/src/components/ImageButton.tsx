import { useState } from 'react';
import panel from '../images/panel_cutout.png';
import buttonOn from '../images/button_glow.png';
import buttonOff from '../images/button_off.png';

export function ImageButton() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Outer wrapper that defines max size and aspect ratio */}
      <div
        className="relative"
        style={{
          width: '90vmin',
          height: '90vmin',
          maxWidth: '768px',
          maxHeight: '768px',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => setIsOn(prev => !prev)}
      >
        {/* Panel fills entire box */}
        <img
          src={panel}
          alt="Panel"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Button overlay positioned as a percentage of the container */}
        <img
            src={isOn ? buttonOn : buttonOff}
            alt="Button"
            style={{
                position: 'absolute',
                top: '35%',
                left: '37%',
                width: '25.4%',
                height: '18.3%',
                objectFit: 'cover',
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease-in-out',
            }}
        />
      </div>
    </div>
  );
}
