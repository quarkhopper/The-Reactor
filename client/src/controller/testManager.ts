import { getAllComponentIds } from './componentManifest';
import MessageBus from '../MessageBus';

const TEST_FAIL_TIMEOUT = 10000; // 10 seconds

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
      (msg.type === 'test_result' || msg.type === 'state_change')
    );
  }

  private handleCommand(msg: Record<string, any>) {
    if (!this.isTestManagerMessage(msg)) {
      return;
    }

    if( msg.type === 'state_change' && msg.state === 'test' ) {
      this.beginTest();
    } 
    else if (msg.type === 'test_result' && this.componentIds.includes(msg.id)) {
      if (msg.passed === true) {
        this.testedComponents.add(msg.id);
        if (this.testedComponents.size === this.componentIds.length) {
          // Emit process_complete message
          this.handleTestComplete();
        }
      } else {
        // Handle test failure case
        console.error(`[TestManager] Test failed for component: ${msg.id}`);
        this.handleTestFailure();
      }
    } 
  }

  beginTest() {
    this.testedComponents.clear(); // Reset tested components
    MessageBus.emit({
      type: 'process_begin',
      id: 'system',
      process: 'test',
    });
    console.log('[TestManager] testing components');

    setTimeout(() => {
      if (this.testedComponents.size < this.componentIds.length) {
        console.error('[TestManager] Testing failed: timeout reached');
        console.log('[TestManager] untested components:', this.componentIds.filter(id => !this.testedComponents.has(id)));

        MessageBus.emit({
          type: 'process_fault',
          id: 'system',
          process: 'test',
        });
      }
    }, TEST_FAIL_TIMEOUT);

  }

  handleTestFailure() {
    // Emit process_fault message with failure status
    MessageBus.emit({
      type: 'process_fault',
      id: 'system',
      process: 'test',
    });
    console.log('[TestManager] Test process failed for some components');
  }

  handleTestComplete() {
    // Emit process_complete message
    MessageBus.emit({
      type: 'process_complete',
      id: 'system',
      process: 'test',
    });
    console.log('[TestManager] Test process complete for all components');
  }
}

// Create singleton instance
export const testManager = new TestManager();
