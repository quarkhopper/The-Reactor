import { Subsystem } from '../types';
import MessageBus from '../../MessageBus';
import { registerSubsystem } from '../tickEngine';
import coreSystem from './coreSystem';

const coreProperties = coreSystem.getState(); // Access fuel rod temperatures from coreSystem

// Heat transfer system properties
let heatCapacity = 1.0;      // High value = more energy needed to change temp
let flowRate = 0.0;          
let thermalMass = 1.5;       // High value = more resistance to temperature change
let heatTransfer = 0.9;       // How efficiently heat moves between core and coolant
let coolantTemperature = 0.0; // Normalized coolant temperature (0-1)
let steamTemperature = 0.0;   // Normalized steam temperature (0-1)
let steamPressure = 0.0;     // Normalized steam pressure (0-1)
let lastUpdateTime = Date.now();

const HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT = 0.05; // Adjusted for realistic heat transfer efficiency
const FUEL_ROD_SURFACE_AREA = 0.8; // Normalized surface area affecting heat transfer
const HEAT_TRANSFER_COEFFICIENT_COOLANT_TO_STEAM = 0.06;
const COOLANT_FLOW_RATE_SCALING = 1.2; // Scaling factor for coolant flow rate effect
const STEAM_PRESSURE_COEFFICIENT = 1.5; // Coefficient to scale steam temperature to pressure
const STEAM_HEAT_CAPACITY = 0.2; // Heat capacity of the steam

// Utility function to clamp values between 0 and 1
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function updateTemperatureAndPressure() {
  const totalHeatFromRods = coreProperties.fuelRods.reduce((sum, row) => {
    return sum + row.reduce((rowSum, rod) => {
      return rowSum + HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT * FUEL_ROD_SURFACE_AREA * flowRate * COOLANT_FLOW_RATE_SCALING * (rod.temperature - coolantTemperature);
    }, 0);
  }, 0);

  const heatTransferToSteam =
    flowRate > 0
      ? HEAT_TRANSFER_COEFFICIENT_COOLANT_TO_STEAM * (coolantTemperature - steamTemperature)
      : 0; // No heat transfer to steam if flow rate is 0

  coolantTemperature = clamp(
    coolantTemperature + (totalHeatFromRods - heatTransferToSteam) / heatCapacity
  );

  // Update steam temperature based on heat from primary coolant only if flow rate > 0
  if (flowRate > 0) {
    steamTemperature = clamp(steamTemperature + heatTransferToSteam / STEAM_HEAT_CAPACITY);

    // Calculate steam pressure based on steam temperature
    steamPressure = clamp(STEAM_PRESSURE_COEFFICIENT * steamTemperature);
  }
}

function tick() {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
  lastUpdateTime = now;

  // Only update if we have a valid time delta
  if (deltaTime > 0 && deltaTime < 1) {

    updateTemperatureAndPressure();

    // Emit coolant temperature update for core cooling calculations
    MessageBus.emit({
      type: 'coolant-temp-update',
      id: 'system',
      value: coolantTemperature
    });

    if (coolantTemperature > 0.9) {
      MessageBus.emit({
        type: 'cooling_state_update',
        value: 'critical'
      });
    } else if (coolantTemperature > 0.7) {
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
    steamTemperature,
    steamPressure,
    flowRate,
    heatCapacity,
    thermalMass,
    heatTransfer,
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

    // Emit flow rate update
    MessageBus.emit({
      type: 'flow_rate_update',
      value: msg.value
    });
  } 
}

const xferSystem: Subsystem = {
  tick,
  getState
};

export default xferSystem;
