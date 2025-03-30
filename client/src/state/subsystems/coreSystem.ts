import { Subsystem } from '../types';
import eventBus from '../eventBus';
import { ControlInput } from '../types';

// Internal state: example control rod limits (8 sliders)
const controlRodLimits: number[] = Array(8).fill(1); // 1 = fully available

// Tick logic (placeholder)
function tick() {
  console.log('[coreSystem] Tick - control rod limits:', controlRodLimits);
  // Future: compute system behavior based on rod limits, tensors, etc.
}

// Return current state for diagnostics or UI
function getState() {
  return {
    controlRodLimits
  };
}

// Handle control input directed to coreSystem
function handleCoreInput(payload: ControlInput) {
  if (payload.action === 'set_control_rod_limit') {
    const { index, value } = payload;
    if (typeof index === 'number' && typeof value === 'number') {
      controlRodLimits[index] = value;
      console.log(`[coreSystem] Set control rod limit at ${index} to ${value}`);
    }
  }
}

// Subscribe once to relevant events
eventBus.subscribe((event) => {
  if (event.type === 'control_input' && event.payload?.target === 'coreSystem') {
    handleCoreInput(event.payload);
  }
});

// Export subsystem interface
const coreSystem: Subsystem = {
  tick,
  getState
};

export default coreSystem;
