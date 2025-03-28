import Panel from './components/Panel';
import ConditionPanel from './components/ConditionPanel';
import ButtonPanel from './components/ButtonPanel';
import MasterButton from './components/MasterButton';
import ScramButton from './components/ScramButton';
import MeterRow from './components/MeterRow';
import DigitalDisplayPanel from './components/DigitalDisplayPanel';

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

        {/* bottom row */}
        <ButtonPanel
          x={500}
          y={900}
          rows={1}
          columns={12}
          spacingX={80}
          spacingY={60}
          values={[
            { label: 'A1', color: 'green' },
            { label: 'A2', color: 'amber' },
            { label: 'A3', color: 'red' },
            { label: 'B1', color: 'white' },
            { label: 'B2', color: 'green' },
            { label: 'B3', color: 'amber' },
          ]}
        />
        <ButtonPanel
          x={200}
          y={400}
          rows={3}
          columns={4}
          spacingX={80}
          spacingY={60}
          values={[
            { label: 'A1', color: 'green' },
            { label: 'A2', color: 'amber' },
            { label: 'A3', color: 'red' },
            { label: 'B1', color: 'white' },
            { label: 'B2', color: 'green' },
            { label: 'B3', color: 'amber' },
          ]}
        />
        <MasterButton x={120} y={580} />
        <ScramButton x={280} y={580} />
        <MeterRow
          x={540}
          y={390}
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
        <DigitalDisplayPanel
          x={730}
          y={340}
          columns={1}
          rows={4}
          spacingX={70}
          spacingY={80}
          values={[
            { value: 0.25, label: 'PWR' },
            { value: 0.57, label: 'TMP' },
            { value: 0.88, label: 'FLX' },
            { value: 0.02, label: 'RDN' },
            { value: 0.31, label: 'ALT' },
            { value: 0.95, label: 'AMP' },
          ]}
        />
      </Panel>
    </div>
  );
}

export default App;
