import { useState, useEffect } from 'react';
import MessageBus from '../MessageBus';
import '../css/components/ScramButton.css';
import bezel from '../images/e-stop_bezel.png';
import buttonOut from '../images/e-stop_out.png';
import buttonIn from '../images/e-stop_in.png';

interface ScramButtonProps {
  x: number;
  y: number;
}

export default function ScramButton({ x, y }: ScramButtonProps) {
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
          id: 'scram',
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setPressed(false);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id: 'scram',
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
        setIsTestMode(true);
        setPressed(true);

        setTimeout(() => {
          setPressed(false);
          setIsTestMode(false);

          MessageBus.emit({
            type: 'test_result',
            id: 'scram',
            passed: true,
          });
        }, 500);
      }
    }
  }

  const handleClick = () => {
    if (!isTestMode) {
      MessageBus.emit({
        type: 'emergency_scram',
        id: 'scram',
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
