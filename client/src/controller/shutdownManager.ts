import { registry } from './registry';
import { getAllComponentIds } from './componentManifest';
import MessageBus from '../MessageBus';

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

    // Subscribe to MessageBus
    MessageBus.subscribe((msg: Record<string, any>) => {
      if (this.isShutdownManagerMessage(msg)) {
        this.handleMessage(msg);
      }
    });

    this.initialized = true;
  }

  private isShutdownManagerMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'process_complete')
    );
  }

  private handleMessage(msg: Record<string, any>) {
    if (msg.type === 'state_change' && msg.id === 'system' && msg.state === 'shutdown') {
      this.handleShutdown();
    } else if (msg.type === 'process_complete' && msg.process === 'shutdown') {
      this.handleComponentShutdown(msg.id);
    }
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
      MessageBus.emit({
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
    MessageBus.emit({
      type: 'process_complete',
      id: 'shutdown',
      process: 'shutdown'
    });
  }
}

// Create singleton instance
export const shutdownManager = new ShutdownManager();