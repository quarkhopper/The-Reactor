import { Subsystem } from '../types';

// Generation system properties
interface GenSystemProperties {
  turbinePitch: number; // Turbine blade angle (0-1)
  syncTune: number; // Coupling between turbine and generator (0-1)
  condenserFanSpeed: number; // Condenser cooling speed (0-1)
  reliefValveStates: number[]; // Relief valve positions (0-1)
}

// Initial properties
const GEN_SYSTEM_PROPERTIES: GenSystemProperties = {
  turbinePitch: 0.5, // Default to mid-range
  syncTune: 0.5, // Default to mid-range
  condenserFanSpeed: 0.5, // Default to mid-range
  reliefValveStates: Array(4).fill(0.5), // Four valves, all mid-range
};

// State variables
const indicators = {
  generatorVoltage: 0, // Normalized generator output voltage (0-1)
  condenserTemperature: 0, // Normalized condenser temperature (0-1)
  capacitorCharge: 0, // Normalized capacitor charge (0-1)
  turbineRPM: 0, // Normalized turbine RPM (0-1)
};

function tick() {
  // Placeholder for periodic updates
  // Update indicators based on current properties
  indicators.generatorVoltage = GEN_SYSTEM_PROPERTIES.syncTune * GEN_SYSTEM_PROPERTIES.turbinePitch;
  indicators.condenserTemperature = 1 - GEN_SYSTEM_PROPERTIES.condenserFanSpeed;
  indicators.capacitorCharge = Math.max(0, Math.min(1, indicators.generatorVoltage - 0.1));
  indicators.turbineRPM = GEN_SYSTEM_PROPERTIES.turbinePitch * 0.8;
}

function getState() {
  return {
    properties: GEN_SYSTEM_PROPERTIES,
    indicators,
  };
}

const genSystem: Subsystem = {
  tick,
  getState,
};

export default genSystem;