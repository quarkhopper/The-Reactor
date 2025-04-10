import { getAllComponentIds } from './componentManifest';
import MessageBus from '../MessageBus';

class InitManager {
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

    // Subscribe to MessageBus for acknowledgments
    MessageBus.subscribe((msg: Record<string, any>) => {
      this.handleCommand(msg);
    });

    this.initialized = true;
  }

  // Added a guard function to validate if a message is relevant to the StateMachine
  private isInitManagerMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'acknowledge' ||
       msg.type === 'state_change')
    );
  }

  private handleCommand(msg: Record<string, any>) {
    if (!this.isInitManagerMessage(msg)) {
      return;
    }

    if( msg.type === 'state_change' && msg.state === 'init' ) {
      this.acknowledgedComponents.clear(); // Reset acknowledged components
      MessageBus.emit({
        type: 'process_begin',
        id: 'system',
        process: 'init',
      });
      console.log('[initManager] Initializing');
    }  

    if (msg.type === 'acknowledge' && this.componentIds.includes(msg.id)) {
      this.acknowledgedComponents.add(msg.id);
    }

    if (this.acknowledgedComponents.size === this.componentIds.length) {
      // Emit process_complete message
      MessageBus.emit({
        type: 'process_complete',
        id: 'system',
        process: 'init',
      });
      console.log('[initManager] Initialization complete');
    }
  }
}

// Create singleton instance
export const initManager = new InitManager();
