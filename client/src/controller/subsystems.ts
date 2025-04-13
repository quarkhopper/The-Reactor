import './subsystems/coreSystem';
import { initTickEngine, registerSubsystem } from './tickEngine';
import coreSystem from './subsystems/coreSystem';
import xferSystem from './subsystems/xferSystem';
import genSystem from './subsystems/genSystem';
import ctrlSystem from './subsystems/ctrlSystem';
// import { solver } from './subsystems/energySolver';

// Register all subsystems with the tick engine
// registerSubsystem(solver); // Register the solver subsystem
registerSubsystem(coreSystem);
registerSubsystem(xferSystem);
registerSubsystem(genSystem);
registerSubsystem(ctrlSystem); 
initTickEngine(); // Initialize the tick engine

console.log('[subsystems] All subsystems initialized');