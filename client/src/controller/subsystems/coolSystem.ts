import { Subsystem } from '../types';
import MessageBus from '../../MessageBus';
import { registerSubsystem } from '../tickEngine';

// Coolant system properties (all normalized 0-1)
interface CoolantProperties {
  heatCapacity: number;    // How much energy needed to change temperature
  flowRate: number;        // Current flow rate based on pump speed
  thermalMass: number;     // How much the coolant resists temperature change
  heatTransfer: number;    // How efficiently heat transfers between core and coolant
}

// System constants
const COOLANT_PROPERTIES: CoolantProperties = {
  heatCapacity: 0.8,      // High value = more energy needed to change temp
  flowRate: 0.0,          
  thermalMass: 0.8,       // High value = more resistance to temperature change
  heatTransfer: 0.8       // How efficiently heat moves between core and coolant
};

// Pressure calculation constants
const TEMP_PRESSURE_FACTOR = 0.6;    // How much temperature affects pressure
const PUMP_PRESSURE_FACTOR = 0.4;    // How much pump speed affects pressure
const TURBULENCE_MAGNITUDE = 0.05;   // Size of pressure oscillations

// State variables
const temperatures = {
  primary: 0,             // Primary loop temperature (0-1)
};

const pumpSpeeds = {
  primary: 0.5,           // Initial pump speed 50%
};

const pressures = {
  primary: 0,             // Primary loop pressure (0-1)
};

let lastUpdateTime = Date.now();

// Initialize a 2D array to store temperatures of each fuel rod
const fuelRodTemperatures: number[][] = Array.from({ length: 7 }, () => Array(7).fill(0));

function calculateTemperatureChange(deltaTime: number): number {
  // Calculate the average temperature of all fuel rods
  const totalFuelRodTemp = fuelRodTemperatures.reduce((sum, row) => 
    sum + row.reduce((rowSum, temp) => rowSum + temp, 0), 0);
  const averageFuelRodTemp = totalFuelRodTemp / (fuelRodTemperatures.length * fuelRodTemperatures[0].length);

  // Normalized heat transfer calculation
  const tempDiff = averageFuelRodTemp - temperatures.primary;
  
  // Heat transfer rate affected by:
  // - Temperature difference
  // - Flow rate (pump speed)
  // - Heat transfer coefficient
  const heatTransferRate = tempDiff * 
    pumpSpeeds.primary * 
    COOLANT_PROPERTIES.heatTransfer;

  // Temperature change based on:
  // - Heat transfer rate
  // - Thermal mass
  // - Heat capacity
  const deltaTemp = (heatTransferRate * deltaTime) / 
    (COOLANT_PROPERTIES.thermalMass * COOLANT_PROPERTIES.heatCapacity);

  return deltaTemp;
}

function calculatePressure(): number {
  // Base pressure from temperature
  const tempPressure = temperatures.primary * TEMP_PRESSURE_FACTOR;
  
  // Additional pressure from pump speed
  const pumpPressure = pumpSpeeds.primary * PUMP_PRESSURE_FACTOR;
  
  // Add some oscillation for visual interest
  const turbulence = Math.sin(Date.now() / 1000) * TURBULENCE_MAGNITUDE;
  
  // Combine and normalize
  return Math.max(0, Math.min(1, tempPressure + pumpPressure + turbulence));
}

function tick() {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
  lastUpdateTime = now;

  // Only update if we have a valid time delta
  if (deltaTime > 0 && deltaTime < 1) {

    // Temperature changes based on current conditions
    const deltaTemp = calculateTemperatureChange(deltaTime);
    console.log(`[coolSystem] Temperature change: ${deltaTemp}`);
    temperatures.primary = Math.max(0, Math.min(1, temperatures.primary + deltaTemp));
    
    // Calculate new pressure
    pressures.primary = calculatePressure();
    
    // Emit the new pressure for UI update
    MessageBus.emit({
      type: 'coolant-pressure-update',
      id: 'system',
      value: pressures.primary
    });

    // Emit coolant temperature update for core cooling calculations
    MessageBus.emit({
      type: 'coolant-temp-update',
      id: 'system',
      value: temperatures.primary
    });

    if (temperatures.primary > 0.9 || pressures.primary > 0.9) {
      MessageBus.emit({
        type: 'cooling_state_update',
        value: 'critical'
      });
    } else if (temperatures.primary > 0.7 || pressures.primary > 0.7) {
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
    temperatures,
    pumpSpeeds,
    pressures,
    coolantProperties: COOLANT_PROPERTIES
  };
}

function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = ['core_temp_update', 'state_change', 'temperature_update', 'pump_speed_adjust'];
  return validTypes.includes(msg.type);
}

// Updated subscription to validate and filter messages
MessageBus.subscribe(handleMessage);

function handleMessage(msg: Record<string, any>) {
  if (!isValidMessage(msg)) {return;} // Guard clause

  if (msg.type === 'pump_speed_adjust') {
    // Handle pump speed updates from cooling sliders
    console.log(`[coolSystem] Pump speed adjusted: ${msg.value}`);
    pumpSpeeds.primary = msg.value;
    COOLANT_PROPERTIES.flowRate = msg.value; // Update flow rate with pump speed

    // Emit flow rate update
    MessageBus.emit({
      type: 'flow_rate_update',
      value: msg.value
    });
  } else if (msg.type === 'temperature_update') {
    // Update temperature of a specific fuel rod based on grid coordinates
    const { gridX, gridY, value } = msg;
    if (gridX >= 0 && gridX < fuelRodTemperatures.length && 
        gridY >= 0 && gridY < fuelRodTemperatures[0].length) {
      fuelRodTemperatures[gridX][gridY] = value;
    }
  } else if (msg.type === 'state_change') {
    if (msg.state === 'startup') {
    } else if (msg.state === 'scram') {
    }
  }
}

const coolSystem: Subsystem = {
  tick,
  getState
};

// Register with tick engine
registerSubsystem(coolSystem);

export default coolSystem;
