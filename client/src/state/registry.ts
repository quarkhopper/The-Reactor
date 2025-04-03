import stateMachine from './StateMachine';
import { manifest } from './initManifest';
import type { Command, AppState } from './types';

class RegistryManager {
  private pending: Set<string> = new Set();
  private isInitializing: boolean = false;

  constructor() {
    // Subscribe to state changes
    stateMachine.subscribe(this.handleCommand.bind(this));
  }

  private handleCommand(cmd: Command) {
    if (cmd.type === 'state_change' && cmd.state === 'init') {
      this.reset();
      this.isInitializing = true;
      console.log('[registry] Starting initialization sequence');
    }
  }

  private handleRegistryComplete() {
    console.log('[registry] All components initialized');
    this.isInitializing = false;
    
    // Only emit startup state if we're not already in startup
    if (stateMachine.getAppState() !== 'startup') {
      stateMachine.emit({
        type: 'state_change',
        id: 'system',
        state: 'startup' as AppState
      });
    }
  }

  private reset() {
    this.pending = new Set(Object.keys(manifest));
    this.isInitializing = false;
    console.log(`[registry] Reset. Total components: ${this.pending.size}`);
    console.log('[registry] Pending components:', Array.from(this.pending));
  }

  public acknowledge(componentId: string) {
    // Only process acknowledgments during initialization
    if (!this.isInitializing) {
      return;
    }

    if (this.pending.has(componentId)) {
      this.pending.delete(componentId);
      console.log(`[registry] Component acknowledged: ${componentId}`);
      console.log(`[registry] Remaining components: ${this.pending.size}`);

      if (this.pending.size === 0) {
        this.handleRegistryComplete();
      }
    }
  }

  public begin(callback: () => void) {
    console.log('[registry] Starting initialization sequence');
    this.reset();
    this.isInitializing = true;

    const interval = setInterval(() => {
      if (this.pending.size === 0) {
        clearInterval(interval);
        console.log('[registry] All components ready, invoking callback');
        callback();
      } else {
        console.log(`[registry] Still waiting for ${this.pending.size} components:`, Array.from(this.pending));
      }
    }, 100);
  }
}

// Create singleton instance
export const registry = new RegistryManager(); 