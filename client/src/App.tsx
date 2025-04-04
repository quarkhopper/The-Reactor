import Panel from './components/Panel';
import MainPanel from './panels/MainPanel';
import './state/subsystems';
import { initStateMachine } from './state/StateMachine';

function App() {
  // Initialize the state management system
  initStateMachine();

  return (
    <div>
      <Panel>
        <MainPanel />
      </Panel>
    </div>
  );
}

export default App;
