import { useEffect, useState } from 'react';
import stateMachine from './StateMachine';
import { AppState, Command } from './types';

export function useAppState(): AppState {
  const [state, setState] = useState<AppState>('off');

  useEffect(() => {
    const callback = (cmd: Command) => {
      if (cmd.type === 'state_change') {
        setState(cmd.state);
      }
    };

    stateMachine.subscribe(callback);

    return () => {
      stateMachine.unsubscribe(callback);
    };
  }, []);

  return state;
}
