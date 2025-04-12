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
  event: string;
}

export default function VerticalMeter({ id, x, y, event }: VerticalMeterProps) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const unsubscribe = MessageBus.subscribe(handleMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  const isValidMessage = (msg: Record<string, any>) => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' ||
        msg.type === 'process_begin' ||
        (msg.type === event)) 
    );
  };

  function handleMessage(msg: Record<string, any>) {
    if (!isValidMessage(msg)) return; // Guard clause

    if (msg.type === 'state_change') {
      const state = msg.state;
      if (state === 'startup' || state === 'on') {
        setCurrentValue(0);
      }
    } else if (msg.type === 'process_begin') {
      if (msg.process === 'init') {
        setCurrentValue(0);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'init',
        });
      } else if (msg.process === 'shutdown') {
        setCurrentValue(0);
        MessageBus.emit({
          type: 'acknowledge',
          id,
          process: 'shutdown',
        });
      } else if (msg.process === 'test') {
        handleTest();  
      }
    } else if (msg.type === event) {
      console.log(`[VerticalMeter] Received ${event} message:`, msg);
      // Handle specific event messages
      setCurrentValue(msg.value);
    }
  }

  function handleTest() {
    let sequence = [0, 0.25, 0.5, 0.75, 1, 0];
    let i = 0;
    const interval = setInterval(() => {
      setCurrentValue(sequence[i]);
      i++;
    }, 150);

    MessageBus.emit({
      type: 'test_result',
      id,
      passed: true,
    });

    return () => clearInterval(interval);
  }

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
