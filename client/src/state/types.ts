// client/src/state/types.ts

export type UIEvent =
  | { type: 'button_press'; id: string }
  | { type: 'button_release'; id: string }
  | { type: 'knob_turn'; id: string; direction: 'left' | 'right' }
  | { type: 'init' };

export type Command =
  | { type: 'set_button_color'; id: string; color: string }
  | { type: 'set_button_light'; id: string; on: boolean }
  | { type: 'start_blinking'; id: string }
  | { type: 'stop_blinking'; id: string }
  | { type: 'set_indicator'; id: string; color: string; label?: string };

export type CommandCallback = (command: Command) => void;
