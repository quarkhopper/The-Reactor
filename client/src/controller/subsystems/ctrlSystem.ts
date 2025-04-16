import MessageBus from '../../MessageBus';
import { Subsystem } from '../types';
import coreSystem, { findClosestControlRods, setControlRodPosition } from './coreSystem';


const STANDARD_CONTROL_ROD_DELTA = 0.01;

let targetCoreTemp = 0.0
let scram = false; // Track if the system is in scram state

function tick() {
  if (scram) {
    MessageBus.emit({
      type: 'ctrl_state_update',
      value: 'critical',
    });
    return; // If in scram state, skip the tick
  }
  
  const coreProperties = coreSystem.getState(); // Access fuel rod temperatures from coreSystem
  // Adjust the nearest control rods based on the findClosestControlRods function
  coreProperties.fuelRods.forEach((row, gridX) => {
    row.forEach((rod, gridY) => {
      if (rod.state === 'withdrawn') return; // Skip withdrawn rods
      const delta = rod.temperature > targetCoreTemp ? -STANDARD_CONTROL_ROD_DELTA : STANDARD_CONTROL_ROD_DELTA;
      const closestRods = findClosestControlRods(gridX, gridY, 4);
      closestRods.forEach(({ cx, cy }) => {
        const controlRod = coreProperties.controlRods[cx][cy];
        const newPosition = controlRod.position + delta;
        setControlRodPosition(cx, cy, newPosition);
      });
    });
  });

  // Update indicators based on current properties
  MessageBus.emit({
    type: 'ctrl_state_update',
    value: 'normal',
  });
}

// Type guard to validate if a message is relevant to this subsystem
function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = [
    'state_change', 
    'target_temp_update',
    'core_state_update',
    'xfer_state_update'];
  return validTypes.includes(msg.type);
}

MessageBus.subscribe(handleMessage);

function handleMessage (msg: Record<string, any>) {
  if (!isValidMessage(msg)) return; // Guard clause

  if (msg.type === 'state_change') {
    // Handle state change messages
    if (msg.state !== 'scram') {
      scram = false; // Reset scram state
    } else if (msg.state === 'scram') {
      scram = true;
    }
  } else if (msg.type === 'target_temp_update') {
    // Update target power based on message value
    targetCoreTemp = msg.value;
  } else if (msg.type === 'core_state_update' && msg.value === 'critical') {
    sendScramRequest(); // Send scram request
  } else if (msg.type === 'xfer_state_update' && msg.value === 'critical') {
    sendScramRequest(); // Send scram request
  }
}

function sendScramRequest() {
  console.log('[ctrlSystem] Received scram command - setting target core temperature to 0');
  MessageBus.emit({
    type: 'emergency_scram',
    id: 'ctrl',
  });
}

const ctrlSystem: Subsystem = {
  tick,
  getState: () => ({
    targetCoreTemp,
  }),
};

export default ctrlSystem;