import stateMachine from '../StateMachine';
import initRegistry from '../initRegistry';
import testRegistry from '../testRegistry';

export function handleMasterPower() {
  const state = stateMachine.getAppState();

  if (state === 'init' || state === 'startup' || state === 'shutdown') {
    console.log(`[masterPower] Ignored press during '${state}'`);
    return;
  }

  if (state === 'off') {
    stateMachine.setAppState('init');
    stateMachine.log('System initializing');

    initRegistry.begin(() => {
      stateMachine.setAppState('startup');
      stateMachine.log('Init complete. Beginning startup test sequence.');

      testRegistry.begin(() => {
        stateMachine.setAppState('on');
        stateMachine.log('Startup test complete. System is now ON.');
      });
    });

    const initEvent = new CustomEvent('ui-event', {
      detail: { type: 'init' },
    });
    window.dispatchEvent(initEvent);
  }

  else if (state === 'on') {
    stateMachine.setAppState('shutdown');
    stateMachine.log('Shutdown initiated.');
  
    // Simulate shutdown routine
    setTimeout(() => {
      stateMachine.setAppState('off');
      stateMachine.log('Shutdown complete. System is now off.');
    }, 2000); // (Adjust time later or replace with actual test if desired)
  }

  else if (state === 'shutdown') {
    stateMachine.setAppState('off');
    stateMachine.log('Shutdown complete. System is now off.');
  }
}
