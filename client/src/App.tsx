import Panel from './components/Panel';
import MainPanel from './panels/MainPanel';
import stateMachine from './controller/StateMachine';
import './MessageBus';

function App() {
  // Initialize the state management system
  stateMachine.init();

  return (
    <div>
      <Panel
        labels={[
          {
            text: 'FUEL ROD CONTROL',
            x: 600,
            y: 310,
            size: 24,
            width: 300,
          },
          {
            text: 'CAP A',
            x: -60,
            y: 672,
            size: 20,
            width: 300,
          },
          {
            text: 'CAP B',
            x: 1260,
            y: 672,
            size: 20,
            width: 300,
          },
          {
            text: 'NORTH GRID',
            x: -60,
            y: 455,
            size: 16,
            width: 300,
          },
          {
            text: 'SOUTH GRID',
            x: -60,
            y: 895,
            size: 16,
            width: 300,
          },
          {
            text: 'EAST GRID',
            x: 1260,
            y: 455,
            size: 16,
            width: 300,
          },
          {
            text: 'WEST GRID',
            x: 1260,
            y: 895,
            size: 16,
            width: 300,
          },
          {
            text: 'MASTER',
            x: 120,
            y: 286,
            size: 24,
            width: 300,
          },
          {
            text: 'SCRAM',
            x: 1080,
            y: 284,
            size: 24,
            width: 300,
          },
          {
            text: 'THERMAL MEAN',
            x: 380,
            y: 870,
            size: 20,
            width: 100,
          },
          {
            text: 'TURBINE RPM',
            x: 1020,
            y: 870,
            size: 20,
            width: 100,
          },
          {
            text: 'CAP B',
            x: 1250,
            y: 715,
            size: 12,
            width: 100,
          },
          {
            text: 'CAP A',
            x: 1250,
            y: 600,
            size: 12,
            width: 100,
          },
          {
            text: 'ROD GRP A',
            x: 150,
            y: 600,
            size: 12,
            width: 100,
          },
          {
            text: 'ROD GRP B',
            x: 150,
            y: 715,
            size: 12,
            width: 100,
          },
          {
            text: 'RAD',
            x: 220,
            y: 500,
            size: 14,
            width: 100,
          },
          {
            text: 'THERM SET',
            x: 305,
            y: 480,
            size: 14,
            width: 50,
          },
          {
            text: 'PUMP SET',
            x: 1145,
            y: 475,
            size: 14,
            width: 50,
          },
          {
            text: 'PRES',
            x: 1180,
            y: 500,
            size: 14,
            width: 100,
          },


        ]}
      >
        <MainPanel />
      </Panel>
    </div>
  );
}

export default App;
