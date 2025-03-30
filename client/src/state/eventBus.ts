// client/src/state/eventBus.ts

type EventType =
  | 'state_change'
  | 'core_update'
  | 'cool_update'
  | 'load_update'
  | 'warning_triggered'
  | 'scram_initiated'
  | 'control_rod_set'
  | 'turbine_throttle'
  | string; // Allow extensibility

export interface ReactorEvent {
  type: EventType;
  source: string;
  payload?: any;
}

type Listener = (event: ReactorEvent) => void;

class EventBus {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => this.unsubscribe(listener); // Return unsubscribe function
  }

  unsubscribe(listener: Listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  publish(event: ReactorEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  clear() {
    this.listeners = [];
  }
}

const eventBus = new EventBus();
export default eventBus;
