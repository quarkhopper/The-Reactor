import './subsystems';
import MessageBus from '../MessageBus';
import { AppState } from './types';
import { testManager } from './testManager';
import { initManager } from './initManager';
import { shutdownManager } from './shutdownManager';

// Define the class structure
class StateMachine {
  private state: AppState = 'off';  // Start in off state
  private currentState: AppState = 'off'; // Moved from PowerStateManager
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

  constructor() {
    console.log('[StateMachine] Constructor called');
    // First pass - just construct

    // Subscribe to MessageBus
    MessageBus.subscribe((msg: Record<string, any>) => {
      this.handleCommand(msg);
    });
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
    if (newState !== this.currentState) {
      console.log(`[StateMachine] State change: ${this.currentState} -> ${newState}`);
      this.currentState = newState;
      MessageBus.emit({
        type: 'state_change',
        id: 'system',
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

    // Emit state change using MessageBus
    MessageBus.emit({
      type: 'state_change',
      id: 'system',
      state: newState
    });
  }

  // Added a guard function to validate if a message is relevant to the StateMachine
  private isStateMachineMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'power_button_press' ||
       msg.type === 'process_complete' ||
       msg.type === 'scram_button_press' ||
       msg.type === 'state_change')
    );
  }

  // Updated the handleCommand method to use the guard pattern
  private handleCommand(msg: Record<string, any>) {
    if (!this.isStateMachineMessage(msg)) {
      return;
    }

    console.log(`[StateMachine] Handling command:`, msg);

    if (msg.type === 'power_button_press') {
      if (this.state === 'off') {
        this.updateState('init');
      } else if (this.state === 'on' || this.state === 'scram') {
        this.updateState('shutdown');
      }
      return;
    }

    if (this.state === 'off') {
      return;
    }

    if (msg.type === 'process_complete') {
      if (msg.process === 'init' && this.currentState === 'init') {
        this.updateState('test');
      } else if (msg.process === 'test' && this.currentState === 'test') {
        this.updateState('startup');
      } else if (msg.process === 'shutdown' && this.currentState === 'shutdown') {
        this.updateState('off');
      }
      return;
    } else if (msg.type === 'scram_button_press') {
      if (this.state === 'scram') {
        this.updateState('on');
      } else {
        this.updateState('scram');
      }
    }
  }

  log(message: string) {
    console.log(`[state] ${message}`);
  }
}

// Create singleton instance
const stateMachine = new StateMachine();

// Export the singleton instance - initialization will be triggered by the app
export default stateMachine;