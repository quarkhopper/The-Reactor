import { getAllComponentIds } from './componentManifest';
import MessageBus from '../MessageBus';

const SHUTDOWN_FAIL_TIMEOUT = 10000; // 10 seconds

class ShutdownManager {
  private initialized: boolean = false;
  private acknowledgedComponents: Set<string> = new Set();
  private componentIds: string[] = [];

  constructor() {
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      return;
    }

    this.componentIds = getAllComponentIds();

    // Subscribe to MessageBus
    MessageBus.subscribe((msg: Record<string, any>) => {
      this.handleCommand(msg);
    });

    this.initialized = true;
  }

  private isShutdownManagerMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'acknowledge')
    );
  }

  private handleCommand(msg: Record<string, any>) {
    if (!this.isShutdownManagerMessage(msg)) {
      return;
    }

    if (msg.type === 'state_change' && msg.state === 'shutdown') {
      this.beginShutdown();
    }

    if (msg.type === 'acknowledge' && this.componentIds.includes(msg.id)) {
      this.acknowledgedComponents.add(msg.id);
    }

    if (
      this.acknowledgedComponents.size === this.componentIds.length
    ) {
      this.handleShutdownComplete();
    }
  }

  private beginShutdown() {
    // Reset tracking state
    this.acknowledgedComponents.clear();
    // Emit process_begin for all components
    MessageBus.emit({
      type: 'process_begin',
      id: 'system',
      process: 'shutdown',
    });

    console.log('[shutdownManager] Shutdown process started for all components');

    setTimeout(() => {
      if (this.acknowledgedComponents.size < this.componentIds.length) {
        console.error('[shutdownManager] Shutdown failed: timeout reached');
        console.log('[shutdownManager] shutdown components:', this.componentIds.filter(id => !this.acknowledgedComponents.has(id)));

        MessageBus.emit({
          type: 'process_fault',
          id: 'system',
          process: 'shutdown',
        });
      }
    }, SHUTDOWN_FAIL_TIMEOUT);
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