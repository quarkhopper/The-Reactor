/**
 * Central state transition manager.
 * This is the single source of truth for state transitions.
 */

import stateMachine from './StateMachine';
import { resetTestSequence } from './handlers/testSequence';
import { getAllComponentIds } from './componentManifest';
import type { AppState } from './types';

// Define the state transition map
const STATE_TRANSITIONS: Record<AppState, AppState | null> = {
  'off': 'init',
  'init': 'test',
  'test': 'startup',
  'startup': 'on',
  'on': 'shutdown',
  'shutdown': 'off'
};

// Define the state transition delays (in milliseconds)
const STATE_TRANSITION_DELAYS: Record<AppState, number> = {
  'off': 0,
  'init': 0,
  'test': 0,
  'startup': 2000,
  'on': 0,
  'shutdown': 2000
};

// Define the state transition handlers
const STATE_TRANSITION_HANDLERS: Record<AppState, () => void> = {
  'off': () => {
    console.log('[stateTransitionManager] Entering off state');
  },
  'init': () => {
    console.log('[stateTransitionManager] Entering init state');
  },
  'test': () => {
    console.log('[stateTransitionManager] Entering test state');
    resetTestSequence();
    
    // Trigger test sequence for all components
    const componentIds = getAllComponentIds();
    
    // Trigger test sequence for all components in parallel
    componentIds.forEach((id: string) => {
      stateMachine.emit({
        type: 'test_sequence',
        id
      });
    });
  },
  'startup': () => {
    console.log('[stateTransitionManager] Entering startup state');
  },
  'on': () => {
    console.log('[stateTransitionManager] Entering on state');
  },
  'shutdown': () => {
    console.log('[stateTransitionManager] Entering shutdown state');
  }
};

/**
 * Transition to the next state in the sequence
 */
export function transitionToNextState(currentState: AppState): void {
  const nextState = STATE_TRANSITIONS[currentState];
  
  if (nextState) {
    console.log(`[stateTransitionManager] Transitioning from ${currentState} to ${nextState}`);
    
    // Execute the state transition handler
    const handler = STATE_TRANSITION_HANDLERS[nextState];
    if (handler) {
      handler();
    }
    
    // Set the new state after the delay
    const delay = STATE_TRANSITION_DELAYS[nextState];
    setTimeout(() => {
      stateMachine.setAppState(nextState);
    }, delay);
  } else {
    console.log(`[stateTransitionManager] No next state for ${currentState}`);
  }
}

/**
 * Get the next state in the sequence
 */
export function getNextState(currentState: AppState): AppState | null {
  return STATE_TRANSITIONS[currentState] || null;
}

/**
 * Get the delay for a state transition
 */
export function getStateTransitionDelay(state: AppState): number {
  return STATE_TRANSITION_DELAYS[state] || 0;
}

/**
 * Check if a state transition is valid
 */
export function isValidTransition(fromState: AppState, toState: AppState): boolean {
  return STATE_TRANSITIONS[fromState] === toState;
} 