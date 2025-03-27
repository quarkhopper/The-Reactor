import Panel from './components/Panel';
import ConditionPanel from './components/ConditionPanel';
import ButtonPanel from './components/ButtonPanel';
import MasterButton from './components/MasterButton';

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
      </Panel>
    </div>
  );
}

export default App;
