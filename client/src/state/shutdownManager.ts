import stateMachine from './StateMachine';
import { registry } from './registry';
import { getAllComponentIds } from './componentManifest';
import type { Command } from './types';

class ShutdownManager {
  private initialized: boolean = false;
  private componentsShutdown: Set<string> = new Set();
  private totalComponents: number = 0;

  constructor() {
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      return;
    }
    
    // Subscribe to state changes and process_complete events
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.id === 'system' && cmd.state === 'shutdown') {
        this.handleShutdown();
      } else if (cmd.type === 'process_complete' && cmd.process === 'shutdown') {
        this.handleComponentShutdown(cmd.id);
      }
    });
    
    this.initialized = true;
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
    
    // Check if all components have completed shutdown
    if (this.componentsShutdown.size === this.totalComponents) {
      this.handleShutdownComplete();
    }
  }

  private handleShutdownComplete() {
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