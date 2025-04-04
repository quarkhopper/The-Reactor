import stateMachine from './StateMachine';
import { initRegistry } from './registry';
import type { Command, AppState } from './types';
import { initStateTransitionManager } from './stateTransitionManager';

class InitManager {
  private registry: ReturnType<typeof initRegistry>;

  constructor(registry: ReturnType<typeof initRegistry>) {
    this.registry = registry;
    // Subscribe to state changes
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.state === 'init') {
        this.handleInit();
      }
    });
  }

  private handleInit() {
    // Start the registration process
    this.registry.begin(() => {
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

// Add initialization function
export const initInitManager = () => {
  console.log('[initManager] Initializing init manager');
  initStateTransitionManager();
  const registry = initRegistry();
  return new InitManager(registry);
}; 