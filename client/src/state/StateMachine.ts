// client/src/state/StateMachine.ts

import { UIEvent, Command, CommandCallback } from './types';

class StateMachine {
  private commandCallbacks: CommandCallback[] = [];
  private state: Record<string, any> = {}; // internal simulation state

  constructor() {
    // You could pre-populate state or call this.init()
  }

  public handleEvent(event: UIEvent) {
    switch (event.type) {
      case 'button_press':
        this.log(`Button pressed: ${event.id}`);
        this.setLight(event.id, true);
        break;

      case 'button_release':
        this.log(`Button released: ${event.id}`);
        this.setLight(event.id, false);
        break;

      case 'knob_turn':
        this.log(`Knob turned: ${event.id} → ${event.direction}`);
        break;

      case 'init':
        this.log('Initializing state machine');
        break;
    }
  }

  public subscribe(callback: CommandCallback) {
    this.commandCallbacks.push(callback);
  }

  private emit(command: Command) {
    for (const cb of this.commandCallbacks) {
      cb(command);
    }
  }

  private setLight(id: string, on: boolean) {
    this.emit({ type: 'set_button_light', id, on });
  }

  private log(msg: string) {
    console.log(`[StateMachine] ${msg}`);
  }
}

const instance = new StateMachine();
export default instance;
