import type {
  Command,
  CommandCallback,
  AppState,
  StateMachineAPI,
} from './types';

import { handleMasterPower } from './handlers/masterPower';

let currentState: AppState = 'off';
let callbacks: CommandCallback[] = [];

const stateMachine: StateMachineAPI = {
  getAppState() {
    return currentState;
  },

  setAppState(state) {
    currentState = state;
    stateMachine.emit({ type: 'state_change', id: 'system', state });
  },

  emit(cmd: Command) {
    for (const cb of callbacks) cb(cmd);

    // Match on command shape more safely
    if (
      cmd.type === 'button_press' &&
      typeof (cmd as any).id === 'string' &&
      (cmd as any).id === 'master'
    ) {
      handleMasterPower();
    }
  },

  subscribe(cb: CommandCallback): void {
    callbacks.push(cb);
    // No return!
  },

  unsubscribe(cb: CommandCallback): void {
    const index = callbacks.indexOf(cb);
    if (index !== -1) callbacks.splice(index, 1);
  },

  log(msg: string) {
    console.log(`[state] ${msg}`);
  },
};

export default stateMachine;