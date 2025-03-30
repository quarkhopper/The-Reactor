import { Subsystem } from '../types';
import eventBus from '../eventBus';
import { ControlInput } from '../types';

// Example: internal system clamp ranges
let autoScramEnabled = true;

function tick() {
  console.log('[ctrlSystem] Tick - autoScram:', autoScramEnabled);
  // TODO: monitor system stability, issue overrides
}

function getState() {
  return {
    autoScramEnabled
  };
}

function handleCtrlInput(payload: ControlInput) {
  if (payload.action === 'toggle_auto_scram') {
    const { value } = payload;
    if (typeof value === 'boolean') {
      autoScramEnabled = value;
      console.log(`[ctrlSystem] Auto SCRAM toggled to ${value}`);
    }
  }
}

eventBus.subscribe((event) => {
  if (event.type === 'control_input' && event.payload?.target === 'ctrlSystem') {
    handleCtrlInput(event.payload);
  }
});

const ctrlSystem: Subsystem = {
  tick,
  getState
};

export default ctrlSystem;
