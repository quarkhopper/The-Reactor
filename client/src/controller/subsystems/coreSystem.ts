import MessageBus from '../../MessageBus';

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
}

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
const controlRods: ControlRod[][] = Array.from({ length: CONTROL_GRID_SIZE }, () =>
  Array.from({ length: CONTROL_GRID_SIZE }, () => ({
    position: 0, // 0 = fully inserted, 1 = fully withdrawn
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
const INTERFERENCE_SCALING_FACTOR = 3.5; // Increased to better suppress reactivity
const NORMALIZATION_FACTOR = 1.3; // Keep current value

// Add coolant-related constants
const COOLANT_COOLING_FACTOR = 0.03; 

// Add coolant state
let coolantState = {
  temperature: 0,
  flowRate: 0.5 // Default to 50% flow
};

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
  try {
    let totalTemp = 0;
    let minTemp = 1;
    let maxTemp = 0;
    let critical = false;
    let warning = false;

    // Create a 2D array to store temperatures for this tick
    const tempGrid = Array(FUEL_GRID_SIZE).fill(0).map(() => Array(FUEL_GRID_SIZE).fill(0));

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

        // Update temperature based on reactivity
        const heatGain = HEAT_GAIN_SCALING_FACTOR * finalReactivity;
        rod.temperature += heatGain;

        // Apply proportional heat loss (natural cooling)
        rod.temperature -= HEAT_LOSS_SCALING_FACTOR * rod.temperature;

        // Apply coolant-based cooling
        const tempDiff = rod.temperature - coolantState.temperature;
        const coolantEffect = COOLANT_COOLING_FACTOR * coolantState.flowRate * tempDiff;
        rod.temperature -= coolantEffect;

        // Clamp temperature to [0, 1]
        rod.temperature = Math.max(0, Math.min(1, rod.temperature));

        // Store temperature in grid
        tempGrid[x][y] = rod.temperature;

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

        if (rod.temperature > 0.9) {
          critical = true;
        }
        if (rod.temperature > 0.7) {
          warning = true;
        }
      }
    }

    // Calculate and log average temperature
    const avgTemp = totalTemp / (FUEL_GRID_SIZE * FUEL_GRID_SIZE);
    
    // Emit average temperature to update the circular gauge
    MessageBus.emit({
      type: 'core_temp_update',
      value: avgTemp
    });


    if (critical) {
      MessageBus.emit({
      type: 'core_state_update',
      id: 'system',
      value: 'critical'
      });
    } else if (warning) {
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
  return (
    typeof msg.type === 'string' &&
    (msg.type === 'state_change' ||
     msg.type === 'coolant_temp_update' ||
     msg.type === 'flow_rate_update' ||
     (msg.type === 'slider_position_update' && msg.target === 'rod') ||
     msg.type === 'fuel_rod_state_toggle' )
  );
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
    }
    if (msg.state === 'scram') {
      console.log('[coreSystem] SCRAM initiated - inserting control rods');
      for (let x = 0; x < CONTROL_GRID_SIZE; x++) {
        for (let y = 0; y < CONTROL_GRID_SIZE; y++) {
          controlRods[x][y].position = 0;
          MessageBus.emit({
        type: 'control_rod_position_update',
        id: 'system',
        gridX: x,
        gridY: y,
        value: 0
          });
        }
      }
    }
  } else if (msg.type === 'coolant_temp_update') {
    coolantState.temperature = msg.value;
  } else if (msg.type === 'flow_rate_update') {
    coolantState.flowRate = msg.value;
  // } else if (msg.type === 'slider_position_update') {
  //   const rodIndex = msg.index;
  //   if (!isNaN(rodIndex) && rodIndex >= 0 && rodIndex < controlRodPositions.length) {
  //     controlRodPositions[rodIndex] = msg.value;
  //   }
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
  } 
}

// Export the core system as a subsystem
// Initialize controlRodPositions as an array representing the positions of control rods
const controlRodPositions = Array.from({ length: CONTROL_GRID_SIZE * CONTROL_GRID_SIZE }, () => 0);

const coreSystem = {
  tick,
  getState: () => ({
    controlRods,
    fuelRods,
    controlRodPositions,
    reactivity
  })
};

export default coreSystem;

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
