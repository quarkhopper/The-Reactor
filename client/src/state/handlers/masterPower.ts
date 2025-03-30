import stateMachine from '../StateMachine';
import initRegistry from '../initRegistry';
import testRegistry from '../testRegistry';

export function handleMasterPower() {
  const state = stateMachine.getAppState();

  if (state === 'off') {
    stateMachine.setAppState('init');
    stateMachine.log('System initializing');

    // INIT PHASE
    initRegistry.begin(() => {
      stateMachine.setAppState('startup');
      stateMachine.log('Init complete. Beginning startup test sequence.');

      // TEST PHASE
      const testEvent = new CustomEvent('ui-event', {
        detail: { type: 'test' }
      });
      window.dispatchEvent(testEvent);

      testRegistry.begin(() => {
        stateMachine.setAppState('on');
        stateMachine.log('Startup test complete. System is now ON.');
      });
    });

    const initEvent = new CustomEvent('ui-event', {
      detail: { type: 'init' }
    });
    window.dispatchEvent(initEvent);
  }

  // No manual advancement allowed during startup or shutdown
  else if (state === 'startup') {
    stateMachine.log('Startup in progress. Awaiting test completion.');
  }

  else if (state === 'on') {
    stateMachine.setAppState('shutdown');
    stateMachine.log('Shutdown initiated.');
  }

  else if (state === 'shutdown') {
    stateMachine.log('Shutdown in progress. Please wait.');
  }
}
