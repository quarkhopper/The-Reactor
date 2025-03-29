import stateMachine from '../StateMachine';
import initRegistry from '../initRegistry';

export function handleMasterPower() {
  const state = stateMachine.getAppState();

  if (state === 'off') {
    stateMachine.setAppState('init');
    stateMachine.log('System initializing');

    // Check completion
    initRegistry.begin(() => {
      stateMachine.setAppState('startup');
      stateMachine.log('Init complete. Moving to startup.');
    });
    
    // Send out init event to all components
    const event = new CustomEvent('ui-event', {
      detail: { type: 'init' }
    });
    window.dispatchEvent(event);
  }
  else if (state === 'startup') {
    stateMachine.setAppState('on');
    stateMachine.log('Startup complete. System is now on.');
  }
  else if (state === 'on') {
    stateMachine.setAppState('shutdown');
    stateMachine.log('Shutdown initiated.');
  }
  else if (state === 'shutdown') {
    stateMachine.setAppState('off');
    stateMachine.log('Shutdown complete. System is now off.');
  }
}
