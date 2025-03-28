import Panel from './components/Panel';
import ConditionPanel from './components/ConditionPanel';
import ButtonPanel from './components/ButtonPanel';
import MasterButton from './components/MasterButton';
import ScramButton from './components/ScramButton';
import MeterRow from './components/MeterRow';
import DigitalDisplayPanel from './components/DigitalDisplayPanel';
import LightPanel from './components/LightPanel';
import IndicatorLight from './components/IndicatorLight';
import KnobSelector from './components/KnobSelector';
import KnobPanel from './components/KnobPanel';
import CircularGauge from './components/CircularGauge';


function App() {
  return (
    <div>
      <Panel>
        <ConditionPanel
          x={750}
          y={170}
          width={1450}
          rows={2}
          columns={5}
          values={[
            { color: 'red', label: 'SCRAM' },
            { color: 'green', label: 'POWER' },
            { color: 'amber', label: 'FAULT' },
            { color: 'white', label: 'COOL' },
            { color: 'off', label: 'STANDBY' },
            { color: 'green', label: 'RUN' },
            { color: 'amber', label: 'WARN' },
            { color: 'red', label: 'LOCKED' },
            { color: 'off', label: 'AUX' },
            { color: 'white', label: '' },
          ]}
        />
        <DigitalDisplayPanel
          x={58}
          y={340}
          columns={12}
          rows={1}
          spacingX={126}
          spacingY={150}
          values={[
            { value: 0.25, label: 'PWR' },
            { value: 0.57, label: 'TMP' },
            { value: 0.88, label: 'FLX' },
            { value: 0.02, label: 'RDN' },
            { value: 0.31, label: 'ALT' },
            { value: 0.95, label: 'AMP' },
            { value: 0.25, label: 'PWR' },
            { value: 0.57, label: 'TMP' },
            { value: 0.88, label: 'FLX' },
            { value: 0.02, label: 'RDN' },
            { value: 0.31, label: 'ALT' },
            { value: 0.95, label: 'AMP' },
          ]}
        />
        <ButtonPanel
          x={280}
          y={680}
          rows={8}
          columns={6}
          spacingX={90}
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
        <KnobSelector x={620} y={625} leftLabel='PZ' rightLabel='RZ' />
        <KnobSelector x={880} y={625} leftLabel='X^2' rightLabel='DIV' />
        <IndicatorLight x={630} y={750} color='red' label='OPR' />
        <IndicatorLight x={870} y={750} color='red' label='OPR' />
        <MasterButton x={670} y={880} />
        <ScramButton x={830} y={880} />
        <KnobPanel
          x={990}
          y={440}
          width={430}
          rows={3}
          columns={5}
          values={[
            { leftLabel: 'OFF',   rightLabel: 'ON' },
            { leftLabel: 'LOW',   rightLabel: 'HIGH' },
            { leftLabel: 'COOL',  rightLabel: 'HEAT' },
            { leftLabel: 'MAN',   rightLabel: 'AUTO' },
          ]}
        />
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
        <DigitalDisplayPanel
          x={988}
          y={750}
          columns={1}
          rows={3}
          spacingX={126}
          spacingY={80}
          values={[
            { value: 0.25, label: 'PWR' },
            { value: 0.57, label: 'TMP' },
            { value: 0.88, label: 'FLX' },
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


      </Panel>
    </div>
  );
}

export default App;
