import { useState, useEffect, useCallback } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

export const useTestable = (id: string) => {
    const [isTestMode, setIsTestMode] = useState(false);
    const [displayColor, setDisplayColor] = useState('off');

    // Handle state changes
    const handleStateChange = useCallback((state: AppState) => {
        if (state === 'init') {
            setDisplayColor('off');
            // Acknowledge this component when initialization is requested
            registry.acknowledge(id);
        } else if (state === 'startup' || state === 'on') {
            // Ensure components are reset when entering startup or on state
            setIsTestMode(false);
            setDisplayColor('off');
        }
    }, [id]);

    useEffect(() => {
        const handleCommand = (cmd: Command) => {
            if (cmd.type === 'test_sequence' && cmd.id === id) {
                setIsTestMode(true);
                const colors = ['off', 'green', 'amber', 'red', 'white', 'off'];
                let i = 0;
                const interval = setInterval(() => {
                    setDisplayColor(colors[i]);
                    i++;
                    if (i >= colors.length) {
                        clearInterval(interval);
                        setIsTestMode(false);
                        setDisplayColor('off');
                        stateMachine.emit({
                            type: 'test_result',
                            id,
                            passed: true
                        });
                    }
                }, 200); // Slower interval for better visibility
            }

            if (cmd.type === 'state_change') {
                handleStateChange(cmd.state);
            }
            
            // Reset when test sequence completes
            if (cmd.type === 'test_result' && cmd.id === id) {
                // Small delay to ensure the last color is visible before resetting
                setTimeout(() => {
                    setIsTestMode(false);
                    setDisplayColor('off');
                }, 300); // Increased delay to ensure reset happens
            }
        };

        const unsubscribe = stateMachine.subscribe(handleCommand);
        return () => unsubscribe();
    }, [id, handleStateChange]);

    return { isTestMode, displayColor, setDisplayColor };
}; 