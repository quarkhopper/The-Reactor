import { Subsystem } from '../types';

const coreSystem: Subsystem = {
  tick() {
    console.log('[CORE_SYSTEM] Tick');
    // Eventually: solve tensors, publish events, etc.
  },
  getState() {
    return {
      heat: 0, // placeholder
      pressure: 0,
    };
  }
};

export default coreSystem;
