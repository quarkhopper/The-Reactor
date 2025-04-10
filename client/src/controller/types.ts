// Updated types.ts to align with JSON-based messaging

// Removed the Command type to align with JSON-based messaging

export type AppState = 'off' | 'init' | 'test' | 'fault' | 'startup' | 'on' | 'shutdown' | 'scram';
export type ConditionColor = 'red' | 'green' | 'amber' | 'white' | 'off';

// Retained internal types for main controller components
export type CommandCallback = (command: Record<string, any>) => void;

export interface StateMachineAPI {
  getAppState(): AppState;
  setAppState(state: AppState): void;
  emit(cmd: Record<string, any>): void;
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