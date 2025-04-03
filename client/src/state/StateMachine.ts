import { AppState, Command, CommandCallback } from './types';
import { handleTestSequence } from './handlers/testSequence';
import { isValidTransition } from './stateTransitionManager';

let currentState: AppState = 'off';
const callbacks: CommandCallback[] = [];
const appStateCallbacks: ((state: AppState) => void)[] = [];

const stateMachine = {
  getAppState(): AppState {
    return currentState;
  },

  setAppState(state: AppState) {
    // Only update and emit if the state is actually changing
    if (state !== currentState) {
      // Check if the transition is valid
      if (isValidTransition(currentState, state)) {
        currentState = state;
        console.log(`[stateMachine] State set to: ${state}`);
        stateMachine.emit({ type: 'state_change', id: 'system', state });

        // Notify all app state subscribers
        for (const cb of appStateCallbacks) {
          console.log(`[stateMachine] Notifying subscriber of state: ${state}`);
          cb(state);
        }
      } else {
        console.warn(`[stateMachine] Invalid state transition from ${currentState} to ${state}`);
      }
    }
  },

  emit(cmd: Command) {
    // Handle test sequence results
    if (cmd.type === 'test_result') {
      handleTestSequence(cmd);
    }
    
    for (const cb of callbacks) cb(cmd);
  },

  subscribe(cb: CommandCallback) {
    callbacks.push(cb);
    return () => {
      const index = callbacks.indexOf(cb);
      if (index !== -1) callbacks.splice(index, 1);
    };
  },

  subscribeToAppState(cb: (state: AppState) => void) {
    appStateCallbacks.push(cb);
    return () => {
      const index = appStateCallbacks.indexOf(cb);
      if (index !== -1) appStateCallbacks.splice(index, 1);
    };
  },

  log(message: string) {
    console.log(`[state] ${message}`);
  }
};

export default stateMachine;
