import MessageBus from '../../MessageBus';
import { Subsystem } from '../types';
import xferSystem from './xferSystem';

const capacitors: Array<{ charge: number; used: boolean }> = [
  {
    charge: 0, // Capacitor 1 charge (0-1)
    used: true, // Capacitor 1 usage status (true/false)
  },
  {
    charge: 0, // Capacitor 2 charge (0-1)
    used: true, // Capacitor 2 usage status (true/false)
  },
];

// State variables
const indicators = {
  generatorVoltage: 0, // Normalized generator output voltage (0-1)
  turbineRPM: 0, // Normalized turbine RPM (0-1)
  targetTurbineRPM: 0, // Target turbine RPM (0-1)
};

const gridLoads = [0.4, 0.4, 0.4, 0.4]; // Initial grid loads (normalized 0-1)
const TURBINE_INERTIA = 0.05; // Inertia factor for turbine RPM adjustment
const TURBINE_FRICTION = 0.05; // Friction factor for turbine RPM adjustment
const gridLoadFrequencies = [0.02, 0.03, 0.06, 0.08]; // Frequencies for each grid load (in Hz)
const gridLoadNoiseAmplitude = 0.05; // Amplitude of noise added to the sinusoidal functions

function tick() {
  const xferProperties = xferSystem.getState();
  const time = Date.now() / 1000; // Current time in seconds

  // Calculate grid loads based on noisy sinusoidal functions
  for (let i = 0; i < gridLoads.length; i++) {
    const baseLoad = 0.4 + 0.2 * Math.sin(2 * Math.PI * gridLoadFrequencies[i] * time); // Sinusoidal function
    const noise = (Math.random() - 0.5) * gridLoadNoiseAmplitude; // Add noise
    gridLoads[i] = Math.max(0, Math.min(1, baseLoad + noise)); // Clamp to [0, 1]
  }

  // Calculate target turbine RPM based on heat transferred and grid loads
  
  // Apply inductive braking to the turbine based on the number of capacitors being charged
  indicators.targetTurbineRPM = xferProperties.heatTransferred * 0.9; 
  const chargingCapacitors = capacitors.filter(capacitor => capacitor.used).length;
  const brakingFactor = chargingCapacitors * 0.03; // Adjust the multiplier to tune braking strength
  const turbineDrag = Math.max(0, brakingFactor - TURBINE_FRICTION);
  console.log(`Turbine Drag: ${turbineDrag}`);
  indicators.turbineRPM += Math.min(1, (indicators.targetTurbineRPM - indicators.turbineRPM) * TURBINE_INERTIA) - turbineDrag; // Adjust turbine RPM based on target and drag

  // Generator voltage is proportional to turbine RPM
  indicators.generatorVoltage = indicators.turbineRPM * 0.9;

  // charge capacitors based on generator voltage and usage status and calculate draw from generator
  for (let i = 0; i < capacitors.length; i++) {
    if (capacitors[i].used) {
      const chargeRate = indicators.generatorVoltage * 0.005; // Adjust charge rate based on generator voltage
      capacitors[i].charge = Math.min(1, capacitors[i].charge + chargeRate); // Clamp to [0, 1]
    } else {
      capacitors[i].charge = Math.max(0, capacitors[i].charge - 0.01); // Discharge if not used
    }
  }

  // Combine capacitors to discharge to all grid loads if used=true
  const totalCapacitorCharge = capacitors.reduce((sum, capacitor) => {
    return capacitor.used ? sum + capacitor.charge : sum;
  }, 0);

  // Distribute the total capacitor charge across all grid loads
  const chargePerLoad = totalCapacitorCharge / gridLoads.length;
  for (let i = 0; i < gridLoads.length; i++) {
    gridLoads[i] = Math.max(0, Math.min(1, gridLoads[i] - chargePerLoad));
  }

  // Emit updated state

  MessageBus.emit({
    type: 'target_turbine_rpm',
    value: indicators.targetTurbineRPM,
  });

  MessageBus.emit({
    type: 'turbine_rpm_update',
    value: indicators.turbineRPM,
  });
  MessageBus.emit({
    type: 'capacitor_charge_update',
    value: capacitors[0].charge,
    index: 0,
  });
  MessageBus.emit({
    type: 'capacitor_charge_update',
    value: capacitors[1].charge,
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

  const averageCapacitorCharge = capacitors.reduce((acc, capacitor) => acc + capacitor.charge, 0) / capacitors.length;

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
  if (indicators.turbineRPM > 0.9) {
    MessageBus.emit({
      type: 'gen_state_update',
      value: 'critical'
    });
  } else if (indicators.turbineRPM > 0.8) {
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

const isValidMessage = (msg: Record<string, any>): boolean => {
  const validTypes = ['use_capacitor'];
  return validTypes.includes(msg.type);
}

MessageBus.subscribe(handleMessage);

function handleMessage(msg: Record<string, any>) {
  if (!isValidMessage(msg)) return; // Guard clause

  // Handle messages specific to this subsystem
  if (msg.type === 'use_capacitor') {
    // Handle condenser usage messages
    console.log(`[genSystem] Received use_capacitor command - index: ${msg.index}, value: ${msg.value}`);
    capacitors[msg.index].used = msg.value; // Update usage status based on message value
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