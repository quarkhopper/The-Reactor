import { Subsystem } from '../types';
import stateMachine from '../StateMachine';
import type { Command } from '../types';

// Example: cooling loop efficiency toggles
const loopEfficiency: boolean[] = Array(4).fill(true); // Example 4 routes

function tick() {
  console.log('[coolSystem] Tick - loop efficiency:', loopEfficiency);
  // TODO: react to current loop configuration
}

function getState() {
  return {
    loopEfficiency
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
}

// Subscribe to commands
stateMachine.subscribe(handleCoolInput);

const coolSystem: Subsystem = {
  tick,
  getState
};

export default coolSystem;
