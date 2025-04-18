import MessageBus from '../../MessageBus';
import xferSystem from './xferSystem';

const FUEL_GRID_SIZE = 7; // Size of the grid (7x7) with corners removed
const CONTROL_GRID_SIZE = 6; // Size of the control rod grid (6x6) between fuel rods

// Add a debounce timer for recalculations
let recalculationTimer: NodeJS.Timeout | null = null;
const RECALCULATION_DELAY = 1000; // 1 second delay

interface FuelRod {
  temperature: number; // Normalized temperature (0 to 1)
  state: 'engaged' | 'withdrawn' | 'transitioning'; // State of the fuel rod
  transitionStartTime?: number; // Optional transition start time
  previousState?: 'engaged' | 'withdrawn'; // Optional previous state
}

interface ControlRod {
  position: number; // 0 = fully inserted, 1 = fully withdrawn
  group: number;
}

// record to store control rod group selections
const controlRodGroupSelections: Record<number,  boolean> = {
  0: true,
  1: true,
};

const fuelRods: FuelRod[][] = Array.from({ length: FUEL_GRID_SIZE }, () =>
  Array.from({ length: FUEL_GRID_SIZE }, () => ({
    temperature: 0.02, // Initial temperature normalized to 0.02
    state: 'engaged' // All rods start engaged
  }))
);

function isCorner(x: number, y: number): boolean {
  return (
    (x === 0 && y === 0) ||
    (x === 0 && y === FUEL_GRID_SIZE - 1) ||
    (x === FUEL_GRID_SIZE - 1 && y === 0) ||
    (x === FUEL_GRID_SIZE - 1 && y === FUEL_GRID_SIZE - 1)
  );
}

// Control rods are represented in a 6x6 grid (in the gaps between fuel rods)
const controlRods: ControlRod[][] = Array.from({ length: CONTROL_GRID_SIZE }, (_, rowIndex) =>
  Array.from({ length: CONTROL_GRID_SIZE }, (_, colIndex) => ({
    position: 0, // 0 = fully inserted, 1 = fully withdrawn
    group: (rowIndex + colIndex) % 2 // Alternate between 0 and 1
  }))
);

let reactivity: number[][] = Array.from({ length: FUEL_GRID_SIZE }, () =>
  Array(FUEL_GRID_SIZE).fill(0)
);

let baseReactivityGrid: number[][] = Array.from({ length: FUEL_GRID_SIZE }, () =>
  Array(FUEL_GRID_SIZE).fill(0)
);

// Add a new grid for fuel rod distances
let distanceGrid: number[][][][] = Array.from({ length: FUEL_GRID_SIZE }, () =>
  Array.from({ length: FUEL_GRID_SIZE }, () =>
    Array.from({ length: CONTROL_GRID_SIZE }, () =>
      Array(CONTROL_GRID_SIZE).fill(0)
    )
  )
);

let fuelRodDistanceGrid : number[][][][] = Array.from({ length: FUEL_GRID_SIZE }, () =>
  Array.from({ length: FUEL_GRID_SIZE }, () =>
    Array.from({ length: FUEL_GRID_SIZE }, () =>
      Array(FUEL_GRID_SIZE).fill(1000000)
    )
  )
);


// Variables for tuning (locked values)
const HEAT_GAIN_SCALING_FACTOR = 0.018; // Keep increased value for critical temperatures
const HEAT_LOSS_SCALING_FACTOR = 0.1; // Keep original for stability
const INTERFERENCE_SCALING_FACTOR = 1.5 // 3.5;
const NORMALIZATION_FACTOR = 1.3; // Keep current value

// Introduce sub 0.1Hz thermal instabilities in fuel rods
const THERMAL_INSTABILITY_SCALING = 0.01; // Proportion of temperature max swing

// Assign each rod its own frequency and phase for thermal instabilities
const rodFrequencies: number[][] = Array.from({ length: FUEL_GRID_SIZE }, () =>
  Array.from({ length: FUEL_GRID_SIZE }, () =>
    Math.random() * (0.08 - 0.005) + 0.005 // Random frequency between 0.005 and 0.08 Hz
  )
);

const rodPhases: number[][] = Array.from({ length: FUEL_GRID_SIZE }, () =>
  Array.from({ length: FUEL_GRID_SIZE }, () => Math.random() * 2 * Math.PI) // Random phase between 0 and 2π
);

