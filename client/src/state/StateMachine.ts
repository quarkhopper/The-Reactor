// client/src/state/StateMachine.ts

import { UIEvent, Command, CommandCallback } from './types';

class StateMachine {
  private commandCallbacks: CommandCallback[] = [];
  private state: {
    powerState: 'off' | 'startup' | 'on' | 'shutdown';
  } = {
    powerState: 'off',
  };

  public handleEvent(event: UIEvent) {
    switch (event.type) {
      case 'button_press':
        if (event.id === 'master') {
          this.handleMasterButtonPress();
        }
        break;

      case 'init':
        this.log('Initializing state machine');
        this.setMasterLight(false);
        break;
    }
  }

  private handleMasterButtonPress() {
    const current = this.state.powerState;

    if (current === 'off') {
      this.log('Powering up → startup');
      this.state.powerState = 'startup';
      this.emit({ type: 'start_blinking', id: 'master' });

      setTimeout(() => {
        this.log('Startup complete → on');
        this.state.powerState = 'on';
        this.emit({ type: 'stop_blinking', id: 'master' });
        this.emit({ type: 'set_button_light', id: 'master', on: true }); // ✅ stays lit
      }, 5000);

    } else if (current === 'on') {
      this.log('Powering down → shutdown');
      this.state.powerState = 'shutdown';
      this.emit({ type: 'start_blinking', id: 'master' });

      setTimeout(() => {
        this.log('Shutdown complete → off');
        this.state.powerState = 'off';
        this.emit({ type: 'stop_blinking', id: 'master' });
        this.emit({ type: 'set_button_light', id: 'master', on: false }); // ✅ stays false
      }, 5000);
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

  private setMasterLight(on: boolean) {
    console.log(`[EMIT] set_button_light id=master on=${on}`);
    this.emit({ type: 'set_button_light', id: 'master', on });
  }

  private log(msg: string) {
    console.log(`[StateMachine] ${msg}`);
  }
}

const instance = new StateMachine();
export default instance;
