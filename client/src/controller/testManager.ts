import { getAllComponentIds } from './componentManifest';
import MessageBus from '../MessageBus';

class TestManager {
  private initialized: boolean = false;
  private testedComponents: Set<string> = new Set();
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
  private isTestManagerMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'test_result' ||
       msg.type === 'state_change')
    );
  }

  private handleCommand(msg: Record<string, any>) {
    if (!this.isTestManagerMessage(msg)) {
      return;
    }

    if( msg.type === 'state_change' && msg.state === 'test' ) {
      this.testedComponents.clear(); // Reset tested components
      MessageBus.emit({
        type: 'process_begin',
        id: 'system',
        process: 'test',
      });
      console.log('[initManager] testing components');
    }  

    if (msg.type === 'test_result' && 
      this.componentIds.includes(msg.id) &&
      msg.passed === true) {

      this.testedComponents.add(msg.id);
    }

    if (this.testedComponents.size === this.componentIds.length) {
      // Emit process_complete message
      MessageBus.emit({
        type: 'process_complete',
        id: 'system',
        process: 'test',
      });
      console.log('[initManager] test complete');
    }
  }
}

// Create singleton instance
export const testManager = new TestManager();
