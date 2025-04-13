import MessageBus from '../../MessageBus';
import { Subsystem } from '../types';
import xferSystem from './xferSystem';



// State variables
const indicators = {
  generatorVoltage: 0, // Normalized generator output voltage (0-1)
  capacitor1Charge: 0, // Normalized charge for capacitor 1 (0-1)
  capacitor2Charge: 0, // Normalized charge for capacitor 2 (0-1)
  turbineRPM: 0, // Normalized turbine RPM (0-1)
};

const gridLoads = [0.4, 0.4, 0.4, 0.4]; // Initial grid loads (normalized 0-1)
const TURBINE_INERTIA = 0.1; // Inertia factor for turbine RPM adjustment
const gridLoadFrequencies = [0.02, 0.03, 0.06, 0.08]; // Frequencies for each grid load (in Hz)
const gridLoadNoiseAmplitude = 0.05; // Amplitude of noise added to the sinusoidal functions

function tick() {
  const xferProperties = xferSystem.getState();
  const time = Date.now() / 1000; // Current time in seconds

  // Calculate grid loads based on noisy sinusoidal functions
  for (let i = 0; i < gridLoads.length; i++) {
    const baseLoad = 0.4 + 0.1 * Math.sin(2 * Math.PI * gridLoadFrequencies[i] * time); // Sinusoidal function
    const noise = (Math.random() - 0.5) * gridLoadNoiseAmplitude; // Add noise
    gridLoads[i] = Math.max(0, Math.min(1, baseLoad + noise)); // Clamp to [0, 1]
  }

  // Target turbine RPM is proportional to coolant temperature
  const targetTurbineRPM = xferProperties.steamPressure * 0.9;

  // Gradually adjust turbine RPM toward the target value based on inertia
  indicators.turbineRPM += (targetTurbineRPM - indicators.turbineRPM) * TURBINE_INERTIA;

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
    type: 'capacitor_charge_update',
    value: indicators.capacitor1Charge,
    index: 0,
  });
  MessageBus.emit({
    type: 'capacitor_charge_update',
    value: indicators.capacitor2Charge,
    index: 1,
  });
  for (let i = 0; i < gridLoads.length; i++) {
    MessageBus.emit({
      type: `grid_load_update`,
      value: gridLoads[i],
      index: i,
    });
  }
  
  const averageGridLoad = gridLoads.reduce((acc, load) => acc + load, 0) / gridLoads.length;
  if (averageGridLoad < 0.5) {
    MessageBus.emit({
      type: 'load_state_update',
      value: 'normal'
    });
  } else if (averageGridLoad < 0.8) {
    MessageBus.emit({
      type: 'load_state_update',
      value: 'warning'
    });
  } else {
    MessageBus.emit({
      type: 'load_state_update',
      value: 'critical'
    });
  }

  const averageCapacitorCharge = (indicators.capacitor1Charge + indicators.capacitor2Charge) / 2;

  // Emit the average grid load and capacitor charge
  const loadRatio = averageCapacitorCharge / averageGridLoad;
  // Emit the load ratio
  if (loadRatio > 0.5) {
    MessageBus.emit({
      type: 'volt_state_update',
      value: 'normal'
    });
  } else if (loadRatio > 0.2) {
    MessageBus.emit({
      type: 'volt_state_update',
      value: 'warning'
    });
  } else {
    MessageBus.emit({
      type: 'volt_state_update',
      value: 'critical'
    });
  }

  // Emit the generator rpm
  if (indicators.turbineRPM > 0.8) {
    MessageBus.emit({
      type: 'gen_state_update',
      value: 'critical'
    });
  } else if (indicators.turbineRPM > 0.5) {
    MessageBus.emit({
      type: 'gen_state_update',
      value: 'warning'
    });
  } else {
    MessageBus.emit({
      type: 'gen_state_update',
      value: 'normal'
    });
  }
}

function getState() {
  return {
    indicators,
  };
}

const genSystem: Subsystem = {
  tick,
  getState,
};

export default genSystem;