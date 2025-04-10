import { useEffect, useState } from 'react';
import MessageBus from '../MessageBus';

import knobImg from '../images/knob_selector.png';
import '../css/components/KnobSelector.css';

interface KnobSelectorProps {
  id: string;
  x: number;
  y: number;
  leftLabel: string;
  rightLabel: string;
}

export default function KnobSelector({ id, x, y, leftLabel, rightLabel }: KnobSelectorProps) {
  const [toggled, setToggled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const rotation = toggled ? 45 : -45;

  // Handle state changes
  useEffect(() => {
    const handleStateChange = (state: string) => {
      if (state === 'test') {
        setIsTestMode(true);
      } else if (state === 'startup') {
        setIsTestMode(false);
        setToggled(false);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'state_change' && msg.id === 'system') {
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
        setToggled(false);
        setIsTestMode(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        setToggled(false);
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

        setTimeout(() => {
          MessageBus.emit({
            type: 'test_result',
            id,
            passed: true,
          });
          setIsTestMode(false);
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
      const newToggled = !toggled;
      setToggled(newToggled);

      MessageBus.emit({
        type: 'knob_change',
        id,
        value: newToggled ? 'right' : 'left',
      });
    }
  };

  return (
    <div className="knob-selector-wrapper" style={{ top: y, left: x }}>
      <div className="knob-label left">{leftLabel}</div>
      <div className="knob-label right">{rightLabel}</div>
      <img
        src={knobImg}
        className="knob-selector-img"
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={handleClick}
        draggable={false}
      />
    </div>
  );
}
