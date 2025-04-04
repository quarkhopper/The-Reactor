import { AppState, Command, CommandCallback } from './types';
import { handleTestSequence, resetTestSequence } from './handlers/testSequence';
import { getAllComponentIds } from './componentManifest';

// Define the class structure
class StateMachine {
  private state: AppState = 'off';
  private callbacks: CommandCallback[] = [];
  private appStateCallbacks: ((state: AppState) => void)[] = [];

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
    resetTestSequence();
    
    // Trigger test sequence for all components
    const componentIds = getAllComponentIds();
    console.log(`[stateMachine] Triggering test sequence for ${componentIds.length} components`);
    
    // Trigger test sequence for all components in parallel
    componentIds.forEach((id: string) => {
      this.emit({
        type: 'test_sequence',
        id
      });
    });
  }

  private handleStartupTransition() {
    console.log('[stateMachine] Starting up...');
    // Schedule the transition to 'on' state
    setTimeout(() => {
      console.log('[stateMachine] Startup complete, transitioning to on state');
      this.setAppState('on');
    }, StateMachine.STATE_TRANSITION_DELAYS['startup']);
  }

  private handleShutdownTransition() {
    console.log('[stateMachine] Shutting down...');
    // Schedule the transition to 'off' state
    setTimeout(() => {
      console.log('[stateMachine] Shutdown complete, transitioning to off state');
      this.setAppState('off');
    }, StateMachine.STATE_TRANSITION_DELAYS['shutdown']);
  }

  getAppState(): AppState {
    return this.state;
  }

  setAppState(nextState: AppState) {
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

    // Notify subscribers
    this.appStateCallbacks.forEach(callback => callback(nextState));

    // Handle state-specific logic
    this.handleStateTransition(nextState);
  }

  emit(cmd: Command) {
    if (this.state === 'off') {
      if (cmd.type === 'power_button_press') {
        // Allow power button to work and transition to init
        this.state = 'init';
        for (const cb of this.callbacks) cb(cmd);
        // Emit state change to init
        for (const cb of this.callbacks) cb({ type: 'state_change', id: 'system', state: 'init' });
      }
      return; // All other commands are blocked when power is off
    }
    
    // Handle test sequence results
    if (cmd.type === 'test_result') {
      handleTestSequence(cmd);
    } else if (cmd.type === 'scram_button_press') {
      // Handle scram button press - transition to scram state
      console.log('[stateMachine] SCRAM button pressed');
      this.setAppState('scram');
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

  subscribeToAppState(cb: (state: AppState) => void) {
    this.appStateCallbacks.push(cb);
    return () => {
      const index = this.appStateCallbacks.indexOf(cb);
      if (index !== -1) this.appStateCallbacks.splice(index, 1);
    };
  }

  log(message: string) {
    console.log(`[state] ${message}`);
  }
}

// Create singleton instance
const stateMachine = new StateMachine();

// Add initialization function
export const initStateMachine = () => {
  console.log('[stateMachine] Initializing state machine');
  return stateMachine;
};

export default stateMachine; 