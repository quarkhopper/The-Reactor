import stateMachine from './StateMachine';
import type { Command } from './types';

// Tick configuration
const TICK_INTERVAL = 1000; // 1 second between ticks

// Tick state
let isRunning = false;
let tickInterval: NodeJS.Timeout | null = null;
let tickCounter = 0;

// Subsystems that need ticking
const subsystems: { tick: () => void }[] = [];

// Register a subsystem for ticking
export function registerSubsystem(system: { tick: () => void }) {
  subsystems.push(system);
  console.log('[tickEngine] Registered new subsystem');
}

// Start the tick engine
export function startTicking() {
  if (isRunning) return;

  isRunning = true;
  tickCounter = 0;
  console.log('[tickEngine] Starting tick engine');

  tickInterval = setInterval(() => {
    tickCounter++;
    console.log(`[tickEngine] Tick ${tickCounter}`);

    // Tick all subsystems
    subsystems.forEach(system => {
      try {
        system.tick();
      } catch (error) {
        console.error('[tickEngine] Error in subsystem tick:', error);
      }
    });

    // Emit tick event
    stateMachine.emit({
      type: 'tick',
      id: 'system',
      counter: tickCounter
    });
  }, TICK_INTERVAL);
}

// Stop the tick engine
export function stopTicking() {
  if (!isRunning) return;

  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  isRunning = false;
  console.log('[tickEngine] Stopped tick engine');
}

// Initialize tick engine
stateMachine.subscribe((cmd: Command) => {
  if (cmd.type === 'state_change') {
    if (cmd.state === 'on') {
      startTicking();
    } else if (cmd.state === 'off' || cmd.state === 'shutdown') {
      stopTicking();
    }
  }
});

console.log('[tickEngine] Module initialized');
