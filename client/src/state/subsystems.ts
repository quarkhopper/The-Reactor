// Import all subsystems to initialize them
import './subsystems/coreSystem';
// Add other subsystems here as needed
// import './subsystems/coolSystem';
// import './subsystems/powerSystem';
import { registerSubsystem } from './tickEngine';
import coreSystem from './subsystems/coreSystem';
import coolSystem from './subsystems/coolSystem';
import genSystem from './subsystems/genSystem';

// Register all subsystems with the tick engine
registerSubsystem(coreSystem);
registerSubsystem(coolSystem);
registerSubsystem(genSystem);

console.log('[subsystems] All subsystems initialized');