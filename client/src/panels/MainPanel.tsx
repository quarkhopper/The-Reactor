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
    </>
  );
}
