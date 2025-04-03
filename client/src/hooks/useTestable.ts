import { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

export const useTestable = (id: string) => {
    const [isTestMode, setIsTestMode] = useState(false);
    const [displayColor, setDisplayColor] = useState('off');

    useEffect(() => {
        const handleCommand = (cmd: Command) => {
            if (cmd.type === 'test_sequence' && cmd.id === id) {
                console.log(`[useTestable] ${id} starting test sequence`);
                setIsTestMode(true);
                const colors = ['off', 'green', 'amber', 'red', 'white', 'off'];
                let i = 0;
                const interval = setInterval(() => {
                    setDisplayColor(colors[i]);
                    i++;
                    if (i >= colors.length) {
                        clearInterval(interval);
                        setIsTestMode(false);
                    }
                }, 100);
            }

            if (cmd.type === 'state_change') {
                if (cmd.state === 'init') {
                    setDisplayColor('off');
                    // Acknowledge this component when initialization is requested
                    registry.acknowledge(id);
                }
            }
        };

        const unsubscribe = stateMachine.subscribe(handleCommand);
        return () => unsubscribe();
    }, [id]);

    return { isTestMode, displayColor, setDisplayColor };
}; 