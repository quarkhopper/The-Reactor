import eventBus from './eventBus';
import stateMachine from './StateMachine';

// Placeholder subsystem types (to be replaced with actual ones)
interface Subsystem {
  tick(): void;
  getState(): any;
}

let tickInterval: NodeJS.Timeout | null = null;

const tickRate = 1000; // ms per tick (adjust later)

const coreSystem: Subsystem = {
  tick: () => {},
  getState: () => ({})
};

const coolSystem: Subsystem = {
  tick: () => {},
  getState: () => ({})
};

const loadSystem: Subsystem = {
  tick: () => {},
  getState: () => ({})
};

const ctrlSystem: Subsystem = {
  tick: () => {},
  getState: () => ({})
};

function tickOnce() {
  coreSystem.tick();
  coolSystem.tick();
  loadSystem.tick();
  ctrlSystem.tick();

  eventBus.publish({ type: 'tick_complete', source: 'tickEngine' });
}

function start() {
  if (tickInterval) return;
  console.log('[tickEngine] Starting ticks');
  tickInterval = setInterval(tickOnce, tickRate);
}

function stop() {
  if (!tickInterval) return;
  clearInterval(tickInterval);
  tickInterval = null;
  console.log('[tickEngine] Stopped ticks');
}

function handleStateChange(state: string) {
  if (state === 'on') start();
  else stop();
}

// Listen to state machine
eventBus.subscribe((event) => {
  if (event.type === 'state_change') {
    handleStateChange(event.payload?.state);
  }
});

export default {
  start,
  stop,
  tickOnce, // for manual stepping
};
