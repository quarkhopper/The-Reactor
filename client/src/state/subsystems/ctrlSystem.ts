import { Subsystem } from '../types';
import stateMachine from '../StateMachine';
import type { Command } from '../types';

// Example: control rod limits
const rodLimits: number[] = Array(8).fill(1.0); // Example 8 rods

function tick() {
  console.log('[ctrlSystem] Tick - rod limits:', rodLimits);
  // TODO: enforce rod limits
}

function getState() {
  return {
    rodLimits
  };
}

function handleCommand(cmd: Command) {
  if (cmd.type === 'set_rod_limit') {
    const { id, value } = cmd;
    const index = parseInt(id.split('_')[2]); // Expecting id format: 'rod_limit_N'
    if (!isNaN(index) && index >= 0 && index < rodLimits.length) {
      rodLimits[index] = parseFloat(value);
      console.log(`[ctrlSystem] Set rod ${index} limit to ${value}`);
    }
  }
}

// Subscribe to commands
stateMachine.subscribe(handleCommand);

const ctrlSystem: Subsystem = {
  tick,
  getState
};

export default ctrlSystem;
