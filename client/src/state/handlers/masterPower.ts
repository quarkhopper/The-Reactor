import stateMachine from '../StateMachine';
import { getCurrentState } from '../powerState';

export function handleMasterPower() {
  const currentState = getCurrentState();

  switch (currentState) {
    case 'off':
      // Start the power-up sequence
      stateMachine.setAppState('startup');
      setTimeout(() => {
        stateMachine.setAppState('on');
      }, 2000);
      break;

    case 'on':
      // Start the shutdown sequence
      stateMachine.setAppState('shutdown');
      setTimeout(() => {
        stateMachine.setAppState('off');
      }, 2000);
      break;

    case 'startup':
    case 'shutdown':
      // Do nothing during transitions
      break;
  }
} 