import React, { useState } from 'react';
import PanelButton from './PanelButton';

interface TestButtonProps {
  x: number;
  y: number;
}

const TestButton: React.FC<TestButtonProps> = ({ x, y }) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    console.log('Button clicked!');
  };

  return (
    <div>
      <PanelButton
        id="test_button"
        x={x}
        y={y}
        label="Test"
        onClick={handleClick}
        displayColor="green"
      />
      <div style={{ position: 'absolute', top: y + 30, left: x, transform: 'translateX(-50%)', color: 'white' }}>
        Clicks: {count}
      </div>
    </div>
  );
};

export default TestButton; 