import { AppState, Command, CommandCallback } from './types';
import { testManager } from './testManager';
import { initManager } from './initManager';
import { getAllComponentIds } from './componentManifest';
import { registry } from './registry';

// Define the class structure
class StateMachine {
  private state: AppState = 'init';
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
    initManager.init();  // This will cascade to registry
    testManager.init();
    
    this.initialized = true;
    console.log('[StateMachine] Initialization complete');
  }

  private isValidTransition(fromState: AppState, toState: AppState): boolean {
    // Allow transition from 'on' to 'scram'
    if (fromState === 'on' && toState === 'scram') {
      return true;
    }
    return StateMachine.STATE_TRANSITIONS[fromState] === toState;
  }

  private handleStateTransition(nextState: AppState) {
    switch (nextState) {
      case 'test':
        this.handleTestTransition();
        break;
      case 'startup':
        this.handleStartupTransition();
        break;
      case 'shutdown':
        this.handleShutdownTransition();
        break;
      case 'scram':
        console.log('[stateMachine] SCRAM initiated');
        break;
      case 'on':
        console.log('[stateMachine] Reactor online');
        break;
    }
  }

  private handleTestTransition() {
    // Test manager will handle the test process
    console.log('[stateMachine] Entering test state');
  }

  private handleStartupTransition() {
    console.log('[stateMachine] Starting up...');
    // Schedule the transition to 'on' state
    setTimeout(() => {
      console.log('[stateMachine] Startup complete, transitioning to on state');
      this.updateState('on');
    }, StateMachine.STATE_TRANSITION_DELAYS['startup']);
  }

  private handleShutdownTransition() {
    console.log('[stateMachine] Shutting down...');
    // Schedule the transition to 'off' state
    setTimeout(() => {
      console.log('[stateMachine] Shutdown complete, transitioning to off state');
      this.updateState('off');
    }, StateMachine.STATE_TRANSITION_DELAYS['shutdown']);
  }

  getAppState(): AppState {
    return this.state;
  }

  private updateState(nextState: AppState) {
    // Don't transition if we're already in that state
    if (nextState === this.state) {
      return;
    }

    // Check if the transition is valid
    if (!this.isValidTransition(this.state, nextState)) {
      console.error(`[stateMachine] Invalid state transition from ${this.state} to ${nextState}`);
      return;
    }

    // Update state
    console.log(`[stateMachine] Transitioning from ${this.state} to ${nextState}`);
    this.state = nextState;

    // Emit state change command
    this.emit({
      type: 'state_change',
      id: 'system',
      state: nextState
    });

    // Handle state-specific logic
    this.handleStateTransition(nextState);
  }

  emit(cmd: Command) {
    if (this.state === 'off') {
      if (cmd.type === 'power_button_press') {
        // Allow power button to work and transition to init
        this.updateState('init');
        // Forward the power button press
        for (const cb of this.callbacks) cb(cmd);
      }
      return; // All other commands are blocked when power is off
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
      console.log('[stateMachine] SCRAM button pressed');
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