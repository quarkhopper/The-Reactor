import { registry } from './registry';
import MessageBus from './MessageBus';

class InitManager {
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
      if (this.isInitManagerMessage(msg)) {
        this.handleMessage(msg);
      }
    });

    console.log('[initManager] Initializing');

    registry.init();

    this.initialized = true;
  }

  private isInitManagerMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'process_begin' || msg.type === 'process_complete')
    );
  }

  private handleMessage(msg: Record<string, any>) {
    if (msg.type === 'state_change' && msg.state === 'init') {
      this.handleInit();
    }
  }

  private handleInit() {
    // Start the registration process
    registry.begin(() => {
      // This callback runs when all components are registered
      this.handleInitComplete();
    });

    // Emit a single process_begin message for all components
    console.log('[initManager] Emitting single process_begin for all components');
    MessageBus.emit({
      type: 'process_begin',
      id: 'system',
      process: 'init'
    });
  }

  private handleInitComplete() {
    // Emit completion message
    MessageBus.emit({
      type: 'process_complete',
      id: 'init',
      process: 'init'
    });
    console.log('[initManager] Initialization complete');
  }
}

// Create singleton instance
export const initManager = new InitManager();

// Add initialization function
export const initInitManager = () => {
  return initManager;
};