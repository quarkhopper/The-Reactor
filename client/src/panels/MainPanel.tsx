import ConditionLightBlock from './ConditionLightBlock';
import DigitalDisplayBlock from './PowerDemandBlock';
import SliderBlock from './SliderBlock';
import PanelButtonBlock from './FuelRodCtrlBlock';
import CircularGaugeBlock from './CircularGaugeBlock';
import MasterButtonBlock from './MasterButtonBlock';
import ScramButtonBlock from './ScramButtonBlock';
import CoolantPumpBlock from './CoolantPumpBlock';

export default function MainPanel() {
  return (
    <>
      <ConditionLightBlock />
      <DigitalDisplayBlock />
      <SliderBlock />
      <PanelButtonBlock />
      <CircularGaugeBlock />
      <MasterButtonBlock />
      <ScramButtonBlock />
      <CoolantPumpBlock x={990} y={410} />
    </>
  );
}
