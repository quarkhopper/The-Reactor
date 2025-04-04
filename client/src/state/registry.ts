import stateMachine from './StateMachine';
import { getAllComponentIds } from './componentManifest';
import type { Command, AppState } from './types';

class RegistryManager {
  private pending: Set<string> = new Set();
  private isInitializing: boolean = false;
  private initialized: boolean = false;

  constructor() {
    console.log('[registry] Constructor called');
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      console.log('[registry] Already initialized');
      return;
    }
    
    console.log('[registry] Initializing registry');
    
    // Subscribe to state changes
    stateMachine.subscribe(this.handleCommand.bind(this));
    
    this.initialized = true;
    console.log('[registry] Initialization complete');
  }

  private handleCommand(cmd: Command) {
    if (cmd.type === 'state_change' && cmd.state === 'init') {
      this.reset();
      this.isInitializing = true;
    }
  }

  private handleRegistryComplete() {
    this.isInitializing = false;
    console.log('[registry] All components initialized');
    
    // Transition to the next state via command pathway
    stateMachine.emit({
      type: 'state_change',
      id: 'system',
      state: 'test'
    });
  }

  private reset() {
    this.pending = new Set(getAllComponentIds());
    this.isInitializing = false;
  }

  public acknowledge(componentId: string) {
    // Only process acknowledgments during initialization
    if (!this.isInitializing) {
      return;
    }

    if (this.pending.has(componentId)) {
      this.pending.delete(componentId);

      if (this.pending.size === 0) {
        this.handleRegistryComplete();
      }
    }
  }

  public begin(callback: () => void) {
    this.reset();
    this.isInitializing = true;

    const interval = setInterval(() => {
      if (this.pending.size === 0) {
        clearInterval(interval);
        console.log('[registry] All components ready, invoking callback');
        callback();
      }
    }, 100);
  }
}

// Create singleton instance
export const registry = new RegistryManager();

// Initialize the registry
registry.init(); 