import stateMachine from './StateMachine';
import type { Command } from './types';

class TestRegistry {
  private testResults: Map<string, boolean> = new Map();

  constructor() {
    // Subscribe to test results
    stateMachine.subscribe(this.handleCommand.bind(this));
  }

  private handleCommand(cmd: Command) {
    if (cmd.type === 'test_result') {
      const { id, passed } = cmd;
      this.testResults.set(id, passed);
      console.log(`[testRegistry] Test result for ${id}: ${passed ? 'PASS' : 'FAIL'}`);

      // Check if all tests have passed
      if (this.allTestsPassed()) {
        console.log('[testRegistry] All tests passed!');
        stateMachine.emit({
          type: 'state_change',
          id: 'test',
          state: 'startup'
        });
      }
    }
  }

  private allTestsPassed(): boolean {
    return Array.from(this.testResults.values()).every(result => result);
  }

  public reset() {
    this.testResults.clear();
    console.log('[testRegistry] Test results cleared');
  }

  public getResults(): Map<string, boolean> {
    return new Map(this.testResults);
  }
}

// Create singleton instance
export const testRegistry = new TestRegistry();
