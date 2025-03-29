export type UIEvent =
  | { type: 'button_press'; id: string }
  | { type: 'button_release'; id: string }
  | { type: 'knob_turn'; id: string; direction: 'left' | 'right' }
  | { type: 'slider_move'; id: string; value: number };

export type Command =
  | { type: 'set_button_color'; id: string; color: string }
  | { type: 'set_button_light'; id: string; on: boolean }
  | { type: 'start_blinking'; id: string }
  | { type: 'stop_blinking'; id: string }
  | { type: 'set_indicator'; id: string; color: string }
  | {
      type: 'set_condition_color';
      id: string;
      label: string;
      color: 'red' | 'green' | 'amber' | 'white' | 'off';
    }
  | { type: 'state_change'; id: string; state: AppState }
  | { type: 'button_press'; id: string };

export type AppState = 'off' | 'init' | 'startup' | 'on' | 'shutdown';
export type ConditionColor = 'red' | 'green' | 'amber' | 'white' | 'off';
export type CommandCallback = (command: Command) => void;

export interface StateMachineAPI {
  getAppState(): AppState;
  setAppState(state: AppState): void;
  emit(cmd: Command): void;
  subscribe(cb: CommandCallback): void;
  unsubscribe(cb: CommandCallback): void;
  log(msg: string): void;
}


export interface InitRegistry {
  pending: Set<string>;
  acknowledge: (id: string) => void;
  reset: () => void;
  begin: (callback: () => void) => void;
}

