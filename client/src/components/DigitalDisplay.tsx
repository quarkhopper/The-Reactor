import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTestable } from '../hooks/useTestable';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';

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
  const animationFrameRef = useRef<number | null>(null);
  
  // Handle test sequence completion
  const handleTestComplete = useCallback(() => {
    // Emit test result when test sequence is complete
    stateMachine.emit({
      type: 'test_result',
      id,
      passed: true
    });
  }, [id]);

  // Function to convert a raw value to display digits
  const getDisplayDigits = (rawValue: number) => {
    // Convert the raw value (0-1) to a two-digit number (0-99)
    const normalizedValue = clamp(rawValue, 0, 1);
    const twoDigitNumber = Math.min(99, Math.floor(normalizedValue * 100));
    
    // Split into left and right digits
    const leftDigit = Math.floor(twoDigitNumber / 10);
    const rightDigit = twoDigitNumber % 10;
    
    return { leftDigit, rightDigit };
  };

  useEffect(() => {
    if (!isTestMode) {
      setDisplayValue(value);
    } else {
      // Reset to 0
      setDisplayValue(0);
      
      // Super simple test: just show 88 for a second, then back to 00
      setTimeout(() => {
        // Set to 88 (0.88 in normalized value)
        setDisplayValue(0.88);
        
        // After 1 second, set back to 00 and complete test
        setTimeout(() => {
          setDisplayValue(0);
          handleTestComplete();
        }, 1000);
      }, 100);
      
      return () => {};
    }
  }, [value, isTestMode, id, handleTestComplete]);

  // Self-initialization
  useEffect(() => {
    registry.acknowledge(id);
  }, [id]);

  // Get the display digits
  const { leftDigit, rightDigit } = getDisplayDigits(displayValue);

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
