import Panel from './components/Panel';
import PanelButton from './components/PanelButton';

function App() {
  return (
    <div className="flex justify-center items-center w-screen h-screen bg-black">
      <Panel>
        <PanelButton x={50} y={50} color="green" label="LAUNCH" />
      </Panel>
    </div>
  );
}

export default App;
