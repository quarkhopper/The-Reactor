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
  'shutdown': 'off',
  'scram': null  // Terminal state for now
};

// Define the state transition delays (in milliseconds)
const STATE_TRANSITION_DELAYS: Record<AppState, number> = {
  'off': 0,
  'init': 0,
  'test': 0,
  'startup': 2000,
  'on': 0,
  'shutdown': 2000,
  'scram': 0
};

// Define the state transition handlers
const STATE_TRANSITION_HANDLERS: Record<AppState, () => void> = {
  'off': () => {
    // No logging needed
  },
  'init': () => {
    // No logging needed
  },
  'test': () => {
    resetTestSequence();
    
    // Trigger test sequence for all components
    const componentIds = getAllComponentIds();
    console.log(`[stateTransitionManager] Triggering test sequence for ${componentIds.length} components`);
    
    // Trigger test sequence for all components in parallel
    componentIds.forEach((id: string) => {
      stateMachine.emit({
        type: 'test_sequence',
        id
      });
    });
  },
  'startup': () => {
    console.log('[stateTransitionManager] Starting up...');
    // Schedule the transition to 'on' state
    setTimeout(() => {
      console.log('[stateTransitionManager] Startup complete, transitioning to on state');
      stateMachine.setAppState('on');
    }, STATE_TRANSITION_DELAYS['startup']);
  },
  'on': () => {
    console.log('[stateTransitionManager] Reactor online');
  },
  'shutdown': () => {
    console.log('[stateTransitionManager] Shutting down...');
  },
  'scram': () => {
    console.log('[stateTransitionManager] SCRAM initiated');
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
    
    // Set the new state immediately (the handler will handle any delays)
    stateMachine.setAppState(nextState);
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
  // Allow transition from 'on' to 'scram'
  if (fromState === 'on' && toState === 'scram') {
    return true;
  }
  return STATE_TRANSITIONS[fromState] === toState;
} 