function precalculateDistances() {
  // Calculate distances between fuel rods and control rods ONLY
  // This is used for control rod interference calculations
  for (let x = 0; x < FUEL_GRID_SIZE; x++) {
    for (let y = 0; y < FUEL_GRID_SIZE; y++) {
      if (isCorner(x, y)) {
        continue; // Skip corners
      }
      for (let cx = 0; cx < CONTROL_GRID_SIZE; cx++) {
        for (let cy = 0; cy < CONTROL_GRID_SIZE; cy++) {
          const distance = Math.sqrt((cx + 0.5 - x) ** 2 + (cy + 0.5 - y) ** 2);
          distanceGrid[x][y][cx][cy] = distance;
        }
      }
    }
  }
}

function findClosestControlRods(x: number, y: number, get: number): { cx: number; cy: number; distance: number }[] {
  if (isCorner(x, y)) {
    return []; // No control rods near corners
  }

  const rods: { cx: number; cy: number; distance: number }[] = [];

  // Iterate over all control rods
  for (let cx = 0; cx < CONTROL_GRID_SIZE; cx++) {
    for (let cy = 0; cy < CONTROL_GRID_SIZE; cy++) {
      if (controlRodGroupSelections[controlRods[cx][cy].group] === true) {
        const distance = distanceGrid[x][y][cx][cy];
        rods.push({ cx, cy, distance });
      }
    }
  }

  // Sort by distance and return the closest "get" rods
  return rods.sort((a, b) => a.distance - b.distance).slice(0, get);
}

// Function to set a control rod position
function setControlRodPosition(x: number, y: number, position: number) {
  if (x >= 0 && x < CONTROL_GRID_SIZE && y >= 0 && y < CONTROL_GRID_SIZE) {
    controlRods[x][y].position = Math.max(0, Math.min(1, position)); // Clamp between 0 and 1
    MessageBus.emit({
      type: 'control_rod_update',
      id: 'system',
      gridX: x,
      gridY: y,
      value: controlRods[x][y].position
    });
  }
}

// New function for fuel rod distance calculations
function precalculateFuelRodDistances() {
  // Calculate distances between each fuel rod position and every other fuel rod
  // IMPORTANT: This is where withdrawn fuel rods are handled
  for (let x = 0; x < FUEL_GRID_SIZE; x++) {
    for (let y = 0; y < FUEL_GRID_SIZE; y++) {
      if (isCorner(x, y)) {
        continue; // Skip corners
      }
      // Calculate distance to every other fuel rod position
      for (let fx = 0; fx < FUEL_GRID_SIZE; fx++) {
        for (let fy = 0; fy < FUEL_GRID_SIZE; fy++) {
          if (isCorner(fx, fy)) {
            continue; // Skip corners
          }
          if (fx === x && fy === y) {
            // Distance to self is infinite (no self-contribution)
            fuelRodDistanceGrid[x][y][fx][fy] = 1000000;
          } else {
            // CRITICAL: If the rod is withdrawn, set distance to effectively infinity
            // This completely removes its contribution to the reactivity calculation
            fuelRodDistanceGrid[x][y][fx][fy] = fuelRods[fx][fy].state === 'withdrawn'
              ? 1000000  // Effectively infinite distance
              : Math.sqrt((fx - x) ** 2 + (fy - y) ** 2);
          }
        }
      }
    }
  }
}

function precalculateBaseReactivities() {
  // First calculate distances between fuel rods (this is where withdrawn rods are handled)
  precalculateFuelRodDistances();
  
  // Then calculate base reactivity using those distances
  for (let x = 0; x < FUEL_GRID_SIZE; x++) {
    for (let y = 0; y < FUEL_GRID_SIZE; y++) {
      if (isCorner(x, y)) {
        continue; // Skip corners
      }
      let baseReactivity = 0;
      // Calculate base reactivity from all other fuel rods using pre-calculated distances
      let idx = 0;
      for (let fx = 0; fx < FUEL_GRID_SIZE; fx++) {
        for (let fy = 0; fy < FUEL_GRID_SIZE; fy++) {
          if (isCorner(fx, fy)) {
            continue; // Skip corners
          }
          // Skip self (already handled with infinite distance)
          if (fx === x && fy === y) {
            idx++;
            continue;
          }
        
          const distance = fuelRodDistanceGrid[x][y][fx][fy];
          baseReactivity += 1 / (1 + distance);
          idx++;
        }
      }

      baseReactivity /= NORMALIZATION_FACTOR;
      baseReactivityGrid[x][y] = baseReactivity;
    }
  }
}

