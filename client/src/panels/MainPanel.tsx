import ButtonPanel from '../components/ButtonPanel';
import MeterRow from '../components/MeterRow';
import CircularGauge from '../components/CircularGauge';
import IndicatorLight from '../components/IndicatorLight';
import MasterButton from '../components/MasterButton';
import ScramButton from '../components/ScramButton';
import LightPanel from '../components/LightPanel';
import KnobSelectorBlock from './KnobSelectorBlock';
import ConditionLightBlock from './ConditionLightBlock';
import DigitalDisplayBlock from './DigitalDisplayBlock';
import SliderBlock from './SliderBlock';


export default function MainPanel() {
  return (
    <>
      <KnobSelectorBlock />
      <ConditionLightBlock />
      <DigitalDisplayBlock />
      <SliderBlock />
      <ButtonPanel
        x={280}
        y={570}
        rows={6}
        columns={6}
        spacingX={90}
        spacingY={60}
        values={[
          { label: 'A1', color: 'green' },
          { label: 'A2', color: 'amber' },
          { label: 'A3', color: 'red' },
          { label: 'B1', color: 'white' },
          { label: 'B2', color: 'green' },
          { label: 'B3', color: 'amber' },
          { label: 'A1', color: 'green' },
          { label: 'A2', color: 'amber' },
          { label: 'A3', color: 'red' },
          { label: 'B1', color: 'white' },
          { label: 'B2', color: 'green' },
          { label: 'B3', color: 'amber' },
        ]}
      />
      <MeterRow
        x={750}
        y={480}
        columns={5}
        spacingX={55}
        meters={[
          { value: 0.0 },
          { value: 0.25 },
          { value: 0.5 },
          { value: 0.75 },
          { value: 1.0 },
        ]}
      />

      <CircularGauge x={750} y={690} value={1} limit={0.8} />
      <IndicatorLight x={630} y={750} color="red" label="OPR" />
      <IndicatorLight x={870} y={750} color="red" label="OPR" />
      <MasterButton x={670} y={880} />
      <ScramButton x={830} y={880} />

      <ButtonPanel
        x={1205}
        y={670}
        rows={1}
        columns={6}
        spacingX={87}
        spacingY={70}
        values={[
          { label: 'A1', color: 'green' },
          { label: 'A2', color: 'amber' },
          { label: 'A3', color: 'red' },
          { label: 'B1', color: 'white' },
          { label: 'B2', color: 'green' },
          { label: 'B3', color: 'amber' },
          { label: 'A1', color: 'green' },
          { label: 'A2', color: 'amber' },
          { label: 'A3', color: 'red' },
          { label: 'B1', color: 'white' },
          { label: 'B2', color: 'green' },
          { label: 'B3', color: 'amber' },
        ]}
      />
      <LightPanel
        x={1075}
        y={740}
        rows={3}
        columns={6}
        xSpacing={70}
        ySpacing={80}
        values={[
          { color: 'red', label: 'A1' },
          { color: 'green', label: 'A2' },
          { color: 'amber', label: 'A3' },
          { color: 'white', label: 'A4' },
          { color: 'green', label: 'B1' },
          { color: 'off', label: 'B2' },
          { color: 'red', label: 'B3' },
          { color: 'amber', label: 'B4' },
          { color: 'white', label: 'C1' },
        ]}
      />
    </>
  );
}
