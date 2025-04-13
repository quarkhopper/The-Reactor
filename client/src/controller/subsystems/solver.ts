import MessageBus from '../../MessageBus';
import coreSystem from './coreSystem';
import coolSystem from './coolSystem';

// Constants for heat transfer and time simulation
const FUEL_ROD_HEAT_CAPACITY = 0.05; // Heat capacity of each fuel rod
const STEAM_HEAT_CAPACITY = 0.2; // Heat capacity of the steam
const HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT = 0.08;
const HEAT_TRANSFER_COEFFICIENT_COOLANT_TO_STEAM = 0.06;
const NUM_FUEL_RODS = 49; // Assuming a 7x7 grid of fuel rods

// Constants for steam pressure calculation
const STEAM_PRESSURE_COEFFICIENT = 1.5; // Coefficient to scale steam temperature to pressure

// Access reactivity and coolant properties
const { reactivity } = coreSystem.getState();
const { coolantProperties } = coolSystem.getState();

// State variables
let fuelRodTemperatures = Array(NUM_FUEL_RODS).fill(0.5); // Normalized temperatures (0-1)
let primaryCoolantTemperature = 0.3; // Normalized primary coolant temperature (0-1)
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
    const heatGenerated = reactivity[Math.floor(i / 7)][i % 7] * FUEL_ROD_HEAT_CAPACITY;
    const heatTransferToCoolant =
      HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT * (temp - primaryCoolantTemperature);
    return clamp(temp + heatGenerated - heatTransferToCoolant);
  });

  // Update primary coolant temperature based on heat from fuel rods
  const totalHeatFromRods = fuelRodTemperatures.reduce((sum, temp) => {
    return sum + HEAT_TRANSFER_COEFFICIENT_ROD_TO_COOLANT * (temp - primaryCoolantTemperature);
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