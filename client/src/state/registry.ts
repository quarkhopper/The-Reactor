import stateMachine from './StateMachine';
import { getAllComponentIds } from './componentManifest';
import type { Command, AppState } from './types';

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

  private handleRegistryComplete() {
    this.isInitializing = false;
    
    // Transition to the next state via command pathway
    stateMachine.emit({
      type: 'state_change',
      id: 'system',
      state: 'test'
    });
  }

  private handleShutdownComplete() {
    this.isShuttingDown = false;
    
    // Transition to the next state via command pathway
    stateMachine.emit({
      type: 'process_complete',
      id: 'shutdown',
      process: 'shutdown'
    });
  }

  private reset() {
    this.pending = new Set(getAllComponentIds());
    this.isInitializing = false;
    this.isShuttingDown = false;
  }

  public acknowledge(componentId: string) {
    // Process acknowledgments during initialization or shutdown
    if (!this.isInitializing && !this.isShuttingDown) {
      return;
    }

    if (this.pending.has(componentId)) {
      this.pending.delete(componentId);

      if (this.pending.size === 0) {
        if (this.isInitializing) {
          this.handleRegistryComplete();
        } else if (this.isShuttingDown) {
          this.handleShutdownComplete();
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

