import { Subsystem } from '../types';
import MessageBus from '../MessageBus';
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
  heatCapacity: 0.7,      // High value = more energy needed to change temp
  flowRate: 0.5,          // Initial flow rate at 50%
  thermalMass: 0.8,       // High value = more resistance to temperature change
  heatTransfer: 0.6       // How efficiently heat moves between core and coolant
};

// Pressure calculation constants
const TEMP_PRESSURE_FACTOR = 0.6;    // How much temperature affects pressure
const PUMP_PRESSURE_FACTOR = 0.4;    // How much pump speed affects pressure
const TURBULENCE_MAGNITUDE = 0.05;   // Size of pressure oscillations

// State variables
const temperatures = {
  primary: 0,             // Primary loop temperature (0-1)
  secondary: 0            // Secondary loop temperature (0-1)
};

const pumpSpeeds = {
  primary: 0.5,           // Initial pump speed 50%
  secondary: 0
};

const pressures = {
  primary: 0,             // Primary loop pressure (0-1)
  secondary: 0            // Secondary loop pressure (0-1)
};

let lastUpdateTime = Date.now();
let currentCoreTemp = 0;  // Track the last received core temperature

function calculateTemperatureChange(coreTemp: number, deltaTime: number): number {
  // Normalized heat transfer calculation
  const tempDiff = coreTemp - temperatures.primary;
  
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
    const deltaTemp = calculateTemperatureChange(currentCoreTemp, deltaTime);
    temperatures.primary = Math.max(0, Math.min(1, temperatures.primary + deltaTemp));
    
    // Calculate new pressure
    pressures.primary = calculatePressure();
    
    // Emit the new temperature for UI update
    MessageBus.emit({
      type: 'set_indicator',
      id: 'pump_temp_meter_primary',
      value: temperatures.primary
    });

    // Emit the new pressure for UI update
    MessageBus.emit({
      type: 'set_indicator',
      id: 'pump_pres_meter_primary',
      value: pressures.primary
    });

    // Emit coolant temperature update for core cooling calculations
    MessageBus.emit({
      type: 'coolant_temp_update',
      value: temperatures.primary
    });
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

function handleCoolInput(cmd: Record<string, any>) {
  if (cmd.type === 'position_update' && cmd.id.startsWith('cooling_')) {
    // Handle pump speed updates from cooling sliders
    const index = parseInt(cmd.id.split('_')[1]); // Format: cooling_0 or cooling_1
    if (index === 0) {
      pumpSpeeds.primary = cmd.value;
      COOLANT_PROPERTIES.flowRate = cmd.value; // Update flow rate with pump speed

      // Emit flow rate update
      MessageBus.emit({
        type: 'flow_rate_update',
        value: cmd.value
      });
    }
    else if (index === 1) {
      pumpSpeeds.secondary = cmd.value;
    }
  }
  else if (cmd.type === 'core_temp_update') {
    // Store the core temperature for use in our tick calculations
    currentCoreTemp = cmd.value;
  }
  else if (cmd.type === 'state_change') {
    if (cmd.state === 'startup') {
      // Set primary pump to 50% at startup
      pumpSpeeds.primary = 0.5;
      COOLANT_PROPERTIES.flowRate = 0.5;
      console.log('[coolSystem] Startup initiated - setting primary pump to 50%');
      
      // Update the pump slider position
      MessageBus.emit({
        type: 'position_update',
        id: 'cooling_0',
        value: 0.5
      });

      // Emit flow rate update
      MessageBus.emit({
        type: 'flow_rate_update',
        value: 0.5
      });
    }
    else if (cmd.state === 'scram') {
      // Set primary pump to 100% during SCRAM
      pumpSpeeds.primary = 1.0;
      COOLANT_PROPERTIES.flowRate = 1.0;
      console.log('[coolSystem] SCRAM initiated - setting primary pump to 100%');
      
      // Update the pump slider position
      MessageBus.emit({
        type: 'position_update',
        id: 'cooling_0',
        value: 1.0
      });

      // Emit flow rate update
      MessageBus.emit({
        type: 'flow_rate_update',
        value: 1.0
      });
    }
  }
}

// Type guard to validate if a message is a Command
function isCommand(msg: Record<string, any>): boolean {
  return (
    typeof msg.type === 'string' &&
    (msg.type === 'position_update' || msg.type === 'core_temp_update' || msg.type === 'state_change') &&
    typeof msg.id === 'string'
  );
}

// Updated subscription to validate and filter messages
MessageBus.subscribe((msg: Record<string, any>) => {
  if (isCommand(msg)) {
    handleCoolInput(msg);
  }
});

const coolSystem: Subsystem = {
  tick,
  getState
};

// Register with tick engine
registerSubsystem(coolSystem);

export default coolSystem;
