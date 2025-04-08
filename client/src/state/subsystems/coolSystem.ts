import { Subsystem } from '../types';
import stateMachine from '../StateMachine';
import type { Command } from '../types';

// Example: cooling loop efficiency toggles
const loopEfficiency: boolean[] = Array(4).fill(true); // Example 4 routes

// Pump speeds (0-1 range)
const pumpSpeeds = {
  primary: 0,
  secondary: 0
};

function tick() {
  // TODO: react to current loop configuration
}

function getState() {
  return {
    loopEfficiency,
    pumpSpeeds
  };
}

function handleCoolInput(cmd: Command) {
  if (cmd.type === 'set_loop_efficiency') {
    const { id, value } = cmd;
    const index = parseInt(id.split('_')[2]); // Expecting id format: 'loop_efficiency_N'
    if (!isNaN(index) && index >= 0 && index < loopEfficiency.length) {
      loopEfficiency[index] = value === 'on';
      console.log(`[coolSystem] Toggled loop ${index} efficiency to ${value}`);
    }
  }
  else if (cmd.type === 'position_update' && cmd.id.startsWith('cooling_')) {
    // Handle pump speed updates from cooling sliders
    const index = parseInt(cmd.id.split('_')[1]); // Format: cooling_0 or cooling_1
    if (index === 0) {
      pumpSpeeds.primary = cmd.value;
      console.log(`[coolSystem] Primary pump speed set to ${cmd.value}`);
    }
    else if (index === 1) {
      pumpSpeeds.secondary = cmd.value;
      console.log(`[coolSystem] Secondary pump speed set to ${cmd.value}`);
    }
  }
}

// Subscribe to commands
stateMachine.subscribe(handleCoolInput);

const coolSystem: Subsystem = {
  tick,
  getState
};

export default coolSystem;
