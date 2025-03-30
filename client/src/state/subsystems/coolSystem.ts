import { Subsystem } from '../types';
import eventBus from '../eventBus';
import { ControlInput } from '../types';

// Example: cooling loop efficiency toggles
const loopEfficiency: boolean[] = Array(4).fill(true); // Example 4 routes

function tick() {
  console.log('[coolSystem] Tick - loop efficiency:', loopEfficiency);
  // TODO: react to current loop configuration
}

function getState() {
  return {
    loopEfficiency
  };
}

function handleCoolInput(payload: ControlInput) {
  if (payload.action === 'toggle_loop_efficiency') {
    const { index, value } = payload;
    if (typeof index === 'number' && typeof value === 'boolean') {
      loopEfficiency[index] = value;
      console.log(`[coolSystem] Toggled loop ${index} efficiency to ${value}`);
    }
  }
}

eventBus.subscribe((event) => {
  if (event.type === 'control_input' && event.payload?.target === 'coolSystem') {
    handleCoolInput(event.payload);
  }
});

const coolSystem: Subsystem = {
  tick,
  getState
};

export default coolSystem;
