import stateMachine from '../StateMachine';
import initRegistry from '../initRegistry';

export function handleMasterPower() {
  const state = stateMachine.getAppState();

  if (state === 'off') {
    stateMachine.setAppState('init');
    stateMachine.log('System initializing');

    // Send out init event to all components
    const event = new CustomEvent('ui-event', {
      detail: { type: 'init' }
    });
    window.dispatchEvent(event);

    // Check completion
    initRegistry.begin(() => {
      stateMachine.setAppState('startup');
      stateMachine.log('Init complete. Moving to startup.');
    });
  }
}
