import { getAllComponentIds } from './componentManifest';
import MessageBus from './MessageBus';

class TestManager {
  // Track which components have completed their test sequence
  private testedComponents: Set<string> = new Set();
  // Flag to prevent multiple transitions
  private transitionInProgress: boolean = false;
  // Flag to track initialization
  private initialized: boolean = false;

  constructor() {
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      return;
    }

    console.log('[testManager] Initializing');

    // Subscribe to MessageBus
    MessageBus.subscribe((msg: Record<string, any>) => {
      if (this.isTestManagerMessage(msg)) {
        this.handleMessage(msg);
      }
    });

    this.initialized = true;
  }

  private isTestManagerMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'test_result')
    );
  }

  private handleMessage(msg: Record<string, any>) {
    if (msg.type === 'state_change' && msg.state === 'test') {
      this.handleTest();
    } else if (msg.type === 'test_result') {
      this.handleTestResult(msg);
    }
  }

  private handleTest() {
    // Reset state
    this.resetTestSequence();

    // Emit process_begin for each component
    const componentIds = getAllComponentIds();
    console.log(`[testManager] Starting test sequence for ${componentIds.length} components`);

    componentIds.forEach(id => {
      MessageBus.emit({
        type: 'process_begin',
        id,
        process: 'test'
      });
    });

    // Add debug timeout to check for non-responding components
    setTimeout(() => {
      const missingComponents = componentIds.filter(id => !this.testedComponents.has(id));
      if (missingComponents.length > 0) {
        console.log('[testManager] After 10s, still waiting for test results from:', missingComponents);
        console.log(`[testManager] ${this.testedComponents.size}/${componentIds.length} components have responded`);
      }
    }, 10000);
  }

  private handleTestResult(msg: Record<string, any>) {
    const { id, passed } = msg;

    if (passed) {
      this.testedComponents.add(id);
    }

    // Check if all components have been tested
    const allComponentIds = getAllComponentIds();
    if (this.testedComponents.size >= allComponentIds.length && !this.transitionInProgress) {
      console.log(`[testManager] Test sequence complete: ${this.testedComponents.size}/${allComponentIds.length} components passed`);
      this.transitionInProgress = true;

      // Emit process completion
      MessageBus.emit({
        type: 'process_complete',
        id: 'test',
        process: 'test'
      });
    }
  }

  private resetTestSequence() {
    this.testedComponents.clear();
    this.transitionInProgress = false;
  }
}

// Create singleton instance
export const testManager = new TestManager();