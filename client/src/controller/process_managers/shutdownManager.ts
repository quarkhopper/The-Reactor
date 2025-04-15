import MessageBus from '../../MessageBus';

const SHUTDOWN_FAIL_TIMEOUT = 10000; // 10 seconds

class ShutdownManager {
  private initialized: boolean = false;

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
      console.log (`[ShutdownManager] Received state change command - state: ${msg.state}`);
      this.beginShutdown();
    }
  }

  private beginShutdown() {
    MessageBus.emit({
      type: 'process_begin',
      id: 'system',
      process: 'shutdown',
    });

    this.handleShutdownComplete();
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