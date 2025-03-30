import React, { useEffect, useState } from 'react';
import '../css/components/MasterButton.css';
import bezel from '../images/master_button_bezel.png';
import glowOff from '../images/master_button_off.png';
import glowOn from '../images/master_button_on.png';
import eventBus, { ReactorEvent } from '../state/eventBus';

interface MasterButtonProps {
  x: number;
  y: number;
}

export default function MasterButton({ x, y }: MasterButtonProps) {
  const [lit, setLit] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [visible, setVisible] = useState(true);
  const [currentState, setCurrentState] = useState<string>('off');

  useEffect(() => {
    const handleEvent = (event: ReactorEvent) => {
      if (event.type === 'state_change') {
        const newState = event.payload;
        setCurrentState(newState);

        if (newState === 'on') {
          setLit(true);
          setBlinking(false);
        } else if (newState === 'startup' || newState === 'shutdown') {
          setLit(true);
          setBlinking(true);
        } else {
          setLit(false);
          setBlinking(false);
        }
      }
    };

    eventBus.subscribe(handleEvent);
    return () => {
      eventBus.unsubscribe(handleEvent);
    };
  }, []);

  useEffect(() => {
    if (blinking) {
      const interval = setInterval(() => {
        setVisible((prev) => !prev);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setVisible(true);
    }
  }, [blinking]);

  const handleClick = () => {
    eventBus.publish({
      type: 'state_change',
      source: 'master-button',
      payload: 'init',
    });
  };

  return (
    <div
      className="master-button-wrapper"
      style={{ top: `${y}px`, left: `${x}px` }}
      onMouseDown={handleClick}
    >
      <img src={bezel} className="master-button-img" alt="Master Button Bezel" />
      {visible && (
        <img
          src={lit ? glowOn : glowOff}
          className="master-button-overlay"
          alt="Master Button Glow"
        />
      )}
    </div>
  );
}
