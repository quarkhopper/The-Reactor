import React, { useEffect, useState } from 'react';

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
type FuelRodState = 'engaged' | 'withdrawn' | 'transitioning';

// Helper function to map temperature to color
function getColorFromTemperature(temp: number): ButtonColor {
  if (temp <= 0) return 'off';
  if (temp < 0.2) return 'green';
  if (temp < 0.5) return 'amber';
  if (temp < 0.8) return 'red';
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
  const [state, setState] = useState<FuelRodState>('engaged');
  
  const [activeColor, setActiveColor] = useState<ButtonColor>('off'); // Initialize with 'off' color
  
  const [isTestMode, setIsTestMode] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false); // For transitioning state overlay

  // Calculate the actual color to display based on current state
  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'off') {
        // Turn off the light when system is off
        setActiveColor('off'); // Ensure color is set to off
        setIsTestMode(false);
        setIsHeld(false);
        setIsBlinking(false);
        setIsPulsing(false);
      } else if (state === 'init') {
        // Initialize to default state when system initializes
      } else if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
      } else if (state === 'shutdown') {
        setActiveColor('off'); // Ensure color is set to off during shutdown
        setIsBlinking(false);
        setIsPulsing(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  // Handle initialization
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        // Handle initialization
        setState('engaged');
        setIsTestMode(false);
        setIsHeld(false);
        setIsBlinking(false);
        setIsPulsing(false);
        // Acknowledge initialization
        registry.acknowledge(id, () => {
          console.log(`[FuelRodButton] Initialization acknowledged for ${id}`);
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        // Reset state
        setState('engaged');
        setIsTestMode(false);
        setIsHeld(false);
        setIsBlinking(false);
        setIsPulsing(false);
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, []);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'test') {
        setIsTestMode(true);
        
        // Perform test sequence
        const sequence: ButtonColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;
        
        const interval = setInterval(() => {
          // During test, set both the display state and active color
          setActiveColor(sequence[i]);
          i++;
          
          if (i >= sequence.length) {
            clearInterval(interval);
            setIsTestMode(false);
            
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

  // Handle temperature, control rod updates, and fuel rod state changes
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      // Handle temperature updates for all fuel rods
      if (cmd.type === 'temperature_update' && cmd.id === id) {
        if (!isTestMode && state !== 'withdrawn') {
          // Only update the active color, not the display state
          setActiveColor(getColorFromTemperature(cmd.value));
        }
      }

      // Handle fuel rod state updates
      if (cmd.type === 'fuel_rod_state_update' && cmd.id === id) {
        const newState = cmd.state;
        setState(newState);
        
        // Set visual effects based on state
        if (newState === 'transitioning') {
          setIsBlinking(true);
          setIsPulsing(false);
        } else if (newState === 'withdrawn') {
          setIsBlinking(false);
          setIsPulsing(true);
        } else {
          // Engaged state
          setIsBlinking(false);
          setIsPulsing(false);
        }
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id, isTestMode]);

  // Handle blinking effect for transitioning state - using overlay
  useEffect(() => {
    if (!isBlinking) return;
    
    const interval = setInterval(() => {
      setShowOverlay(prev => !prev);
    }, 200); // 200ms for fast blinking during transition

    return () => clearInterval(interval);
  }, [isBlinking]);

  const handleClick = () => {
    // Fuel rods use fuel_rod_state_toggle
    stateMachine.emit({
      type: 'fuel_rod_state_toggle',
      id,
      x: gridX,
      y: gridY
    });
  };

  const handleMouseDown = () => {
    setIsHeld(true);
  };

  const handleMouseUp = () => {
    if (!isHeld) return;
    setIsHeld(false);
    handleClick();
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
        {/* Base colored button always visible */}
        <img
          src={glowMap[activeColor]}
          className={`panel-button-img ${isHeld ? 'pressed' : ''} ${isTestMode ? 'test-mode' : ''}`}
          draggable={false}
          alt=""
          style={{ position: 'absolute' }}
        />
        
        {/* Overlay the off image with 50% opacity for withdrawn or transitioning states */}
        {(isPulsing || (isBlinking && showOverlay)) && (
          <img
            src={glow_off}
            className={`panel-button-img ${isHeld ? 'pressed' : ''} ${isTestMode ? 'test-mode' : ''}`}
            draggable={false}
            alt=""
            style={{ 
              position: 'absolute', 
              opacity: 0.7
            }}
          />
        )}
        
        {label && <div className="panel-button-label">{label}</div>}
      </div>
    </div>
  );
};

export default FuelRodButton;