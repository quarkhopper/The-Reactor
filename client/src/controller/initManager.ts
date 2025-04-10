import { getAllComponentIds } from './componentManifest';
import MessageBus from '../MessageBus';

class InitManager {
  private initialized: boolean = false;
  private acknowledgedComponents: Set<string> = new Set();

  constructor() {
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      return;
    }

    console.log('[initManager] Initializing');

    // Emit process_begin for all components
    const componentIds = getAllComponentIds();
    MessageBus.emit({
      type: 'process_begin',
      id: 'system',
      process: 'init',
    });

    // Subscribe to MessageBus for acknowledgments
    MessageBus.subscribe((msg: Record<string, any>) => {
      if (msg.type === 'acknowledge' && componentIds.includes(msg.id)) {
        this.acknowledgedComponents.add(msg.id);

        // Check if all components have acknowledged
        if (this.acknowledgedComponents.size === componentIds.length) {
          this.handleInitComplete();
        }
      }
    });

    this.initialized = true;
  }

  private handleInitComplete() {
    // Emit process_complete message
    MessageBus.emit({
      type: 'process_complete',
      id: 'init',
      process: 'init',
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