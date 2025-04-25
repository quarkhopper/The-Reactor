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
  generatorPower: 0, // Normalized generator output voltage (0-1)
  turbineRPM: 0, // Normalized turbine RPM (0-1)
  targetTurbineRPM: 0, // Target turbine RPM (0-1)
};

const gridLoads = [1, 1, 1, 1]; // Initial grid loads set to 1
const TURBINE_INERTIA = 0.05; // Inertia factor for turbine RPM adjustment
const TURBINE_FRICTION = 0.05; // Friction factor for turbine RPM adjustment
const HEAT_RPM_SCALE = 1.5; // Scale factor for heat transfer to RPM
const RPM_POWER_SCALE = 0.3;
const CAPACITOR_NATURAL_DRAIN = 0.01; // Natural drain rate for capacitors
const MAX_CAPACITOR_OUPUT = 0.08; // Maximum output power from capacitors
const MAX_CAPACITOR_CHARGE = 0.1; // Maximum charge for capacitors (0-1)
const MAX_GRID_LOAD_INCREASE = 0.015; // Maximum increase in grid load per tick

// Assign a random frequency and phase to each grid load
function tick() {
  const xferProperties = xferSystem.getState();

  // Apply inductive braking to the turbine based on the number of capacitors being charged
  indicators.targetTurbineRPM = xferProperties.heatTransferred * HEAT_RPM_SCALE;
  const chargingCapacitors = capacitors.filter(capacitor => capacitor.used).length;
  const brakingFactor = chargingCapacitors * 0.03; // Adjust the multiplier to tune braking strength
  const turbineDrag = Math.max(0, brakingFactor - TURBINE_FRICTION);
  indicators.turbineRPM += Math.min(1, (indicators.targetTurbineRPM - indicators.turbineRPM) * TURBINE_INERTIA) - turbineDrag; // Adjust turbine RPM based on target and drag
  indicators.turbineRPM = Math.max(0, Math.min(1, indicators.turbineRPM));

  // Generator voltage is proportional to turbine RPM
  indicators.generatorPower = Math.max(0, Math.min(1, indicators.turbineRPM * RPM_POWER_SCALE));

  // Add random amounts to each grid load per tick (between 0 and 0.015)
  let totalIncrease = 0;
  for (let i = 0; i < gridLoads.length; i++) {
    const randomIncrease = Math.random() * MAX_GRID_LOAD_INCREASE; // Random value between 0 and 0.015
    gridLoads[i] = Math.max(0, Math.min(1, gridLoads[i] + randomIncrease)); // Clamp to [0, 1]
    totalIncrease += randomIncrease; // Sum the increases
  }

  // charge the capacitors based on the generator power
  const usedCapacitors = capacitors.filter(capacitor => capacitor.used).length;

  // apply natural drain to the capacitors
  for (let i = 0; i < capacitors.length; i++) {
      capacitors[i].charge = Math.max(0, capacitors[i].charge - CAPACITOR_NATURAL_DRAIN); // Clamp to [0, 1]
   }

  let totalDischargeableCharge = 0; // Total charge available for discharge
  if (usedCapacitors > 0) {

    const chargePerCapacitor = Math.min(MAX_CAPACITOR_CHARGE, indicators.generatorPower / usedCapacitors); // Distribute charge evenly among capacitors
    for (let i = 0; i < capacitors.length; i++) {
      if (capacitors[i].used) {
        const amountToCharge = Math.min(MAX_CAPACITOR_CHARGE, Math.min(chargePerCapacitor, (1 - capacitors[i].charge))); // Charge only if not fully charged 
        capacitors[i].charge = Math.min(1, capacitors[i].charge + amountToCharge); // Clamp to [0, 1]
      }
    }

    totalDischargeableCharge = capacitors.reduce((sum, capacitor) => sum + (capacitor.used ? Math.min(MAX_CAPACITOR_OUPUT, capacitor.charge) : 0), 0); // Total charge available for discharge

    // Sum the grid loads
    const powerDemand = gridLoads.reduce((sum, load) => sum + load, 0); // Total power demand from grid loads
    
    // Determine if we need to draw from capacitors
    const powerToDistribute = Math.min(powerDemand, totalDischargeableCharge); // Limit power to distribute to the maximum output of capacitors or the total charge available

    // discharge capacitors to meet the power demand
    // calculate the mount per capacitor to discharge only counting the used ones
    const drainPerCapacitor = powerToDistribute / usedCapacitors; // Distribute power evenly among used capacitors
    for (let i = 0; i < capacitors.length; i++) {
      if (capacitors[i].used) {
        capacitors[i].charge = Math.max(0, capacitors[i].charge - drainPerCapacitor); // Clamp to [0, 1]
      }
    }

    // Distribute power to grid loads
    const powerPerLoad = powerToDistribute / gridLoads.length; // Distribute power evenly among loads
    for (let i = 0; i < gridLoads.length; i++) {
      gridLoads[i] = Math.max(0, Math.min(1, gridLoads[i] - powerPerLoad));
    }
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
      value: 1- gridLoads[i],
      index: i,
    });
  }

  const averageGridLoad = gridLoads.reduce((acc, load) => acc + load, 0) / gridLoads.length;
  const peakGridLoad = Math.max(...gridLoads); // Get the peak grid load
  if (peakGridLoad < 0.2) {
    MessageBus.emit({
      type: 'load_state_update',
      value: 'normal'
    });
  } else if (averageGridLoad < 0.6) {
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

  // Emit the average grid load and capacitor charge
  const loadRatio = totalDischargeableCharge / averageGridLoad;
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