import MessageBus from '../../MessageBus';
import coreSystem from './coreSystem';
import xferSystem from './xferSystem';

// Updated constants for more realistic simulation
const STEAM_HEAT_CAPACITY = 0.2; // Heat capacity of the steam
const HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT = 0.05; // Adjusted for realistic heat transfer efficiency
const HEAT_TRANSFER_COEFFICIENT_COOLANT_TO_STEAM = 0.06;
const COOLANT_FLOW_RATE_SCALING = 1.2; // Scaling factor for coolant flow rate effect
const FUEL_ROD_SURFACE_AREA = 0.8; // Normalized surface area affecting heat transfer
const NUM_FUEL_RODS = 49; // Assuming a 7x7 grid of fuel rods

// Constants for steam pressure calculation
const STEAM_PRESSURE_COEFFICIENT = 1.5; // Coefficient to scale steam temperature to pressure

// Adjusted constants for tuning
const HEAT_GAIN_SCALING_FACTOR = 0.018; // Matches coreSystem
const HEAT_LOSS_SCALING_FACTOR = 0.1; // Matches coreSystem

// Access reactivity and coolant properties
const { reactivity } = coreSystem.getState();
const { coolantProperties } = xferSystem.getState();

// State variables
let fuelRodTemperatures = Array(NUM_FUEL_RODS).fill(0.02); // Initial temperature normalized to 0.02
let primaryCoolantTemperature = 0.0; // Matches coolantState.temperature in coreSystem
let steamTemperature = 0.2; // Normalized steam temperature (0-1)
let steamPressure = 0.0; // Normalized steam pressure (0-1)

// Exported state for consumption by coreSystem and coolSystem
export const solverState = {
  get fuelRodTemperatures() {
    return fuelRodTemperatures;
  },
  get primaryCoolantTemperature() {
    return primaryCoolantTemperature;
  },
  get steamTemperature() {
    return steamTemperature;
  },
  get steamPressure() {
    return steamPressure;
  },
};

// Utility function to clamp values between 0 and 1
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Solver tick function
function tick() {
  // Update fuel rod temperatures based on reactivity
  fuelRodTemperatures = fuelRodTemperatures.map((temp, i) => {
    const heatGenerated = reactivity[Math.floor(i / 7)][i % 7] * HEAT_GAIN_SCALING_FACTOR;
    const heatTransferToCoolant =
      HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT * FUEL_ROD_SURFACE_AREA * coolantProperties.flowRate * COOLANT_FLOW_RATE_SCALING * (temp - primaryCoolantTemperature);
    const naturalCooling = HEAT_LOSS_SCALING_FACTOR * temp;
    return clamp(temp + heatGenerated - heatTransferToCoolant - naturalCooling);
  });

  // Update primary coolant temperature based on heat from fuel rods
  const totalHeatFromRods = fuelRodTemperatures.reduce((sum, temp) => {
    return sum + HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT * FUEL_ROD_SURFACE_AREA * coolantProperties.flowRate * COOLANT_FLOW_RATE_SCALING * (temp - primaryCoolantTemperature);
  }, 0);
  const heatTransferToSteam =
    HEAT_TRANSFER_COEFFICIENT_COOLANT_TO_STEAM * (primaryCoolantTemperature - steamTemperature);
  primaryCoolantTemperature = clamp(
    primaryCoolantTemperature + (totalHeatFromRods - heatTransferToSteam) / coolantProperties.heatCapacity
  );

  // Update steam temperature based on heat from primary coolant
  steamTemperature = clamp(steamTemperature + heatTransferToSteam / STEAM_HEAT_CAPACITY);

  // Calculate steam pressure based on steam temperature
  steamPressure = clamp(STEAM_PRESSURE_COEFFICIENT * steamTemperature);

  // Log the current state to the console
  console.log('Fuel Rod Temperatures:', fuelRodTemperatures);
  console.log('Primary Coolant Temperature:', primaryCoolantTemperature);
  console.log('Steam Temperature:', steamTemperature);
  console.log('Steam Pressure:', steamPressure);


}

// Register the solver with the tick engine
export const solver = {
  tick,
  getState: () => ({
    fuelRodTemperatures,
    primaryCoolantTemperature,
    steamTemperature,
    steamPressure,
  }),
};