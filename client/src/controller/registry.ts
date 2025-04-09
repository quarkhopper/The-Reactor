import { getAllComponentIds } from './componentManifest';
import MessageBus from './MessageBus';

class RegistryManager {
  private pending: Set<string> = new Set();
  private isInitializing: boolean = false;
  private isShuttingDown: boolean = false;
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
      if (this.isRegistryMessage(msg)) {
        this.handleMessage(msg);
      }
    });

    this.initialized = true;
  }

  private isRegistryMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      msg.type === 'state_change'
    );
  }

  private handleMessage(msg: Record<string, any>) {
    if (msg.type === 'state_change') {
      if (msg.state === 'init') {
        this.reset();
        this.isInitializing = true;
      } else if (msg.state === 'shutdown') {
        this.reset();
        this.isShuttingDown = true;
      }
    }
  }

  private reset() {
    this.pending = new Set(getAllComponentIds());
    this.isInitializing = false;
    this.isShuttingDown = false;
  }

  public acknowledge(componentId: string, callback: () => void) {
    // Process acknowledgments during initialization or shutdown
    if (!this.isInitializing && !this.isShuttingDown) {
      return;
    }

    if (this.pending.has(componentId)) {
      this.pending.delete(componentId);

      if (this.pending.size === 0) {
        if (this.isInitializing) {
          this.handleRegistryComplete(callback);
        } else if (this.isShuttingDown) {
          this.handleShutdownComplete(callback);
        }
      }
    }
  }

  public begin(callback: () => void) {
    this.reset();
    this.isInitializing = true;

    const interval = setInterval(() => {
      if (this.pending.size === 0) {
        clearInterval(interval);
        callback();
      }
    }, 100);

    // Log components that have not acknowledged after 10 seconds
    setTimeout(() => {
      if (this.pending.size > 0) {
        console.warn('[RegistryManager] Components that have not acknowledged:', Array.from(this.pending));
      }
    }, 10000);
  }

  public beginShutdown(callback: () => void) {
    this.reset();
    this.isShuttingDown = true;

    const interval = setInterval(() => {
      if (this.pending.size === 0) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }

  private handleRegistryComplete(callback: () => void) {
    this.isInitializing = false;
    callback(); // Notify initManager that initialization is complete
  }

  private handleShutdownComplete(callback: () => void) {
    this.isShuttingDown = false;
    callback(); // Notify initManager that shutdown is complete
  }
}

// Create singleton instance
export const registry = new RegistryManager();

