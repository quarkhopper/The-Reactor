import { AppState, Command, CommandCallback } from './types';
import { testManager } from './testManager';
import { initManager } from './initManager';
import { getAllComponentIds } from './componentManifest';
import { registry } from './registry';
import { powerManager } from './powerState';

// Define the class structure
class StateMachine {
  private state: AppState = 'off';  // Start in off state
  private callbacks: CommandCallback[] = [];
  private initialized: boolean = false;

  // Define the state transition map
  private static STATE_TRANSITIONS: Record<AppState, AppState | null> = {
    'off': 'init',
    'init': 'test',
    'test': 'startup',
    'startup': 'on',
    'on': 'shutdown',
    'shutdown': 'off',
    'scram': null  // Terminal state for now
  };

  // Define the state transition delays (in milliseconds)
  private static STATE_TRANSITION_DELAYS: Record<AppState, number> = {
    'off': 0,
    'init': 0,
    'test': 0,
    'startup': 2000,
    'on': 0,
    'shutdown': 2000,
    'scram': 0
  };

  constructor() {
    console.log('[StateMachine] Constructor called');
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      console.log('[StateMachine] Already initialized');
      return;
    }

    console.log('[StateMachine] Initializing state machine');
    
    // Initialize managers in order - they will cascade to their dependencies
    powerManager.init();  // Initialize power manager first
    initManager.init();   // This will cascade to registry
    testManager.init();
    
    this.initialized = true;
    console.log('[StateMachine] Initialization complete');
  }

  // Get current state
  getState(): AppState {
    return this.state;
  }

  // Update state with validation
  private updateState(newState: AppState) {
    if (this.state === newState) return;

    // Special case for power button - allow off->init transition
    if (this.state === 'off' && newState === 'init') {
      console.log(`[StateMachine] Power on: ${this.state} -> ${newState}`);
      this.state = newState;
      this.emit({
        type: 'state_change',
        id: 'system',
        state: newState
      });
      return;
    }

    // Validate state transition
    const nextState = StateMachine.STATE_TRANSITIONS[this.state];
    if (nextState !== newState) {
      console.warn(`[StateMachine] Invalid state transition: ${this.state} -> ${newState}`);
      return;
    }

    console.log(`[StateMachine] State transition: ${this.state} -> ${newState}`);
    this.state = newState;

    // Handle shutdown transition
    if (newState === 'shutdown') {
      console.log('[StateMachine] Shutting down...');
      // Schedule the transition to 'off' state
      setTimeout(() => {
        console.log('[StateMachine] Shutdown complete, transitioning to off state');
        this.updateState('off');
      }, StateMachine.STATE_TRANSITION_DELAYS['shutdown']);
    }

    // Emit state change
    this.emit({
      type: 'state_change',
      id: 'system',
      state: newState
    });
  }

  emit(cmd: Command) {
    // Special case: power button works even when off
    if (cmd.type === 'power_button_press') {
      if (this.state === 'off') {
        console.log('[StateMachine] Power button pressed while off - starting up');
        this.updateState('init');
      } else if (this.state === 'on') {
        console.log('[StateMachine] Power button pressed while on - shutting down');
        this.updateState('shutdown');
      }
      // Forward the power button press
      for (const cb of this.callbacks) cb(cmd);
      return;
    }

    // Block all other commands when power is off
    if (this.state === 'off') {
      return;
    }
    
    // Handle state change commands
    if (cmd.type === 'state_change' && cmd.id === 'system') {
      // Forward the state change command
      for (const cb of this.callbacks) cb(cmd);
      return;
    }
    
    // Handle test sequence results
    if (cmd.type === 'test_result') {
      testManager.handleCommand(cmd);
    } else if (cmd.type === 'scram_button_press') {
      // Handle scram button press - transition to scram state
      console.log('[StateMachine] SCRAM button pressed');
      this.updateState('scram');
    }
    
    // Normal operation when power is on
    for (const cb of this.callbacks) cb(cmd);
  }

  subscribe(cb: CommandCallback) {
    this.callbacks.push(cb);
    return () => {
      const index = this.callbacks.indexOf(cb);
      if (index !== -1) this.callbacks.splice(index, 1);
    };
  }

  log(message: string) {
    console.log(`[state] ${message}`);
  }
}

// Create singleton instance
const stateMachine = new StateMachine();

// Export the singleton instance - initialization will be triggered by the app
export default stateMachine; 