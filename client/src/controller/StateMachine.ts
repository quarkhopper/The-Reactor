import './subsystems';
import MessageBus from '../MessageBus';
import { AppState } from './types';
import { testManager } from './process_managers/testManager';
import { initManager } from './process_managers/initManager';
import { startupManager } from './process_managers/startupManager';
import { shutdownManager } from './process_managers/shutdownManager';

// Define the class structure
class StateMachine {
  private currentState: AppState = 'off'; // Moved from PowerStateManager
  private initialized: boolean = false;

  // Define the state transition map
  private static STATE_TRANSITIONS: Record<AppState, AppState[]> = {
    'off': ['init'],
    'init': ['test', 'fault'],
    'test': ['startup', 'fault'],
    'fault': ['shutdown', 'off'],
    'startup': ['on', 'fault'],
    'on': ['shutdown', 'scram', 'fault'],
    'shutdown': ['off', 'fault'],
    'scram': ['on', 'shutdown', 'fault']  // Can recover to on or shutdown completely
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
    
    // Subscribe to MessageBus
    MessageBus.subscribe((msg: Record<string, any>) => {
      this.handleMessage(msg);
    });

    // Initialize managers in order - they will cascade to their dependencies
    initManager.init();   // This will cascade to registry
    testManager.init();
    startupManager.init(); 
    shutdownManager.init();
    
    
    this.initialized = true;
    console.log('[StateMachine] Initialization complete');
  }

  // // Get current state
  // getState(): AppState {
  //   return this.currentState;
  // }

  // Get the current state
  // getCurrentState(): AppState {
  //   return this.currentState;
  // }

  // Update state with validation
  private updateState(newState: AppState) {
    console.log(`[StateMachine] Attempting to update state: ${this.currentState} -> ${newState}`);
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
      state: newState,
    });

  }

  // Added a guard function to validate if a message is relevant to the StateMachine
  private isValidMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'power_button_press' ||
       msg.type === 'process_complete' ||
       msg.type === 'process_fault' ||
       msg.type === 'emergency_scram')
    );
  }

  // Updated the handleCommand method to use the guard pattern
  private handleMessage(msg: Record<string, any>) {
    if (!this.isValidMessage(msg)) {
      return;
    }

    console.log(`[StateMachine] Handling message: ${msg.type}`);
    if (msg.type === 'power_button_press') {
      if (this.currentState === 'off') {
        this.updateState('init');
      } else if (this.currentState === 'on' || this.currentState === 'scram') {
        this.updateState('shutdown');
      } else if (this.currentState === 'fault') {
        this.updateState('shutdown');
        return;
      }
      return;
    }
    
    if (this.currentState === 'off') {
      console.error(`[StateMachine] trying to handle message while off: ${msg.type}`);
      return;
    }

    if (msg.type === 'process_complete') {
      if (msg.process === 'init' && this.currentState === 'init') {
        this.updateState('test');
      } else if (msg.process === 'test' && this.currentState === 'test') {
        this.updateState('startup');
      } else if (msg.process === 'startup' && this.currentState === 'startup') {
        this.updateState('on');
      } else if (msg.process === 'shutdown' && this.currentState === 'shutdown') {
        this.updateState('off');
      }
      return;
    } else if (msg.type === 'process_fault') {
      console.warn(`[StateMachine] Process fault: ${msg.process}`);
      this.updateState('fault');
      return;
    } else if (msg.type === 'emergency_scram') {
      console.log(`[StateMachine] SCRAM initiated`);
      if (this.currentState === 'scram') {
        this.updateState('on');
      } else {
        this.updateState('scram');
      }
      return;
    }
    console.log(`[StateMachine] Unhandled message type: ${msg.type}`);
  }

  log(message: string) {
    console.log(`[state] ${message}`);
  }
}

// Create singleton instance
const stateMachine = new StateMachine();

// Export the singleton instance - initialization will be triggered by the app
export default stateMachine;