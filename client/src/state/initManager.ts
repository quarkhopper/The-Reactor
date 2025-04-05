import stateMachine from './StateMachine';
import { registry } from './registry';
import { getAllComponentIds } from './componentManifest';
import type { Command, AppState } from './types';

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
    
    // Emit process_begin for each component
    const componentIds = getAllComponentIds();
    console.log(`[initManager] Starting initialization for ${componentIds.length} components`);
    
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
      process: 'init'
    });
  }
}

// Create singleton instance
export const initManager = new InitManager();

// Add initialization function
export const initInitManager = () => {
  return initManager;
}; 