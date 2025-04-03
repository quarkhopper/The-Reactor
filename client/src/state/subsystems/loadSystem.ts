import { Subsystem } from '../types';
import stateMachine from '../StateMachine';
import type { Command } from '../types';

// Example: load bank states
const loadBanks: boolean[] = Array(4).fill(false); // Example 4 load banks

function tick() {
  console.log('[loadSystem] Tick - load banks:', loadBanks);
  // TODO: calculate power draw
}

function getState() {
  return {
    loadBanks
  };
}

function handleCommand(cmd: Command) {
  if (cmd.type === 'set_load_bank') {
    const { id, value } = cmd;
    const index = parseInt(id.split('_')[2]); // Expecting id format: 'load_bank_N'
    if (!isNaN(index) && index >= 0 && index < loadBanks.length) {
      loadBanks[index] = value === 'on';
      console.log(`[loadSystem] Set load bank ${index} to ${value}`);
    }
  }
}

// Subscribe to commands
stateMachine.subscribe(handleCommand);

const loadSystem: Subsystem = {
  tick,
  getState
};

export default loadSystem;
