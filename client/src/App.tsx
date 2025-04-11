import Panel from './components/Panel';
import MainPanel from './panels/MainPanel';
import stateMachine from './controller/StateMachine';
import './MessageBus';

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
