// client/src/components/MasterButton.tsx
import React, { useState } from 'react';
import '../css/components/MasterButton.css';

import bezel from '../images/master_button_bezel.png';
import glowOff from '../images/master_button_off.png';
import glowOn from '../images/master_button_on.png';

interface MasterButtonProps {
  x: number;
  y: number;
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [isOn, setIsOn] = useState(false);

  return (
  <div
    className="master-button-wrapper"
    style={{ left: `${x}px`, top: `${y}px` }}
    onClick={() => setIsOn((prev) => !prev)}
    tabIndex={-1} // <- prevents focus
  >
      <img src={bezel} className="master-button-img" alt="Bezel" />
      <img
        src={isOn ? glowOn : glowOff}
        className="master-button-overlay"
        alt={isOn ? 'On glow' : 'Off glow'}
      />
    </div>
  );
}
