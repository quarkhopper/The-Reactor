import stateMachine from './StateMachine';
import { registry } from './registry';
import { getAllComponentIds } from './componentManifest';
import type { Command } from './types';

class ShutdownManager {
  private initialized: boolean = false;

  constructor() {
    console.log('[shutdownManager] Constructor called');
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      console.log('[shutdownManager] Already initialized');
      return;
    }
    
    console.log('[shutdownManager] Initializing shutdown manager');
    
    // Subscribe to state changes
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.id === 'system' && cmd.state === 'shutdown') {
        this.handleShutdown();
      }
    });
    
    this.initialized = true;
    console.log('[shutdownManager] Initialization complete');
  }

  private handleShutdown() {
    // Start the registration process
    registry.begin(() => {
      // This callback runs when all components are registered
      this.handleShutdownComplete();
    });
    
    // Emit process_begin for each component
    const componentIds = getAllComponentIds();
    console.log(`[shutdownManager] Emitting process_begin for ${componentIds.length} components`);
    
    componentIds.forEach(id => {
      stateMachine.emit({
        type: 'process_begin',
        id,
        process: 'shutdown'
      });
    });
  }

  private handleShutdownComplete() {
    // Emit completion message
    stateMachine.emit({
      type: 'process_complete',
      id: 'shutdown',
      process: 'shutdown_complete'
    });
  }
}

// Create singleton instance
export const shutdownManager = new ShutdownManager(); 