import { Subsystem } from '../types';
import MessageBus from '../../MessageBus';
import coreSystem from './coreSystem';


// Heat transfer system properties
let heatCapacity = 1.0;      // High value = more energy needed to change temp
let flowRate = 0.0;          
let thermalMass = 1.5;       // High value = more resistance to temperature change
let heatTransfer = 0.9;       // How efficiently heat moves between core and coolant
let coolantTemperature = 0.1; // Normalized coolant temperature (0-1)
let steamPressure = 0.0;     // Normalized steam pressure (0-1)
let waterAmount = 1.0; // Normalized amount of water (0 = no water, 1 = max water)
let waterTemperature = 0.1; // Normalized water temperature (0-1)
let heatTransferToWater = 0.0; // Heat transfer to water (0-1)
let lastUpdateTime = Date.now();

const HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT = 0.05; // Adjusted for realistic heat transfer efficiency
const FUEL_ROD_SURFACE_AREA = 0.8; // Normalized surface area affecting heat transfer
const HEAT_TRANSFER_COEFFICIENT_COOLANT_TO_WATER = 0.6;
const COOLANT_FLOW_RATE_SCALING = 1.2; // Scaling factor for coolant flow rate effect
const WATER_HEAT_CAPACITY = 0.5; // Heat capacity of the water
const STEAM_CONDENSATION_RATE = 0.01; // Rate of steam condensation affecting pressure
const WATER_COOLING_RATE = 0.05; // Rate of water cooling affecting temperature

// Add rate of change limiter for damping
function applyDamping(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  if (Math.abs(delta) > maxDelta) {
    return current + Math.sign(delta) * maxDelta;
  }
  return target;
}

// Utility function to clamp values between 0 and 1
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Adjust steam pressure to account for continuous condensation
function updateTemperatureAndPressure() {
  const coreProperties = coreSystem.getState(); // Access fuel rod temperatures from coreSystem
  const totalHeatFromRods = coreProperties.fuelRods.reduce((sum, row) => {
    return sum + row.reduce((rowSum, rod) => {
      return rowSum + HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT * FUEL_ROD_SURFACE_AREA * flowRate * COOLANT_FLOW_RATE_SCALING * (rod.temperature - coolantTemperature);
    }, 0);
  }, 0);

  // Apply damping to heat transfer to water
  const targetHeatTransferToWater = HEAT_TRANSFER_COEFFICIENT_COOLANT_TO_WATER * flowRate * waterAmount * (coolantTemperature - waterTemperature);
  heatTransferToWater = applyDamping(heatTransferToWater, targetHeatTransferToWater, 0.05);

  coolantTemperature = clamp(
    coolantTemperature + (totalHeatFromRods - heatTransferToWater) / heatCapacity
  );

  // Update water and steam amounts based on heat transfer and condensation
  steamPressure = clamp(steamPressure + heatTransferToWater - STEAM_CONDENSATION_RATE);
  waterAmount = 1 - steamPressure; // Assuming water and steam pressure are complementary

  // Update steam temperature based on heat from primary coolant
  waterTemperature = clamp(waterTemperature - WATER_COOLING_RATE + heatTransferToWater / WATER_HEAT_CAPACITY);
}

// Updated strings to use underscores instead of dashes
function tick() {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
  lastUpdateTime = now;
  
  // Only update if we have a valid time delta
  if (deltaTime > 0 && deltaTime < 1) {
    
    updateTemperatureAndPressure();
    
    // Emit coolant temperature update for core cooling calculations
    MessageBus.emit({
      type: 'coolant_temp_update',
      id: 'system',
      value: coolantTemperature
    });
    MessageBus.emit({
      type: 'steam_pressure_update',
      id: 'system',
      value: steamPressure
    });

    if (coolantTemperature > 0.9 || steamPressure > 0.9) {
      MessageBus.emit({
        type: 'cooling_state_update',
        value: 'critical'
      });
    } else if (coolantTemperature > 0.7 || steamPressure > 0.7) {
      MessageBus.emit({
        type: 'cooling_state_update',
        value: 'warning'
      });
    } else {
      MessageBus.emit({
        type: 'cooling_state_update',
        value: 'normal'
      });
    }

  }
}

function getState() {
  return {
    coolantTemperature,
    waterTemperature,
    steamPressure,
    flowRate,
    heatCapacity,
    thermalMass,
    heatTransfer,
    waterAmount,
  };
}

function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = ['temperature_update', 'pump_speed_adjust'];
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
