import stateMachine from '../StateMachine';
import { getCurrentState } from '../powerState';
import { transitionToNextState } from '../stateTransitionManager';
import type { AppState } from '../types';

export function handleMasterPower() {
  const currentState = getCurrentState();

  switch (currentState) {
    case 'off':
      // Start the power-up sequence
      transitionToNextState('off');
      break;

    case 'on':
      // Start the shutdown sequence
      transitionToNextState('on');
      break;

    case 'startup':
    case 'shutdown':
    case 'init':
    case 'test':
      // Do nothing during transitions
      break;
  }
} 