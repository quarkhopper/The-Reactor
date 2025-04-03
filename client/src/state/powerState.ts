import stateMachine from './StateMachine';
import type { Command, AppState } from './types';

let currentState: AppState = 'off';

// Initialize state machine
stateMachine.subscribe((cmd: Command) => {
  if (cmd.type === 'state_change') {
    const { state } = cmd;
    
    // Only update and emit if the state is actually changing
    if (state !== currentState) {
      console.log(`[powerState] State change: ${currentState} -> ${state}`);
      currentState = state;

      // Emit the new state to all subscribers
      stateMachine.emit({
        type: 'state_change',
        id: 'power',
        state: currentState
      });
    }
  }
});

// Export current state getter
export function getCurrentState(): AppState {
  return currentState;
}

// Export state change function
export function setState(newState: AppState) {
  // Only emit if the state is actually changing
  if (newState !== currentState) {
    stateMachine.emit({
      type: 'state_change',
      id: 'power',
      state: newState
    });
  }
}

// Initialize power state
console.log('[powerState] Module initialized'); 