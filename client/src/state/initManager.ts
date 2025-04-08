import stateMachine from './StateMachine';
import { registry } from './registry';
import type { Command } from './types';

class InitManager {
  private initialized: boolean = false;

  constructor() {
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      return;
    }
    
    console.log('[initManager] Initializing');
    
    // Subscribe to state changes
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.state === 'init') {
        this.handleInit();
      }
    });
    
    registry.init();
    
    this.initialized = true;
  }

  private handleInit() {
    // Start the registration process
    registry.begin(() => {
      // This callback runs when all components are registered
      this.handleInitComplete();
    });

    // Emit a single process_begin message for all components
    console.log('[initManager] Emitting single process_begin for all components');
    stateMachine.emit({
      type: 'process_begin',
      id: 'system',
      process: 'init'
    });
  }

  private handleInitComplete() {
    // Emit completion message
    stateMachine.emit({
      type: 'process_complete',
      id: 'init',
      process: 'init'
    });
    console.log('[initManager] Initialization complete');
  }
}

// Create singleton instance
export const initManager = new InitManager();

// Add initialization function
export const initInitManager = () => {
  return initManager;
};