// Main tick function
function tick() {
  const now = Date.now() / 1000; // Current time in seconds

  // Apply thermal instabilities to each fuel rod
  for (let x = 0; x < FUEL_GRID_SIZE; x++) {
    for (let y = 0; y < FUEL_GRID_SIZE; y++) {
      const rod = fuelRods[x][y];
      if (rod.state === 'engaged') {
        applyThermalInstability(rod, now, x, y);
      }
    }
  }

  try {
    let totalTemp = 0;
    let minTemp = 1;
    let maxTemp = 0;

    // Check for completed transitions
    const now = Date.now();
    for (let x = 0; x < FUEL_GRID_SIZE; x++) {
      for (let y = 0; y < FUEL_GRID_SIZE; y++) {
        const rod = fuelRods[x][y];
        if (rod.state === 'transitioning' && rod.transitionStartTime) {
          if (now - rod.transitionStartTime >= 5000) { // 5 seconds
            // Transition complete - toggle between engaged and withdrawn
            const newState = rod.previousState === 'engaged' ? 'withdrawn' : 'engaged';
            rod.state = newState;
            delete rod.transitionStartTime;
            delete rod.previousState;
            
            if (newState === 'withdrawn') {
              rod.temperature = 0; // Reset temperature for withdrawn rods
              MessageBus.emit({
                type: 'temperature_update',
                gridX: x,
                gridY: y,
                id: 'system',
                value: rod.temperature
              });
            }

            // Emit state change
            MessageBus.emit({
              type: 'fuel_rod_state_update',
              id: 'system',
              value: newState,
              gridX: x,
              gridY: y
            });
            
            // Schedule recalculation
            scheduleRecalculation();                      
          }
        }
      }
    }
    
    for (let x = 0; x < FUEL_GRID_SIZE; x++) {
      for (let y = 0; y < FUEL_GRID_SIZE; y++) {
        const rod = fuelRods[x][y];

        // Skip temperature updates for withdrawn rods
        if (rod.state !== 'engaged') {
          continue;
        }

        let baseReactivity = baseReactivityGrid[x][y];

        // Calculate control rod interference
        let controlInterference = 0;
        
        for (let cx = 0; cx < CONTROL_GRID_SIZE; cx++) {
          for (let cy = 0; cy < CONTROL_GRID_SIZE; cy++) {
            const distance = distanceGrid[x][y][cx][cy];
            const influence = 1 / (1 + distance);
            controlInterference += (1 - controlRods[cx][cy].position) * influence * INTERFERENCE_SCALING_FACTOR;
          }
        }

        // Final reactivity is base reactivity minus control interference
        const finalReactivity = Math.max(0, baseReactivity - controlInterference);
        reactivity[x][y] = finalReactivity;

        updateFuelRodTemperature(rod, x, y);

        totalTemp += rod.temperature;
        minTemp = Math.min(minTemp, rod.temperature);
        maxTemp = Math.max(maxTemp, rod.temperature);

        // Emit temperature update command
        MessageBus.emit({
          type: 'temperature_update',
          gridX: x,
          gridY: y,
          id: 'system',
          value: rod.temperature
        });
      }
    }

    MessageBus.emit({
      type: 'thermal_peak',
      id: 'system',
      value: maxTemp
    });

    // Calculate average temperature
    const avgTemp = totalTemp / (FUEL_GRID_SIZE * FUEL_GRID_SIZE);
    // Emit average temperature to update the digital display
    MessageBus.emit({
      type: 'core_temp_update',
      value: avgTemp
    });

    if (maxTemp > 0.95) {
      MessageBus.emit({
      type: 'core_state_update',
      id: 'system',
      value: 'critical'
      });
    } else if (maxTemp > 0.8) {
      MessageBus.emit({
      type: 'core_state_update',
      id: 'system',
      value: 'warning'
      });
    } else {
      MessageBus.emit({
      type: 'core_state_update',
      id: 'system',
      value: 'normal'
      });
    }
  } catch (error) {
    console.error('[coreSystem] Error in tick:', error);
  }
}

// Type guard to validate if a message is relevant to coreSystem
function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = [
    'state_change', 
    'fuel_rod_state_toggle', 
    'use_control_rod_group', 
    'control_rod_group_b_select'];
  return validTypes.includes(msg.type);
}

MessageBus.subscribe(handleMessage);

