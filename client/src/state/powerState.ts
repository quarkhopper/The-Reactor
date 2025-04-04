import stateMachine from './StateMachine';
import type { Command, AppState } from './types';

class PowerStateManager {
  private initialized: boolean = false;
  private currentState: AppState = 'off';

  constructor() {
    console.log('[PowerStateManager] Constructor called');
    // First pass - just construct
  }

  init() {
    if (this.initialized) {
      console.log('[PowerStateManager] Already initialized');
      return;
    }

    console.log('[PowerStateManager] Initializing power state manager');
    
    // Subscribe to state changes
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        const { state } = cmd;
        
        // Only update if the state is actually changing
        if (state !== this.currentState) {
          console.log(`[PowerStateManager] State change: ${this.currentState} -> ${state}`);
          this.currentState = state;
        }
      }
    });

    this.initialized = true;
    console.log('[PowerStateManager] Initialization complete');
  }

  // Get the current state
  getCurrentState(): AppState {
    return this.currentState;
  }

  // Set state (used by other managers)
  setState(newState: AppState) {
    // Only emit if the state is actually changing
    if (newState !== this.currentState) {
      stateMachine.emit({
        type: 'state_change',
        id: 'power',
        state: newState
      });
    }
  }
}

// Create singleton instance
export const powerManager = new PowerStateManager(); 