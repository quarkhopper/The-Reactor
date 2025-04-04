import stateMachine from './StateMachine';
import { getAllComponentIds } from './componentManifest';
import type { Command } from './types';

class TestManager {
  // Track which components have completed their test sequence
  private testedComponents: Set<string> = new Set();
  // Flag to prevent multiple transitions
  private transitionInProgress: boolean = false;
  // Flag to track initialization
  private initialized: boolean = false;

  constructor() {
    console.log('[testManager] Constructor called');
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      console.log('[testManager] Already initialized');
      return;
    }
    
    console.log('[testManager] Initializing test manager');
    
    // Subscribe to state changes
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.state === 'test') {
        this.handleTest();
      }
    });
    
    this.initialized = true;
    console.log('[testManager] Initialization complete');
  }

  private handleTest() {
    // Reset state
    this.resetTestSequence();
    
    // Emit process_begin for each component
    const componentIds = getAllComponentIds();
    console.log(`[testManager] Emitting process_begin for ${componentIds.length} components`);
    
    componentIds.forEach(id => {
      stateMachine.emit({
        type: 'process_begin',
        id,
        process: 'test'
      });
    });
  }

  private handleTestResult(cmd: Command) {
    if (cmd.type === 'test_result') {
      const { id, passed } = cmd;
      
      if (passed) {
        this.testedComponents.add(id);
      }
      
      // Check if all components have been tested
      const allComponentIds = getAllComponentIds();
      if (this.testedComponents.size >= allComponentIds.length && !this.transitionInProgress) {
        console.log(`[testManager] All ${this.testedComponents.size} components tested.`);
        this.transitionInProgress = true;
        
        // Emit process completion
        stateMachine.emit({
          type: 'process_complete',
          id: 'test',
          process: 'test'
        });
      }
    }
  }

  private resetTestSequence() {
    this.testedComponents.clear();
    this.transitionInProgress = false;
  }

  // Public method to handle test results
  handleCommand(cmd: Command) {
    if (cmd.type === 'test_result') {
      this.handleTestResult(cmd);
    }
  }
}

// Create singleton instance
export const testManager = new TestManager(); 