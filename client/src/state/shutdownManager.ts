import stateMachine from './StateMachine';
import { registry } from './registry';
import { getAllComponentIds } from './componentManifest';
import type { Command } from './types';

class ShutdownManager {
  private initialized: boolean = false;
  private componentsShutdown: Set<string> = new Set();
  private totalComponents: number = 0;

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
    
    // Subscribe to state changes and process_complete events
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.id === 'system' && cmd.state === 'shutdown') {
        this.handleShutdown();
      } else if (cmd.type === 'process_complete' && cmd.process === 'component_shutdown') {
        this.handleComponentShutdown(cmd.id);
      }
    });
    
    this.initialized = true;
    console.log('[shutdownManager] Initialization complete');
  }

  private handleShutdown() {
    // Reset tracking state
    this.componentsShutdown.clear();
    
    // Start the shutdown process
    registry.beginShutdown(() => {
      // This callback runs when all components are shut down
      this.handleShutdownComplete();
    });
    
    // Get component IDs and store total count
    const componentIds = getAllComponentIds();
    this.totalComponents = componentIds.length;
    
    // Emit process_begin for each component
    console.log(`[shutdownManager] Emitting process_begin for ${componentIds.length} components`);
    componentIds.forEach(id => {
      stateMachine.emit({
        type: 'process_begin',
        id,
        process: 'shutdown'
      });
    });
  }

  private handleComponentShutdown(componentId: string) {
    // Track component shutdown
    this.componentsShutdown.add(componentId);
    console.log(`[shutdownManager] Component ${componentId} shut down (${this.componentsShutdown.size}/${this.totalComponents})`);
  }

  private handleShutdownComplete() {
    console.log('[shutdownManager] All components shut down');
    
    // Emit completion message
    stateMachine.emit({
      type: 'process_complete',
      id: 'shutdown',
      process: 'shutdown'
    });
  }
}

// Create singleton instance
export const shutdownManager = new ShutdownManager(); 