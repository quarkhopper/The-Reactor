import { Subsystem } from '../types';

const loadSystem: Subsystem = {
  tick() {
    console.log('[LOAD_SYSTEM] Tick');
    // Eventually: solve tensors, publish events, etc.
  },
  getState() {
    return {
      heat: 0, // placeholder
      pressure: 0,
    };
  }
};

export default loadSystem;
