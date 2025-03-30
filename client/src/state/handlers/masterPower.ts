import stateMachine from '../StateMachine';
import initRegistry from '../initRegistry';
import testRegistry from '../testRegistry';

export function handleMasterPower() {
  const state = stateMachine.getAppState();

  if (state === 'off') {
    stateMachine.setAppState('init');
    stateMachine.log('System initializing');

    // Begin init phase
    initRegistry.begin(() => {
      stateMachine.setAppState('startup');
      stateMachine.log('Init complete. Beginning startup test sequence.');

      // Begin test registry phase
      testRegistry.begin(() => {
        stateMachine.setAppState('on');
        stateMachine.log('Startup test complete. System is now ON.');
      });

      // Dispatch AFTER testRegistry is ready and all components have mounted
      const testEvent = new CustomEvent('ui-event', {
        detail: { type: 'test' },
      });
      window.dispatchEvent(testEvent);
    });

    // Dispatch init event
    const initEvent = new CustomEvent('ui-event', {
      detail: { type: 'init' },
    });
    window.dispatchEvent(initEvent);
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
