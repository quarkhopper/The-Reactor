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
          cb(state);
        }
      } else {
        console.warn(`[stateMachine] Invalid state transition from ${currentState} to ${state}`);
      }
    }
  },

  emit(cmd: Command) {
    if (currentState === 'off') {
      if (cmd.type === 'power_button_press') {
        // Allow power button to work and transition to init
        currentState = 'init';
        for (const cb of callbacks) cb(cmd);
        // Emit state change to init
        for (const cb of callbacks) cb({ type: 'state_change', id: 'system', state: 'init' });
      }
      return; // All other commands are blocked when power is off
    }
    
    // Handle test sequence results
    if (cmd.type === 'test_result') {
      handleTestSequence(cmd);
    } else if (cmd.type === 'scram_button_press') {
      // Handle scram button press - transition to scram state
      console.log('[stateMachine] SCRAM button pressed');
      stateMachine.setAppState('scram');
    }
    
    // Normal operation when power is on
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
