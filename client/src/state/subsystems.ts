// Import all subsystems to initialize them
import './subsystems/coreSystem';
// Add other subsystems here as needed
// import './subsystems/coolSystem';
// import './subsystems/powerSystem';
import { registerSubsystem } from './tickEngine';
import coreSystem from './subsystems/coreSystem';
import ctrlSystem from './subsystems/ctrlSystem';
import loadSystem from './subsystems/loadSystem';
import coolSystem from './subsystems/coolSystem';

// Register all subsystems with the tick engine
registerSubsystem(coreSystem);
registerSubsystem(ctrlSystem);
registerSubsystem(loadSystem);
registerSubsystem(coolSystem);

console.log('[subsystems] All subsystems initialized');