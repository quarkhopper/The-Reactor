import { useState, useEffect } from 'react';
import MessageBus from '../MessageBus';

import '../css/components/ScramButton.css';

import bezel from '../images/e-stop_bezel.png';
import buttonOut from '../images/e-stop_out.png';
import buttonIn from '../images/e-stop_in.png';

interface ScramButtonProps {
  id: string;
  x: number;
  y: number;
}

export default function ScramButton({ id, x, y }: ScramButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  const isValidMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'process_begin')
    );
  }

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return;

    if (msg.type === 'state_change') {
      if (msg.state === 'startup' || 
        msg.state === 'on' || 
        msg.state === 'off') {
        setPressed(false);
        setIsTestMode(false);
      } else if (msg.state === 'scram') {
        setPressed(true);
      }
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        setPressed(false);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setPressed(false);
        setIsTestMode(false);
      } else if (msg.process === 'test') {
        setIsTestMode(true);
        setPressed(true);

        setTimeout(() => {
          setPressed(false);
          setIsTestMode(false);

          MessageBus.emit({
            type: 'test_result',
            id,
            passed: true,
          });
        }, 500);
      }
    }
  }

  const handleStateChange = (state: string) => {
    if (state === 'startup' || state === 'on') {
      setIsTestMode(false);
      setPressed(false);
    } else if (state === 'scram') {
      setPressed(true);
    }
  };

  // Handle state changes for visual updates
  useEffect(() => {


    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'state_change' && msg.id === id) {
        handleStateChange(msg.state);
      }
    });

    return () => {
      subscription();
    };
  }, [id]);

  // Handle initialization and shutdown
  useEffect(() => {
    const handleCommand = (cmd: Record<string, any>) => {
      if (cmd.type === 'process_begin' && cmd.process === 'init') {
        setPressed(false);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        setPressed(false);
        setIsTestMode(false);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'process_begin' && msg.id === id) {
        handleCommand(msg);
      }
    });

    return () => {
      subscription();
    };
  }, [id]);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Record<string, any>) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'test') {
        setIsTestMode(true);
        setPressed(true);

        setTimeout(() => {
          setPressed(false);
          setIsTestMode(false);

          MessageBus.emit({
            type: 'test_result',
            id,
            passed: true,
          });
        }, 500);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'process_begin' && msg.id === id) {
        handleCommand(msg);
      }
    });

    return () => {
      subscription();
    };
  }, [id]);

  const handleClick = () => {
    if (!isTestMode) {
      MessageBus.emit({
        type: 'scram_button_press',
        id,
      });
    }
  };

  return (
    <div
      className="scram-button-wrapper"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={handleClick}
      tabIndex={-1}
    >
      <img src={bezel} className="scram-button-img" alt="Scram bezel" />
      <img
        src={pressed ? buttonIn : buttonOut}
        className="scram-button-overlay"
        alt={pressed ? 'Pressed in' : 'Raised'}
      />
    </div>
  );
}
