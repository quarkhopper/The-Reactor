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
}

// Start the tick engine
export function startTicking() {
  if (isRunning) return;

  isRunning = true;
  tickCounter = 0;

  tickInterval = setInterval(() => {
    tickCounter++;

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

  isRunning = false;
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// Get the current tick counter
export function getTickCounter(): number {
  return tickCounter;
}

// Check if the tick engine is running
export function isTicking(): boolean {
  return isRunning;
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
