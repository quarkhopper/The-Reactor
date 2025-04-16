import Panel from './components/Panel';
import FitToScreen from './components/FitToScreen';
import MainPanel from './panels/MainPanel';
import stateMachine from './controller/StateMachine';
import './MessageBus';

function App() {
  // Initialize the state management system
  stateMachine.init();

  return (
    <FitToScreen>
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
            y: 682, // Adjusted down by 10
            size: 20,
            width: 300,
          },
          {
            text: 'CAP B',
            x: 1260,
            y: 682, // Adjusted down by 10
            size: 20,
            width: 300,
          },
          {
            text: 'NORTH GRID',
            x: -60,
            y: 465, // Adjusted down by 10
            size: 16,
            width: 300,
          },
          {
            text: 'SOUTH GRID',
            x: -60,
            y: 905, // Adjusted down by 10
            size: 16,
            width: 300,
          },
          {
            text: 'EAST GRID',
            x: 1260,
            y: 465, // Adjusted down by 10
            size: 16,
            width: 300,
          },
          {
            text: 'WEST GRID',
            x: 1260,
            y: 905, // Adjusted down by 10
            size: 16,
            width: 300,
          },
          {
            text: 'MASTER',
            x: 118,
            y: 296, // Adjusted down by 10
            size: 24,
            width: 300,
          },
          {
            text: 'SCRAM',
            x: 1080,
            y: 294, // Adjusted down by 10
            size: 24,
            width: 300,
          },
          {
            text: 'THERMAL MEAN',
            x: 380,
            y: 880, // Adjusted down by 10
            size: 20,
            width: 100,
          },
          {
            text: 'TURBINE RPM',
            x: 1020,
            y: 880, // Adjusted down by 10
            size: 20,
            width: 100,
          },
          {
            text: 'CAP B',
            x: 1250,
            y: 725, // Adjusted down by 10
            size: 12,
            width: 100,
          },
          {
            text: 'CAP A',
            x: 1250,
            y: 610, // Adjusted down by 10
            size: 12,
            width: 100,
          },
          {
            text: 'ROD GRP A',
            x: 150,
            y: 610, // Adjusted down by 10
            size: 12,
            width: 100,
          },
          {
            text: 'ROD GRP B',
            x: 150,
            y: 725, // Adjusted down by 10
            size: 12,
            width: 100,
          },
          {
            text: 'THERM PEAK',
            x: 245,
            y: 490, // Adjusted down by 10
            size: 14,
            width: 50,
          },
          {
            text: 'THERM SET',
            x: 305,
            y: 490, // Adjusted down by 10
            size: 14,
            width: 50,
          },
          {
            text: 'PUMP SET',
            x: 1145,
            y: 485, // Adjusted down by 10
            size: 14,
            width: 50,
          },
          {
            text: 'PRES',
            x: 1180,
            y: 500, // Adjusted down by 10
            size: 14,
            width: 100,
          },
        ]}
      >
        <MainPanel />
      </Panel>
    </FitToScreen>
  );
}

export default App;