function handleMessage (msg: Record<string, any>) {
  if (!isValidMessage(msg)) return; // Guard clause

  if (msg.type === 'state_change') {
    if (msg.state === 'startup') {
      precalculateDistances();
      precalculateBaseReactivities();

      console.log('[coreSystem] Transitioning to startup state - re-engaging withdrawn fuel rods');
      for (let x = 0; x < FUEL_GRID_SIZE; x++) {
        for (let y = 0; y < FUEL_GRID_SIZE; y++) {
          fuelRods[x][y].state = 'engaged';
          MessageBus.emit({
            type: 'fuel_rod_state_update',
            id: `fuel_rod_button_${x}_${y}`,
            value: 'engaged',
            gridX: x,
            gridY: y
          });
        }
      }
    } else if (msg.state === 'scram') {
      console.log('[coreSystem] Received scram command - setting target core temperature to 0');
      for (let x = 0; x < CONTROL_GRID_SIZE; x++) {
        for (let y = 0; y < CONTROL_GRID_SIZE; y++) {
          setControlRodPosition(x, y, 0); // Set control rod position to 0 (fully inserted)
        }
      }
    }

  } else if (msg.type === 'fuel_rod_state_toggle') {
    const { gridX: x, gridY: y } = msg;
    if (x >= 0 && x < FUEL_GRID_SIZE && y >= 0 && y < FUEL_GRID_SIZE) {
      const rod = fuelRods[x][y];
      if (rod.state !== 'transitioning') {
        rod.previousState = rod.state;
        rod.state = 'transitioning';
        rod.transitionStartTime = Date.now();

        MessageBus.emit({
          type: 'fuel_rod_state_update',
          id: 'system',
          value: 'transitioning',
          gridX: msg.gridX,
          gridY: msg.gridY
        });
      }
    }
  } else if (msg.type === 'use_control_rod_group') {
    // Handle control rod group selection messages
    console.log(`[coreSystem] Received control rod group selection: ${msg.index} - ${msg.value}`);
    controlRodGroupSelections[msg.index] = msg.value;
    if (msg.value === false) {
      // Update control rod positions based on group selection
      //  get all the control rods of the same group as msg.index
      const groupedRods = controlRods.flatMap((row, rowIndex) =>
        row.map((rod, colIndex) => {
          if (rod.group === msg.index) {
            return { cx: rowIndex, cy: colIndex };
          }
          return null;
        })
      ).filter(Boolean) as { cx: number; cy: number }[];
      // Set the positions of the grouped control rods to 1 (fully withdrawn)
      groupedRods.forEach(({ cx, cy }) => {
        setControlRodPosition(cx, cy, 1); // Set control rod position to 1 (fully withdrawn)        
      });
    }
  }
}

// Export the core system as a subsystem

const coreSystem = {
  tick,
  getState: () => ({
    controlRods,
    controlRodGroupSelections,
    fuelRods,
    reactivity
  })
};

export default coreSystem;
export { findClosestControlRods, setControlRodPosition };

// Debounced function to schedule recalculations
function scheduleRecalculation() {
  // Clear existing timer if there is one
  if (recalculationTimer) {
    clearTimeout(recalculationTimer);
  }
  
  // Set a new timer
  recalculationTimer = setTimeout(() => {
    // Count withdrawn rods for debugging
    let withdrawnCount = 0;
    for (let x = 0; x < FUEL_GRID_SIZE; x++) {
      for (let y = 0; y < FUEL_GRID_SIZE; y++) {
        if (fuelRods[x][y].state === 'withdrawn') {
          withdrawnCount++;
        }
      }
    }
    
    precalculateDistances();
    precalculateBaseReactivities();
    recalculationTimer = null;
  }, RECALCULATION_DELAY);
}

// Updated fuel rod temperature calculation to match energySolver
function updateFuelRodTemperature(rod: FuelRod, x: number, y: number) {
  const xferProperties = xferSystem.getState();
  const heatGenerated = reactivity[x][y] * HEAT_GAIN_SCALING_FACTOR;
  const fuelRodCount = FUEL_GRID_SIZE * FUEL_GRID_SIZE - 4; // Exclude corners
  let rodHeatTransfer = xferProperties.heatTransferred / fuelRodCount;
  const naturalCooling = HEAT_LOSS_SCALING_FACTOR * rod.temperature;

  rod.temperature = clamp(rod.temperature + heatGenerated - rodHeatTransfer - naturalCooling);

  // Emit temperature update command
  MessageBus.emit({
    type: 'temperature_update',
    gridX: x,
    gridY: y,
    id: 'system',
    value: rod.temperature
  });
}

// Utility function to clamp values between 0 and 1
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function applyThermalInstability(rod: FuelRod, time: number, x: number, y: number) {
  const frequency = rodFrequencies[x][y];
  const phase = rodPhases[x][y];
  const instability = THERMAL_INSTABILITY_SCALING * Math.sin(2 * Math.PI * frequency * time + phase);
  rod.temperature = clamp(rod.temperature + instability);
}
