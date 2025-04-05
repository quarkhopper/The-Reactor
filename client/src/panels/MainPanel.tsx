import KnobSelectorBlock from './KnobSelectorBlock';
import ConditionLightBlock from './ConditionLightBlock';
import DigitalDisplayBlock from './DigitalDisplayBlock';
import SliderBlock from './SliderBlock';
import PanelButtonBlock from './PanelButtonBlock';
import IndicatorLightBlock from './IndicatorLightBlock';
import MeterBlock from './MeterBlock';
import CircularGaugeBlock from './CircularGaugeBlock';
import MasterButtonBlock from './MasterButtonBlock';
import ScramButtonBlock from './ScramButtonBlock';
import CoolantPumpBlock from './CoolantPumpBlock';

export default function MainPanel() {
  return (
    <>
      <KnobSelectorBlock />
      <ConditionLightBlock />
      <DigitalDisplayBlock />
      <SliderBlock />
      <PanelButtonBlock />
      <IndicatorLightBlock />
      <MeterBlock />
      <CircularGaugeBlock />
      <MasterButtonBlock />
      <ScramButtonBlock />
      <CoolantPumpBlock idPrefix="primary" x={990} y={410} />
      <CoolantPumpBlock idPrefix="secondary" x={1290} y={410} />
    </>
  );
}
