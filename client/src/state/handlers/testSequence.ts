import stateMachine from '../StateMachine';
import { getCurrentState } from '../powerState';
import { transitionToNextState } from '../stateTransitionManager';
import type { Command } from '../types';
import { getAllComponentIds } from '../componentManifest';

// Track which components have completed their test sequence
const testedComponents = new Set<string>();

export function handleTestSequence(cmd: Command) {
  if (cmd.type === 'test_result') {
    const { id, passed } = cmd;
    
    if (passed) {
      testedComponents.add(id);
    }
    
    // Check if all components have been tested
    const allComponentIds = getAllComponentIds();
    if (testedComponents.size >= allComponentIds.length) {
      console.log(`[testSequence] All ${testedComponents.size} components tested. Transitioning to startup state.`);
      // Use the state transition manager to transition to the next state
      transitionToNextState('test');
    } else {
      // Only log every 10 components to reduce noise
      if (testedComponents.size % 10 === 0) {
        console.log(`[testSequence] ${testedComponents.size}/${allComponentIds.length} components tested.`);
        
        // Log which components are missing
        if (testedComponents.size === 20) {
          const missingComponents = allComponentIds.filter(id => !testedComponents.has(id));
          console.log(`[testSequence] Missing components (first 10): ${missingComponents.slice(0, 10).join(', ')}`);
        }
      }
    }
  }
}

// Reset the test sequence when entering test state
export function resetTestSequence() {
  testedComponents.clear();
} 