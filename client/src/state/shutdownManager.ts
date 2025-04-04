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
      } else if (cmd.type === 'process_complete' && cmd.process === 'shutdown') {
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
      console.log('[shutdownManager] Registry shutdown callback received');
      this.handleShutdownComplete();
    });
    
    // Get component IDs and store total count
    const componentIds = getAllComponentIds();
    this.totalComponents = componentIds.length;
    
    // Emit process_begin for each component
    console.log(`[shutdownManager] Starting shutdown process for ${componentIds.length} components`);
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
    
    // Only log progress at 25%, 50%, 75%, and 100%
    const progress = this.componentsShutdown.size / this.totalComponents;
    if (progress === 0.25 || progress === 0.5 || progress === 0.75 || progress === 1) {
      console.log(`[shutdownManager] Shutdown progress: ${Math.round(progress * 100)}% (${this.componentsShutdown.size}/${this.totalComponents})`);
    }
    
    // Check if all components have completed shutdown
    if (this.componentsShutdown.size === this.totalComponents) {
      console.log('[shutdownManager] All components have completed shutdown');
      this.handleShutdownComplete();
    }
  }

  private handleShutdownComplete() {
    console.log('[shutdownManager] Emitting shutdown completion');
    
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