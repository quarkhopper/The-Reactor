import { Subsystem } from '../types';
import MessageBus from '../../MessageBus';
import coreSystem from './coreSystem';

// Heat transfer system properties
let flowRate = 0.0;          
let heatTransferred = 0.0; // Total heat from fuel rods (0-1)

const HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT = 0.03; // Adjusted for realistic heat transfer efficiency

// Add rate of change limiter for damping
function applyDamping(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  if (Math.abs(delta) > maxDelta) {
    return current + Math.sign(delta) * maxDelta;
  }
  return target;
}

// Adjust steam pressure to account for continuous condensation
function thermalTick() {
  const coreProperties = coreSystem.getState(); // Access fuel rod temperatures from coreSystem

  // for each condenser we're using (true) increase the condensation rate.
  
  const heatOfAllRods = coreProperties.fuelRods.reduce((sum, row) => {
    return sum + row.reduce((rowSum: number, rod: { temperature: number }) => {
      return rowSum + rod.temperature; // Assuming temperature is a proxy for heat
    }, 0);
  }, 0);

  const targetTotalHeatFromRods = heatOfAllRods * HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT * flowRate; // Adjusted for realistic heat transfer efficiency
  heatTransferred = applyDamping(heatTransferred, targetTotalHeatFromRods, 0.05); // Damping for heat transfer
  heatTransferred = Math.max(0, Math.min(1, heatTransferred)); // Clamp to [0, 1]
}

// Updated strings to use underscores instead of dashes
function tick() {
  thermalTick();
  
  if (heatTransferred > 0.8) {
    // Emit a warning if heat transfer is too high
    MessageBus.emit({
      type: 'xfer_state_update',
      value: 'critical'
    });
  } else if (heatTransferred > 0.6) {
    MessageBus.emit({
      type: 'xfer_state_update',
      value: 'warning'
    });
  } else {
    MessageBus.emit({
      type: 'xfer_state_update',
      value: 'normal'
    });
  }
}

function getState() {
  return {
    heatTransferred,
    flowRate,
  };
}

function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = ['pump_speed_adjust'];
  return validTypes.includes(msg.type);
}

// Updated subscription to validate and filter messages
MessageBus.subscribe(handleMessage);

function handleMessage(msg: Record<string, any>) {
  if (!isValidMessage(msg)) {return;} // Guard clause

  if (msg.type === 'pump_speed_adjust') {
    // Handle pump speed updates from cooling sliders
    flowRate = msg.value;
  }
}

const xferSystem: Subsystem = {
  tick,
  getState
};

export default xferSystem;
