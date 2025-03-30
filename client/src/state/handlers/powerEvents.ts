import eventBus, { ReactorEvent } from '../eventBus';
import { handleMasterPower } from './masterPower';

const handlePowerEvent = (event: ReactorEvent) => {
  if (event.type === 'state_change' && event.payload === 'init') {
    handleMasterPower();
  }
};

eventBus.subscribe(handlePowerEvent);
