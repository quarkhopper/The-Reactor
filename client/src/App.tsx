import Panel from './components/Panel';
import PanelButton from './components/PanelButton';
import ConditionLight from './components/ConditionLight';
import ConditionPanel from './components/ConditionPanel';

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
      </Panel>
    </div>
  );
}

export default App;
