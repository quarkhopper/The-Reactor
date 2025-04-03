import stateMachine from './StateMachine';
import { registry } from './registry';
import type { Command, AppState } from './types';

class InitManager {
  constructor() {
    // Subscribe to state changes
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.state === 'init') {
        this.handleInit();
      }
    });
  }

  private handleInit() {
    // Start the registration process
    registry.begin(() => {
      // This callback runs when all components are registered
      this.handleInitComplete();
    });
  }

  private handleInitComplete() {
    // Emit completion message
    stateMachine.emit({
      type: 'process_complete',
      id: 'init',
      process: 'init_complete'
    });
  }
}

// Create and export singleton instance
export const initManager = new InitManager(); 