import React, { useEffect, useState } from 'react';
import { useTestable } from '../hooks/useTestable';
import { registry } from '../state/registry';

import '../css/components/DigitalDisplay.css';

import numbersLeft0 from '../images/numbers_left_0.png';
import numbersLeft1 from '../images/numbers_left_1.png';
import numbersLeft2 from '../images/numbers_left_2.png';
import numbersLeft3 from '../images/numbers_left_3.png';
import numbersLeft4 from '../images/numbers_left_4.png';
import numbersLeft5 from '../images/numbers_left_5.png';
import numbersLeft6 from '../images/numbers_left_6.png';
import numbersLeft7 from '../images/numbers_left_7.png';
import numbersLeft8 from '../images/numbers_left_8.png';
import numbersLeft9 from '../images/numbers_left_9.png';

import numbersRight0 from '../images/numbers_right_0.png';
import numbersRight1 from '../images/numbers_right_1.png';
import numbersRight2 from '../images/numbers_right_2.png';
import numbersRight3 from '../images/numbers_right_3.png';
import numbersRight4 from '../images/numbers_right_4.png';
import numbersRight5 from '../images/numbers_right_5.png';
import numbersRight6 from '../images/numbers_right_6.png';
import numbersRight7 from '../images/numbers_right_7.png';
import numbersRight8 from '../images/numbers_right_8.png';
import numbersRight9 from '../images/numbers_right_9.png';

const leftDigits = [
  numbersLeft0, numbersLeft1, numbersLeft2, numbersLeft3, numbersLeft4,
  numbersLeft5, numbersLeft6, numbersLeft7, numbersLeft8, numbersLeft9,
];

const rightDigits = [
  numbersRight0, numbersRight1, numbersRight2, numbersRight3, numbersRight4,
  numbersRight5, numbersRight6, numbersRight7, numbersRight8, numbersRight9,
];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

interface DigitalDisplayProps {
  id: string;
  x: number;
  y: number;
  value: number;
  label?: string;
}

export default function DigitalDisplay({ id, x, y, value, label }: DigitalDisplayProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const { isTestMode } = useTestable(id);

  useEffect(() => {
    if (!isTestMode) {
      setDisplayValue(value);
    }
  }, [value, isTestMode]);

  // Self-initialization
  useEffect(() => {
    registry.acknowledge(id);
  }, [id]);

  const clamped = Math.min(99, Math.floor(clamp(displayValue, 0, 1) * 100));
  const leftDigit = Math.floor(clamped / 10);
  const rightDigit = clamped % 10;

  return (
    <div className="digital-display-wrapper" style={{ left: `${x}px`, top: `${y}px` }}>
      <div className="digits-row">
        <img src={leftDigits[leftDigit]} className="digit digit-left" alt={`Left ${leftDigit}`} />
        <img src={rightDigits[rightDigit]} className="digit digit-right" alt={`Right ${rightDigit}`} />
      </div>
      {label && <div className="digital-display-label">{label}</div>}
    </div>
  );
}
