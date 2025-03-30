import Panel from './components/Panel';
import MainPanel from './panels/MainPanel';
import './state/registerEventHandlers';

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
