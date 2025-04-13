import './subsystems/coreSystem';
import { initTickEngine, registerSubsystem } from './tickEngine';
import coreSystem from './subsystems/coreSystem';
import coolSystem from './subsystems/coolSystem';
import genSystem from './subsystems/genSystem';
import ctrlSystem from './subsystems/ctrlSystem';
import { solver } from './subsystems/solver';

// Register all subsystems with the tick engine
registerSubsystem(coreSystem);
registerSubsystem(coolSystem);
registerSubsystem(genSystem);
registerSubsystem(ctrlSystem); 
registerSubsystem(solver); // Register the solver subsystem
initTickEngine(); // Initialize the tick engine

console.log('[subsystems] All subsystems initialized');