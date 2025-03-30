import { Subsystem } from '../types';
import eventBus from '../eventBus';
import { ControlInput } from '../types';

// Simulated turbine control knob state
let turbineThrottle = 0.5;

function tick() {
  console.log('[loadSystem] Tick - turbine throttle:', turbineThrottle);
  // TODO: simulate capacitor fill/drain based on throttle
}

function getState() {
  return {
    turbineThrottle
  };
}

function handleLoadInput(payload: ControlInput) {
  if (payload.action === 'set_turbine_throttle') {
    const { value } = payload;
    if (typeof value === 'number') {
      turbineThrottle = value;
      console.log(`[loadSystem] Set turbine throttle to ${value}`);
    }
  }
}

eventBus.subscribe((event) => {
  if (event.type === 'control_input' && event.payload?.target === 'loadSystem') {
    handleLoadInput(event.payload);
  }
});

const loadSystem: Subsystem = {
  tick,
  getState
};

export default loadSystem;
