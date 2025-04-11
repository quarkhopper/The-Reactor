import { useEffect, useState } from 'react';
import MessageBus from '../MessageBus';

import '../css/components/VerticalMeter.css';

import bezel from '../images/meter_bezel.png';
import centerOn from '../images/meter_center_on.png';
import centerOff from '../images/meter_center_off.png';

interface VerticalMeterProps {
  id: string;
  x: number;
  y: number;
}

export default function VerticalMeter({ id, x, y }: VerticalMeterProps) {
  const [currentValue, setCurrentValue] = useState(0);

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: string) => {
      if (state === 'startup' || state === 'on') {
        setCurrentValue(0);
      }
    };

    const subscription = MessageBus.subscribe((msg) => {
      if (msg.type === 'state_change' && msg.id === id) {
        handleStateChange(msg.state);
      } else if (msg.type === 'set_indicator' && msg.id === id) {
        setCurrentValue(msg.value);
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
        setCurrentValue(0);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (cmd.type === 'process_begin' && cmd.process === 'shutdown') {
        setCurrentValue(0);
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
        const sequence: Array<'off' | 'green' | 'amber' | 'red' | 'white'> = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;

        const interval = setInterval(() => {
          switch (sequence[i]) {
            case 'off':
              setCurrentValue(0);
              break;
            case 'green':
              setCurrentValue(0.25);
              break;
            case 'amber':
              setCurrentValue(0.5);
              break;
            case 'red':
              setCurrentValue(0.75);
              break;
            case 'white':
              setCurrentValue(1);
              break;
          }
          i++;

          if (i >= sequence.length) {
            clearInterval(interval);
            setCurrentValue(0);
            MessageBus.emit({
              type: 'test_result',
              id,
              passed: true,
            });
          }
        }, 150);

        return () => clearInterval(interval);
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

  const clamped = Math.max(0, Math.min(1, currentValue));

  return (
    <div className="vertical-meter-wrapper" style={{ left: `${x}px`, top: `${y}px` }}>
      <img src={centerOn} className="vertical-meter-img" alt="Meter on" />
      <div className="vertical-meter-cropper" style={{ height: `${(1 - clamped) * 100}%` }}>
        <div className="vertical-meter-off-container">
          <img src={centerOff} className="vertical-meter-img-off" alt="Meter off" />
        </div>
      </div>
      <img src={bezel} className="vertical-meter-img" alt="Meter bezel" />
    </div>
  );
}
