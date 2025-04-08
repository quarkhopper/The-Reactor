import { AppState, Command, CommandCallback } from './types';
import { testManager } from './testManager';
import { initManager } from './initManager';
import { shutdownManager } from './shutdownManager';

// Define the class structure
class StateMachine {
  private state: AppState = 'off';  // Start in off state
  private currentState: AppState = 'off'; // Moved from PowerStateManager
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
    'scram': ['on', 'shutdown']  // Can recover to on or shutdown completely
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

  // Get the current state
  getCurrentState(): AppState {
    return this.currentState;
  }

  // Set state (used by other managers)
  setState(newState: AppState) {
    // Only emit if the state is actually changing
    if (newState !== this.currentState) {
      console.log(`[StateMachine] State change: ${this.currentState} -> ${newState}`);
      this.currentState = newState;
      this.emit({
        type: 'state_change',
        id: 'power',
        state: newState
      });
    }
  }

  // Update state with validation
  private updateState(newState: AppState) {
    if (this.currentState === newState) {
      console.log(`[StateMachine] No state change: ${this.currentState}`);
      return;
    }

    // Validate state transition
    const validNextStates = StateMachine.STATE_TRANSITIONS[this.currentState];
    if (!validNextStates.includes(newState)) {
      console.warn(`[StateMachine] Invalid state transition: ${this.currentState} -> ${newState}`);
      return;
    }

    console.log(`[StateMachine] State transition: ${this.currentState} -> ${newState}`);
    this.currentState = newState;

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
      } else if (this.state === 'on' || this.state === 'scram') {
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
      console.log(`[StateMachine] Received process_complete command: process=${cmd.process}, currentState=${this.state}`);
      if (cmd.process === 'init' && this.currentState === 'init') {
        console.log('[StateMachine] Process init complete, transitioning to test');
        this.updateState('test');
      } else if (cmd.process === 'test' && this.currentState === 'test') {
        console.log('[StateMachine] Process test complete, transitioning to startup');
        this.updateState('startup');
      } else if (cmd.process === 'shutdown' && this.currentState === 'shutdown') {
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