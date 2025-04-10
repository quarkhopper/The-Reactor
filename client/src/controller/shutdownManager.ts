import { getAllComponentIds } from './componentManifest';
import MessageBus from '../MessageBus';

class ShutdownManager {
  private initialized: boolean = false;
  private acknowledgedComponents: Set<string> = new Set();

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
      if (msg.type === 'acknowledge' && this.isShutdownComponent(msg.id)) {
        this.acknowledgedComponents.add(msg.id);

        // Check if all components have acknowledged
        if (this.acknowledgedComponents.size === this.getTotalComponents()) {
          this.handleShutdownComplete();
        }
      }
    });

    this.initialized = true;
  }

  private isShutdownComponent(componentId: string): boolean {
    return getAllComponentIds().includes(componentId);
  }

  private getTotalComponents(): number {
    return getAllComponentIds().length;
  }

  public beginShutdown() {
    // Reset tracking state
    this.acknowledgedComponents.clear();

    // Emit process_begin for all components
    MessageBus.emit({
      type: 'process_begin',
      id: 'system',
      process: 'shutdown',
    });

    console.log('[shutdownManager] Shutdown process started for all components');
  }

  private handleShutdownComplete() {
    // Emit process_complete message
    MessageBus.emit({
      type: 'process_complete',
      id: 'shutdown',
      process: 'shutdown',
    });
    console.log('[shutdownManager] Shutdown complete');
  }
}

// Create singleton instance
export const shutdownManager = new ShutdownManager();