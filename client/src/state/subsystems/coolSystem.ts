import { Subsystem } from '../types';

const coolSystem: Subsystem = {
  tick() {
    console.log('[COOL_SYSTEM] Tick');
    // Eventually: solve tensors, publish events, etc.
  },
  getState() {
    return {
      heat: 0, // placeholder
      pressure: 0,
    };
  }
};

export default coolSystem;
