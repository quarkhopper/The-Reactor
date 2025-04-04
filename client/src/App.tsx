import Panel from './components/Panel';
import MainPanel from './panels/MainPanel';
import './state/subsystems';
import stateMachine from './state/StateMachine';

function App() {
  // Initialize the state management system
  stateMachine.init();

  return (
    <div>
      <Panel>
        <MainPanel />
      </Panel>
    </div>
  );
}

export default App;
