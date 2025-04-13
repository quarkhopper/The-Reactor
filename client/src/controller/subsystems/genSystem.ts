import MessageBus from '../../MessageBus';
import { Subsystem } from '../types';

// Generation system properties
interface GenSystemProperties {
}

// Initial properties
const GEN_SYSTEM_PROPERTIES: GenSystemProperties = {
};

// State variables
const indicators = {
  generatorVoltage: 0, // Normalized generator output voltage (0-1)
  steamTemperature: 0, // Normalized steam temperature (0-1)
  capacitor1Charge: 0, // Normalized charge for capacitor 1 (0-1)
  capacitor2Charge: 0, // Normalized charge for capacitor 2 (0-1)
  turbineRPM: 0, // Normalized turbine RPM (0-1)
};

const gridLoads = [0.2, 0.3, 0.4, 0.5]; // Initial grid loads (normalized 0-1)

function tick() {
  // Simulate random fluctuation in grid loads
  for (let i = 0; i < gridLoads.length; i++) {
    gridLoads[i] = Math.max(0, Math.min(1, gridLoads[i] + (Math.random() - 0.5) * 0.05));
  }

  // Turbine RPM is proportional to coolant temperature
  indicators.turbineRPM = indicators.steamTemperature * 0.8;

  // Generator voltage is proportional to turbine RPM
  indicators.generatorVoltage = indicators.turbineRPM * 0.9;

  // Capacitor 1 charge is affected by generator voltage and the first two grid loads
  const totalLoad1 = gridLoads[0] + gridLoads[1];
  indicators.capacitor1Charge = Math.max(0, Math.min(1, indicators.generatorVoltage - totalLoad1 * 0.2));

  // Capacitor 2 charge is affected by generator voltage and the last two grid loads
  const totalLoad2 = gridLoads[2] + gridLoads[3];
  indicators.capacitor2Charge = Math.max(0, Math.min(1, indicators.generatorVoltage - totalLoad2 * 0.2));

  // Emit updated state
  MessageBus.emit({
    type: 'turbine_rpm_update',
    value: indicators.turbineRPM,
  });
  MessageBus.emit({
    type: 'capacitor1_charge_update',
    value: indicators.capacitor1Charge,
  });
  MessageBus.emit({
    type: 'capacitor2_charge_update',
    value: indicators.capacitor2Charge,
  });
}

function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = ['coolant-temp-update'];
  return validTypes.includes(msg.type);
}

MessageBus.subscribe(handleMessage);

function handleMessage(msg: Record<string, any>) {
  if (!isValidMessage(msg)) return; // Guard clause

  if (msg.type === 'coolant-temp-update') {
    // Update coolant temperature based on message value
    indicators.steamTemperature = msg.value;
  }
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