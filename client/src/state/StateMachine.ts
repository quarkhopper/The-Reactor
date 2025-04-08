import { AppState, Command, CommandCallback } from './types';
import { testManager } from './testManager';
import { initManager } from './initManager';
import { getAllComponentIds } from './componentManifest';
import { registry } from './registry';
import { powerManager } from './powerState';
import { shutdownManager } from './shutdownManager';

// Define the class structure
class StateMachine {
  private state: AppState = 'off';  // Start in off state
  private callbacks: CommandCallback[] = [];
  private initialized: boolean = false;

  // Define the state transition map
  private static STATE_TRANSITIONS: Record<AppState, AppState[]> = {
    'off': ['init'],
    'init': ['test'],
    'test': ['startup'],
    'startup': ['on'],
    'on': ['shutdown', 'scram'],
    'shutdown': ['off'],
    'scram': ['on', 'off']  // Can recover to on or shutdown completely
  };

  // Define the state transition delays (in milliseconds)
  private static STATE_TRANSITION_DELAYS: Record<AppState, number> = {
    'off': 0,
    'init': 0,
    'test': 0,
    'startup': 2000,
    'on': 0,
    'shutdown': 0,  // No delay needed, shutdownManager handles the process
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
    shutdownManager.init();
    
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
    const validNextStates = StateMachine.STATE_TRANSITIONS[this.state];
    if (!validNextStates.includes(newState)) {
      console.warn(`[StateMachine] Invalid state transition: ${this.state} -> ${newState}`);
      return;
    }

    console.log(`[StateMachine] State transition: ${this.state} -> ${newState}`);
    this.state = newState;

    // Handle startup transition
    if (newState === 'startup') {
      console.log('[StateMachine] Starting up...');
      // Schedule the transition to 'on' state
      setTimeout(() => {
        console.log('[StateMachine] Startup complete, transitioning to on state');
        this.updateState('on');
      }, StateMachine.STATE_TRANSITION_DELAYS['startup']);
    }

    // Emit state change
    this.emit({
      type: 'state_change',
      id: 'system',
      state: newState
    });
  }

  emit(cmd: Command) {
    // Log state changes immediately
    if (cmd.type === 'state_change' && cmd.id === 'system') {
      console.log(`[StateMachine] State change: ${cmd.state}`);
      // Forward state changes even when off
      for (const cb of this.callbacks) cb(cmd);
      return;
    }

    // Only log other important commands
    if (cmd.type === 'power_button_press') {
      console.log('[StateMachine] Power button pressed');
    } else if (cmd.type === 'scram_button_press') {
      console.log('[StateMachine] SCRAM button pressed');
    }
    
    // Special case: power button works even when off
    if (cmd.type === 'power_button_press') {
      if (this.state === 'off') {
        this.updateState('init');
      } else if (this.state === 'on') {
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
    
    // Handle process completion
    if (cmd.type === 'process_complete') {
      if (cmd.process === 'init' && this.state === 'init') {
        console.log('[StateMachine] Process init complete, transitioning to test');
        this.updateState('test');
      } else if (cmd.process === 'test' && this.state === 'test') {
        console.log('[StateMachine] Process test complete, transitioning to startup');
        this.updateState('startup');
      } else if (cmd.process === 'shutdown' && this.state === 'shutdown') {
        console.log('[StateMachine] Process shutdown complete, transitioning to off');
        this.updateState('off');
      }
      // Forward the process completion
      for (const cb of this.callbacks) cb(cmd);
      return;
    } else if (cmd.type === 'scram_button_press') {
      // Handle scram button press
      if (this.state === 'scram') {
        // If already in SCRAM state, transition back to 'on' state
        console.log('[StateMachine] SCRAM button pressed while in SCRAM state - transitioning to ON state');
        this.updateState('on');
      } else {
        // Normal SCRAM behavior - transition to scram state
        this.updateState('scram');
      }
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