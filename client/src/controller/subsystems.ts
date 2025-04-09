import './subsystems/coreSystem';
import { registerSubsystem } from './tickEngine';
import coreSystem from './subsystems/coreSystem';
import coolSystem from './subsystems/coolSystem';
import genSystem from './subsystems/genSystem';

// Register all subsystems with the tick engine
registerSubsystem(coreSystem);
registerSubsystem(coolSystem);
registerSubsystem(genSystem);

console.log('[subsystems] All subsystems initialized');