import { AppState, Command, CommandCallback } from './types';

let currentState: AppState = 'off';
const callbacks: CommandCallback[] = [];
const appStateCallbacks: ((state: AppState) => void)[] = [];

const stateMachine = {
  getAppState(): AppState {
    return currentState;
  },

  setAppState(state: AppState) {
    currentState = state;
    stateMachine.emit({ type: 'state_change', id: 'system', state });

    // Notify all app state subscribers
    for (const cb of appStateCallbacks) cb(state);
  },

  emit(cmd: Command) {
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
