import Panel from './components/Panel';
import MainPanel from './panels/MainPanel';
import './state/subsystems';

function App() {
  return (
    <div>
      <Panel>
        <MainPanel />
      </Panel>
    </div>
  );
}

export default App;
