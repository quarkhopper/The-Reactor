import { getAllComponentIds } from '../componentManifest';
import MessageBus from '../../MessageBus';

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

  private isValidMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      ((msg.type === 'state_change' && msg.state === 'shutdown') || 
        (msg.type === 'acknowledge' && msg.process === 'shutdown'))
    );
  }

  private handleCommand(msg: Record<string, any>) {
    if (!this.isValidMessage(msg)) {
      return;
    }

    if (msg.type === 'state_change') {
      this.beginShutdown();
    } else if (msg.type === 'acknowledge' && this.componentIds.includes(msg.id)) {
      this.acknowledgedComponents.add(msg.id);

        if (this.acknowledgedComponents.size === this.componentIds.length) {
          this.handleShutdownComplete();
        }
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

    console.log('[ShutdownManager] Shutdown process started for all components');

    setTimeout(() => {
      if (this.acknowledgedComponents.size < this.componentIds.length) {
        console.error('[ShutdownManager] Shutdown failed: timeout reached');
        console.log('[ShutdownManager] Shutdown not acknoledged for components:', this.componentIds.filter(id => !this.acknowledgedComponents.has(id)));

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
      id: 'system',
      process: 'shutdown',
    });

    console.log('[ShutdownManager] Shutdown complete');
  }
}

// Create singleton instance
export const shutdownManager = new ShutdownManager();