import React, { useEffect, useState } from 'react';
import stateMachine from '../state/StateMachine';
import { useCoreSystem } from '../state/subsystems/coreSystem';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

import glow_off from '../images/button_off.png';
import glow_green from '../images/button_glow_green.png';
import glow_amber from '../images/button_glow_amber.png';
import glow_red from '../images/button_glow_red.png';
import glow_white from '../images/button_glow_white.png';

import '../css/components/PanelButton.css';

interface FuelRodButtonProps {
  id: string;
  x: number;  // Screen X coordinate
  y: number;  // Screen Y coordinate
  gridX: number;  // Grid X coordinate
  gridY: number;  // Grid Y coordinate
  label?: string;
}

type ButtonColor = 'off' | 'green' | 'amber' | 'red' | 'white';

// Helper function to map temperature to color
function getColorFromTemperature(temp: number): ButtonColor {
  if (temp <= 0) return 'off';
  if (temp < 100) return 'green';
  if (temp < 200) return 'amber';
  if (temp < 300) return 'red';
  return 'white';
}

const glowMap: Record<ButtonColor, string> = {
  off: glow_off,
  green: glow_green,
  amber: glow_amber,
  red: glow_red,
  white: glow_white,
};

const FuelRodButton: React.FC<FuelRodButtonProps> = ({
  id,
  x,
  y,
  gridX,
  gridY,
  label
}) => {
  const { controlRodCoords } = useCoreSystem();
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [displayColor, setDisplayColor] = useState<ButtonColor>('off');
  const [isTestMode, setIsTestMode] = useState(false);
  const [isHeld, setIsHeld] = useState(false);

  // Check if this button is at a control rod position
  const isControlRod = controlRodCoords.some(([rx, ry]) => rx === gridX && ry === gridY);

  // Handle state changes
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'init') {
        // Reset component state
        setIsWithdrawn(false);
        setDisplayColor('off');
        setIsTestMode(false);
        setIsHeld(false);
        // Acknowledge this component when initialization is requested
        registry.acknowledge(id);
      } else if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'test_sequence' && cmd.id === id) {
        setIsTestMode(true);
        
        // Perform test sequence
        const sequence: ButtonColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;
        
        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;
          
          if (i >= sequence.length) {
            clearInterval(interval);
            setIsTestMode(false);
            setDisplayColor('off');
            
            // Emit test result when test sequence completes
            stateMachine.emit({
              type: 'test_result',
              id,
              passed: true
            });
          }
        }, 150);
        
        return () => clearInterval(interval);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);

  // Handle temperature and control rod updates
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      // Handle temperature updates for all fuel rods
      if (cmd.type === 'temperature_update' && cmd.id === id) {
        if (!isTestMode) {
          setDisplayColor(getColorFromTemperature(cmd.value));
        }
      }

      // Handle control rod position updates only for control rod buttons
      if (isControlRod && cmd.type === 'rod_position_update' && cmd.id === id) {
        setIsWithdrawn(cmd.value > 0);
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id, isTestMode, isControlRod]);

  const handleClick = () => {
    if (!isControlRod) return;
    
    // Emit button press command
    stateMachine.emit({
      type: 'button_press',
      id
    });
  };

  const handleMouseDown = () => {
    setIsHeld(true);
  };

  const handleMouseUp = () => {
    setIsHeld(false);
    if (isControlRod) {
      handleClick();
    }
  };

  const handleMouseLeave = () => {
    setIsHeld(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="panel-button-wrapper"
        style={{ top: `${y}px`, left: `${x}px` }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={glowMap[displayColor]}
          className={`panel-button-img ${isHeld || isWithdrawn ? 'pressed' : ''} ${isTestMode ? 'test-mode' : ''}`}
          draggable={false}
          alt=""
        />
        {label && <div className="panel-button-label">{label}</div>}
      </div>
      {isControlRod && (
        <div style={{ 
          position: 'absolute', 
          top: `${y + 24}px`, 
          left: `${x}px`, 
          transform: 'translateX(-50%)', 
          marginTop: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px black'
        }}>
          Control
        </div>
      )}
    </div>
  );
};

export default FuelRodButton; 