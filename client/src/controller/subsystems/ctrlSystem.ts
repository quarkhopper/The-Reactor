import MessageBus from '../../MessageBus';
import { Subsystem } from '../types';
import { findClosestControlRods } from './coreSystem';

const STANDARD_CONTROL_ROD_DELTA = 0.01;

let currentCoreTemp = 0; // Track the last received core temperature
let targetCoreTemp = 0.0
let scram = false; // Track if the system is in scram state

function tick() {
  // Placeholder for periodic updates
  // Update indicators based on current properties

  MessageBus.emit({
    type: 'ctrl_state_update',
    value: 'normal',
  });
}

// Type guard to validate if a message is relevant to this subsystem
function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = ['state_change', 'target_temp_update', 'core_temp_update', 'temperature_update'];
  return validTypes.includes(msg.type);
}

MessageBus.subscribe(handleMessage);

function handleMessage (msg: Record<string, any>) {
  if (!isValidMessage(msg)) return; // Guard clause

  if (msg.type === 'state_change') {
    // Handle state change messages
    if (msg.state === 'startup' || msg.state === 'on') {
      targetCoreTemp = 0.1; // Reset target core temperature on startup
      scram = false; // Reset scram state
      // Perform actions for 'on' state
    } else if (msg.state === 'scram') {
      console.log('[ctrlSystem] Received scram command - setting target core temperature to 0');
      scram = true;
    }
  } else if (msg.type === 'target_temp_update') {
    // Update target power based on message value
    targetCoreTemp = msg.value;
  } else if (msg.type === 'core_temp_update') {
    // Update core temperature based on message value
    currentCoreTemp = msg.value;
  } else if (msg.type === 'temperature_update') {
    if (scram) {
      return; // Ignore temperature updates during scram state
    }
    // Update temperature based on message value
    const { gridX, gridY, value } = msg;
    const rodIndices = findClosestControlRods(gridX, gridY);
    if (rodIndices && rodIndices.length > 0) {
      const delta = value > targetCoreTemp ? -STANDARD_CONTROL_ROD_DELTA : STANDARD_CONTROL_ROD_DELTA;
      rodIndices.forEach(rod => {
      MessageBus.emit({
        type: 'control_rod_delta',
        gridX: rod.cx,
        gridY: rod.cy,
        value: delta,
      });
      });
    }
  }
}

const ctrlSystem: Subsystem = {
  tick,
  getState: () => ({
    currentCoreTemp,
    targetCoreTemp,
  }),
};

export default ctrlSystem;