import stateMachine from './StateMachine';
import { initRegistry } from './registry';
import { getAllComponentIds } from './componentManifest';
import type { Command, AppState } from './types';

class InitManager {
  private registry: ReturnType<typeof initRegistry>;

  constructor(registry: ReturnType<typeof initRegistry>) {
    console.log('[initManager] Constructor called');
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
    
    // Emit process_begin for each component
    const componentIds = getAllComponentIds();
    console.log(`[initManager] Emitting process_begin for ${componentIds.length} components`);
    
    componentIds.forEach(id => {
      stateMachine.emit({
        type: 'process_begin',
        id,
        process: 'init'
      });
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

// Create singleton instance
export const initManager = new InitManager(initRegistry());

// Add initialization function
export const initInitManager = () => {
  console.log('[initManager] Initializing init manager');
  return initManager;
}; 