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
  selectEvent: { type: string; valueL: number; valueR: number };
}

export default function KnobSelector({ id, x, y, leftLabel, rightLabel }: KnobSelectorProps) {
  const [toggled, setToggled] = useState(false);
  const rotation = toggled ? 45 : -45;

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  const isValidMessage = (msg: Record<string, any>): boolean => {
    const validTypes = ['process_begin', 'state_change'];
    return validTypes.includes(msg.type);
  };

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return; // Guard clause

    if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setToggled(false);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
        MessageBus.emit({
          type: 'test_result',
          id,
          passed: true,
        });
      }
    }
  }

  const handleClick = () => {
    const newToggled = !toggled;
    setToggled(newToggled);

    MessageBus.emit({
      type: 'knob_change',
      id,
      value: newToggled ? 'right' : 'left',
    });
  }

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
