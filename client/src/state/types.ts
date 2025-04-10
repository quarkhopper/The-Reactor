export type Command =
  | { type: 'set_button_color'; id: string; color: string }
  | { type: 'set_button_light'; id: string; on: boolean }
  | { type: 'start_blinking'; id: string }
  | { type: 'stop_blinking'; id: string }
  | { type: 'set_indicator'; id: string; value: number }
  | {
      type: 'set_condition_color';
      id: string;
      label: string;
      color: 'red' | 'green' | 'amber' | 'white' | 'off';
    }
  | { type: 'state_change'; id: string; state: AppState }
  | { type: 'button_press'; id: string }
  | { type: 'scram_button_press'; id: string }
  | { type: 'power_button_press'; id: string }
  | { type: 'temperature_update'; id: string; value: number }
  | { type: 'position_update'; id: string; value: number }
  | { type: 'power_update'; id: string; value: number }
  | { type: 'load_update'; id: string; value: number }
  | { type: 'turbine_rpm_update'; value: number }
  | { type: 'knob_change'; id: string; value: 'left' | 'right' }
  | { type: 'test_sequence'; id: string }
  | { type: 'set_loop_efficiency'; id: string; value: 'on' | 'off' }
  | { type: 'set_rod_limit'; id: string; value: string }
  | { type: 'set_load_bank'; id: string; value: 'on' | 'off' }
  | { type: 'test_result'; id: string; passed: boolean }
  | { type: 'tick'; id: string; counter: number }
  | { type: 'fuel_rod_state_toggle'; id: string; x: number; y: number }
  | { type: 'fuel_rod_state_update'; id: string; state: 'engaged' | 'withdrawn' | 'transitioning'; x: number; y: number }
  | { type: 'process_begin'; id: string; process: string }
  | { type: 'process_complete'; id: string; process: string }
  | { type: 'core_temp_update'; value: number }
  | { type: 'coolant_temp_update'; value: number }
  | { type: 'flow_rate_update'; value: number };

export type AppState = 'off' | 'init' | 'test' | 'startup' | 'on' | 'shutdown' | 'scram';
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
  isReady: boolean;
  acknowledge: (id: string) => void;
  reset: () => void;
  begin: (callback: () => void) => void;
}

export interface Subsystem {
  tick(): void;
  getState(): Record<string, any>;
}

export interface ControlInput {
  target: string;       // e.g., 'coreSystem', 'coolSystem'
  action: string;       // e.g., 'set_control_rod_limit'
  index?: number;       // e.g., which slider or button
  value?: number | boolean; // e.g., 0.75 or true/false
} 