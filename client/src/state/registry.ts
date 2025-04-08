import stateMachine from './StateMachine';
import { getAllComponentIds } from './componentManifest';
import type { Command } from './types';

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
    
    // Subscribe to state changes
    stateMachine.subscribe(this.handleCommand.bind(this));
    
    this.initialized = true;
  }

  private handleCommand(cmd: Command) {
    if (cmd.type === 'state_change') {
      if (cmd.state === 'init') {
        this.reset();
        this.isInitializing = true;
      } else if (cmd.state === 'shutdown') {
        this.reset();
        this.isShuttingDown = true;
      }
    }
  }

  private handleRegistryComplete(callback: () => void) {
    this.isInitializing = false;
    callback(); // Notify initManager that initialization is complete
  }

  private handleShutdownComplete(callback: () => void) {
    this.isShuttingDown = false;
    callback(); // Notify initManager that shutdown is complete
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
}

// Create singleton instance
export const registry = new RegistryManager();

