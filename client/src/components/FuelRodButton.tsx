import React, { useEffect, useState } from 'react';
import PanelButton from './PanelButton';
import stateMachine from '../state/StateMachine';
import { useCoreSystem } from '../state/subsystems/coreSystem';
import { useTestable } from '../hooks/useTestable';
import { registry } from '../state/registry';
import type { Command } from '../state/types';

interface FuelRodButtonProps {
  id: string;
  x: number;  // Screen X coordinate
  y: number;  // Screen Y coordinate
  gridX: number;  // Grid X coordinate
  gridY: number;  // Grid Y coordinate
  label?: string;
}

// Helper function to map temperature to color
function getColorFromTemperature(temp: number): string {
  if (temp <= 0) return 'off';
  if (temp < 100) return 'green';
  if (temp < 200) return 'amber';
  if (temp < 300) return 'red';
  return 'white';
}

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
  const [displayColor, setDisplayColor] = useState('off');
  const { isTestMode } = useTestable(id);

  // Check if this button is at a control rod position
  const isControlRod = controlRodCoords.some(([rx, ry]) => rx === gridX && ry === gridY);

  // Self-initialization
  useEffect(() => {
    // Acknowledge initialization as if this was a physical component
    registry.acknowledge(id);
  }, [id]);

  // Command handling
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

  return (
    <PanelButton
      id={id}
      x={x}
      y={y}
      label={label}
      onClick={handleClick}
      isActive={isWithdrawn}
      displayColor={displayColor}
      disabled={!isControlRod}
    />
  );
};

export default FuelRodButton; 